"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CompletionButton } from "@/components/deadline-controls"

export function DetailCompletion({ id }: { id: string }) {
  const { data: session, status } = useSession()
  const userId = session?.user.id
  const [progress, setProgress] = useState<{
    userId: string
    id: string
    completed: boolean
  } | null>(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    fetch(`/api/deadlines/${id}/completion`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được tiến độ.")
        const data = await response.json()
        setProgress({ userId, id, completed: data.completed })
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
    return () => controller.abort()
  }, [id, userId, retry])

  if (status === "unauthenticated")
    return (
      <Button
        render={
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/deadlines/${id}`)}`}
          />
        }
      >
        Đăng nhập để hoàn thành
      </Button>
    )
  if (error)
    return (
      <div>
        <p role="alert" className="form-error">
          Không tải được tiến độ.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setError(false)
            setRetry((value) => value + 1)
          }}
        >
          Thử lại
        </Button>
      </div>
    )
  if (
    status === "loading" ||
    !progress ||
    progress.userId !== userId ||
    progress.id !== id
  )
    return <Button disabled>Đang tải tiến độ…</Button>
  return (
    <CompletionButton
      key={`${userId}-${id}`}
      id={id}
      completed={progress.completed}
    />
  )
}
