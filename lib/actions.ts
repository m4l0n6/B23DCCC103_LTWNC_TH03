"use server"

import { revalidatePath } from "next/cache"
import { auth, signOut } from "@/lib/auth"
import { can, type Action } from "@/lib/permissions"
import { getSubjects, updateStore } from "@/lib/data"
import { parseDeadline } from "@/lib/validation"
import type { ActionState } from "@/lib/types"

export async function logout() {
  await signOut({ redirectTo: "/" })
}

async function actionUser(action: Action) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Vui lòng đăng nhập để tiếp tục.")
  if (!can(session.user.role, action))
    throw new Error("Bạn không có quyền thực hiện thao tác này.")
  return session.user
}

function message(error: unknown): ActionState {
  console.error("Deadline action failed:", error)
  return {
    error:
      error instanceof Error && !(error as NodeJS.ErrnoException).code
        ? error.message
        : "Không thể lưu dữ liệu. Vui lòng thử lại.",
  }
}

function refreshDeadline(id: string) {
  revalidatePath("/deadlines")
  revalidatePath(`/deadlines/${id}`)
  revalidatePath(`/deadlines/${id}/opengraph-image`)
  revalidatePath("/dashboard", "layout")
  revalidatePath("/admin")
  revalidatePath("/sitemap.xml")
  revalidatePath("/")
  revalidatePath("/subjects/[slug]", "page")
}

export async function createDeadline(
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  try {
    await actionUser("create")
    const subjects = await getSubjects()
    const values = parseDeadline(
      form,
      subjects.map((subject) => subject.slug)
    )
    const id = await updateStore((store) => {
      const id = String(store.nextId++)
      store.deadlines.push({
        ...values,
        id,
        createdAt: new Date().toISOString(),
      })
      return id
    })
    refreshDeadline(id)
    return { success: "Đã thêm deadline mới." }
  } catch (error) {
    return message(error)
  }
}

export async function deleteDeadline(
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  try {
    await actionUser("delete")
    const id = String(form.get("id") ?? "")
    if (!/^\d+$/.test(id)) throw new Error("Mã deadline không hợp lệ.")
    await updateStore((store) => {
      if (!store.deadlines.some((deadline) => deadline.id === id))
        throw new Error("Deadline không còn tồn tại.")
      store.deadlines = store.deadlines.filter((deadline) => deadline.id !== id)
      store.completions = store.completions.filter(
        (completion) => completion.deadlineId !== id
      )
      store.inProgress = (store.inProgress ?? []).filter(
        (entry) => entry.deadlineId !== id
      )
    })
    refreshDeadline(id)
    return { success: "Đã xóa deadline." }
  } catch (error) {
    return message(error)
  }
}

export async function setCompleted(
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  try {
    const user = await actionUser("complete")
    const id = String(form.get("id") ?? "")
    const completed = form.get("completed")
    if (!/^\d+$/.test(id) || (completed !== "true" && completed !== "false"))
      throw new Error("Trạng thái deadline không hợp lệ.")
    await updateStore((store) => {
      if (!store.deadlines.some((entry) => entry.id === id))
        throw new Error("Deadline không còn tồn tại.")
      store.completions = store.completions.filter(
        (entry) => entry.userId !== user.id || entry.deadlineId !== id
      )
      store.inProgress = (store.inProgress ?? []).filter(
        (entry) => entry.userId !== user.id || entry.deadlineId !== id
      )
      if (completed === "true")
        store.completions.push({
          userId: user.id,
          deadlineId: id,
          completedAt: new Date().toISOString(),
        })
    })
    revalidatePath("/dashboard", "layout")
    return {
      success:
        completed === "true"
          ? "Đã đánh dấu hoàn thành."
          : "Đã chuyển về chưa hoàn thành.",
    }
  } catch (error) {
    return message(error)
  }
}
