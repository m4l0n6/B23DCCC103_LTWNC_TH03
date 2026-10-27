"use client"

import { Clock3 } from "lucide-react"
import { useClock } from "@/hooks/use-clock"
import { cn } from "@/lib/utils"

export function DeadlineStatus({
  dueAt,
  completed = false,
}: {
  dueAt: string
  completed?: boolean
}) {
  const now = useClock()
  if (completed)
    return <span className="deadline-status status-done">Đã hoàn thành</span>
  if (!now)
    return (
      <span className="deadline-status">
        <Clock3 className="size-3" />
        Hạn nộp bên dưới
      </span>
    )
  const difference = new Date(dueAt).getTime() - now
  const overdue = difference < 0
  const days = Math.ceil(Math.abs(difference) / 86_400_000)
  return (
    <span
      className={cn(
        "deadline-status",
        overdue
          ? "status-overdue"
          : difference < 3 * 86_400_000
            ? "status-soon"
            : "status-open"
      )}
    >
      <Clock3 className="size-3" />
      {overdue
        ? `Quá hạn ${days} ngày`
        : difference < 86_400_000
          ? "Còn dưới 1 ngày"
          : `Còn ${days} ngày`}
    </span>
  )
}
