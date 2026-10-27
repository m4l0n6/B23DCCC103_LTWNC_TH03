"use client"

import { useClock } from "@/hooks/use-clock"
import type { Deadline } from "@/lib/types"

export function DeadlineSummary({
  deadlines,
  subjectCount,
  completedIds,
}: {
  deadlines: Deadline[]
  subjectCount: number
  completedIds?: string[]
}) {
  const now = useClock()
  const pending = deadlines.filter((entry) => !completedIds?.includes(entry.id))
  const overdue = now
    ? pending.filter((entry) => new Date(entry.dueAt).getTime() < now).length
    : null
  const upcoming = now
    ? pending.filter((entry) => {
        const delta = new Date(entry.dueAt).getTime() - now
        return delta >= 0 && delta <= 7 * 86_400_000
      }).length
    : null
  const metrics = [
    {
      label: completedIds ? "Chưa hoàn thành" : "Deadline của lớp",
      value: completedIds ? pending.length : deadlines.length,
      caption: completedIds
        ? `Trên tổng ${deadlines.length} deadline`
        : `${subjectCount} môn học trong học kỳ`,
    },
    {
      label: "Sắp đến hạn",
      value: upcoming,
      caption: "Trong 7 ngày tới",
    },
    {
      label: "Đã quá hạn",
      value: overdue,
      caption: completedIds
        ? "Bài tập chưa hoàn thành"
        : "Kiểm tra lại bài đã nộp",
    },
    {
      label: completedIds ? "Đã hoàn thành" : "Môn học",
      value: completedIds ? completedIds.length : subjectCount,
      caption: completedIds
        ? "Tiến độ được lưu riêng cho bạn"
        : "Cùng theo dõi, cùng tiến bộ",
    },
  ]
  return (
    <div className="metrics-strip">
      {metrics.map((metric) => (
        <div key={metric.label} className="metric">
          <p>{metric.label}</p>
          <strong>{metric.value ?? "—"}</strong>
          <span>{metric.caption}</span>
        </div>
      ))}
    </div>
  )
}
