import "server-only"
import { readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { setTimeout as delay } from "node:timers/promises"
import { get, put, BlobPreconditionFailedError } from "@vercel/blob"
import type { Store, Subject } from "@/lib/types"

const dataDirectory = path.join(process.cwd(), "data")
const storePath = path.join(dataDirectory, "store.json")
const blobPath = process.env.BLOB_STORE_PATH || "class-deadline/store.json"

function usesBlob() {
  // The SDK resolves and refreshes OIDC credentials for connected Vercel projects.
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) return true
  if (process.env.VERCEL === "1")
    throw new Error(
      "Hãy kết nối Private Blob Store với project Vercel (BLOB_STORE_ID), hoặc cấu hình BLOB_READ_WRITE_TOKEN."
    )
  return false
}

async function readBlobStore() {
  let blob = await get(blobPath, { access: "private", useCache: false })
  if (!blob) {
    // Seed once. A second instance must never overwrite an existing store.
    try {
      await put(blobPath, await readFile(storePath, "utf8"), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
      })
    } catch (error) {
      // Another instance may have created the store while this request was seeding.
      blob = await get(blobPath, { access: "private", useCache: false })
      if (!blob) throw error
    }
    blob ??= await get(blobPath, { access: "private", useCache: false })
  }
  if (!blob || blob.statusCode !== 200 || !blob.stream || !blob.blob.etag)
    throw new Error("Không đọc được dữ liệu Private Blob.")
  return {
    store: (await new Response(blob.stream).json()) as Store,
    etag: blob.blob.etag,
  }
}

export async function getSubjects(): Promise<Subject[]> {
  return JSON.parse(
    await readFile(path.join(dataDirectory, "subjects.json"), "utf8")
  )
}

export async function readStore(): Promise<Store> {
  if (usesBlob()) return (await readBlobStore()).store
  return JSON.parse(await readFile(storePath, "utf8"))
}

export async function getDeadlines() {
  return (await readStore()).deadlines.sort((a, b) =>
    a.dueAt.localeCompare(b.dueAt)
  )
}

export async function getDeadline(id: string) {
  return (await readStore()).deadlines.find((deadline) => deadline.id === id)
}

// Local JSON writes are serialized in one process; Blob uses ETags across instances.
const processStore = globalThis as typeof globalThis & {
  deadlineWriteQueue?: Promise<unknown>
}
export async function updateStore<T>(update: (store: Store) => T): Promise<T> {
  if (usesBlob()) {
    // The callback only mutates this snapshot; replay it after a concurrent write.
    for (let attempt = 0; attempt < 5; attempt++) {
      const { store, etag } = await readBlobStore()
      const result = update(store)
      try {
        await put(blobPath, JSON.stringify(store, null, 2) + "\n", {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json",
          ifMatch: etag,
        })
        return result
      } catch (error) {
        if (!(error instanceof BlobPreconditionFailedError)) throw error
        await delay(50 * (attempt + 1) + Math.random() * 100)
      }
    }
    throw new Error(
      "Dữ liệu đang được cập nhật bởi người khác. Vui lòng thử lại."
    )
  }
  const operation = (processStore.deadlineWriteQueue ?? Promise.resolve()).then(
    async () => {
      const store = await readStore()
      const result = update(store)
      const temporaryPath = `${storePath}.${randomUUID()}.tmp`
      await writeFile(
        temporaryPath,
        JSON.stringify(store, null, 2) + "\n",
        "utf8"
      )
      await rename(temporaryPath, storePath)
      return result
    }
  )
  processStore.deadlineWriteQueue = operation.catch(() => undefined)
  return operation
}
