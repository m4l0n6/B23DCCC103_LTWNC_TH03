"use client"

import { useState } from "react"
import {
  Search,
  SlidersHorizontal,
  ArrowDownWideNarrow,
  CalendarCheck2,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClock } from "@/hooks/use-clock"
import type { Deadline, Subject } from "@/lib/types"
import { DeadlineCalendar } from "@/components/deadline-calendar"
import { calendarDate } from "@/lib/calendar"

export type BrowserRow = Pick<
  Deadline,
  "id" | "title" | "subjectSlug" | "dueAt" | "priority"
> & { completed: boolean; content: React.ReactNode }
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()

export function DeadlineBrowser({
  rows,
  subjects,
  personal = false,
  initialStatus = "all",
  initialMonth,
}: {
  rows: BrowserRow[]
  subjects: Subject[]
  personal?: boolean
  initialStatus?: string
  initialMonth: string
}) {
  const [query, setQuery] = useState("")
  const [subject, setSubject] = useState("all")
  const [status, setStatus] = useState(initialStatus)
  const [sort, setSort] = useState("due")
  const [month, setMonth] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const now = useClock()
  const subjectOptions = [
    { value: "all", label: "Tất cả môn học" },
    ...subjects.map((entry) => ({ value: entry.slug, label: entry.shortName })),
  ]
  const sortOptions = [
    { value: "due", label: "Hạn nộp gần nhất" },
    { value: "latest", label: "Mới thêm gần nhất" },
    { value: "priority", label: "Ưu tiên cao trước" },
  ]
  const tabs = [
    { value: "all", label: "Tất cả" },
    { value: "upcoming", label: "Sắp đến hạn" },
    { value: "overdue", label: "Quá hạn" },
    ...(personal ? [{ value: "completed", label: "Đã hoàn thành" }] : []),
  ]
  const filtered = rows
    .filter((row) => {
      const subjectName =
        subjects.find((entry) => entry.slug === row.subjectSlug)?.name ?? ""
      const delta = new Date(row.dueAt).getTime() - now
      return (
        (subject === "all" || row.subjectSlug === subject) &&
        normalize(`${row.title} ${subjectName}`).includes(normalize(query)) &&
        (status === "all" ||
          (status === "completed"
            ? row.completed
            : status === "overdue"
              ? !row.completed && now > 0 && delta < 0
              : !row.completed && delta >= 0 && delta <= 7 * 86_400_000))
      )
    })
    .sort((a, b) =>
      sort === "priority"
        ? Number(b.priority === "high") - Number(a.priority === "high") ||
          a.dueAt.localeCompare(b.dueAt)
        : sort === "latest"
          ? Number(b.id) - Number(a.id)
          : a.dueAt.localeCompare(b.dueAt)
    )
  const visibleRows = selectedDay
    ? filtered.filter((row) => calendarDate(row.dueAt) === selectedDay)
    : filtered
  return (
    <section
      className="deadline-browser task-workspace"
      aria-label="Lịch và danh sách deadline"
    >
      <DeadlineCalendar
        rows={filtered}
        subjects={subjects}
        month={month ?? (now ? calendarDate(now).slice(0, 7) : initialMonth)}
        selectedDay={selectedDay}
        onMonthChange={(value) => {
          setMonth(value)
          setSelectedDay(null)
        }}
        onDaySelect={(value) =>
          setSelectedDay((previous) => (previous === value ? null : value))
        }
      />
      <section className="task-list-pane" aria-label="Danh sách deadline">
        <div
          className="list-tabs"
          role="group"
          aria-label="Lọc theo trạng thái"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={status === tab.value}
              className={status === tab.value ? "active" : ""}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
              {tab.value === "all" && (
                <span className="tab-count">{rows.length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <div className="search-field">
            <Search className="size-4" />
            <Input
              aria-label="Tìm deadline"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên bài tập, môn học…"
            />
          </div>
          <Select
            value={subject}
            onValueChange={(value) => {
              if (value !== null) setSubject(value)
            }}
            items={subjectOptions}
          >
            <SelectTrigger className="filter-select" aria-label="Lọc môn học">
              <SlidersHorizontal className="size-3.5" />
              <SelectValue className="min-w-0 truncate" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (value !== null) setSort(value)
            }}
            items={sortOptions}
          >
            <SelectTrigger
              className="filter-select sort-select"
              aria-label="Sắp xếp deadline"
            >
              <ArrowDownWideNarrow className="size-3.5" />
              <SelectValue className="min-w-0 truncate" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="list-caption">
          <span>
            Tổng số: {visibleRows.length}
            {subject !== "all"
              ? ` · ${subjects.find((entry) => entry.slug === subject)?.shortName}`
              : ""}
          </span>
          {selectedDay && (
            <button
              type="button"
              className="selected-day-filter"
              aria-label="Bỏ lọc theo ngày"
              onClick={() => setSelectedDay(null)}
            >
              {selectedDay.split("-").reverse().join("/")}
              <X className="size-3" />
            </button>
          )}
        </div>
        <div className="deadline-rows">
          {visibleRows.length ? (
            visibleRows.map((row) => <div key={row.id}>{row.content}</div>)
          ) : (
            <div className="empty-state">
              <CalendarCheck2 className="size-7 text-muted-foreground" />
              <h3>Chưa có deadline phù hợp</h3>
              <p>
                {status === "completed"
                  ? "Bài tập được đánh dấu đã xong sẽ xuất hiện ở đây."
                  : "Thử tìm từ khóa khác hoặc thay đổi bộ lọc."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setSubject("all")
                  setStatus("all")
                  setSelectedDay(null)
                }}
              >
                Xem tất cả deadline
              </Button>
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
