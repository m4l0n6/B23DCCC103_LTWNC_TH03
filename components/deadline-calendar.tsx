"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  calendarDate,
  dayLabel,
  monthDays,
  monthLabel,
  shiftMonth,
} from "@/lib/calendar"
import { useClock } from "@/hooks/use-clock"
import type { BrowserRow } from "@/components/deadline-browser"
import type { Subject } from "@/lib/types"

export function DeadlineCalendar({
  rows,
  subjects,
  month,
  selectedDay,
  onMonthChange,
  onDaySelect,
}: {
  rows: BrowserRow[]
  subjects: Subject[]
  month: string
  selectedDay: string | null
  onMonthChange: (month: string) => void
  onDaySelect: (day: string) => void
}) {
  const now = useClock()
  const today = now ? calendarDate(now) : null
  const days = monthDays(month)
  const monthlyCount = rows.filter((row) =>
    calendarDate(row.dueAt).startsWith(month)
  ).length
  return (
    <section className="deadline-calendar" aria-label="Lịch công việc">
      <header className="calendar-heading">
        <div>
          <h2>{monthLabel(month)}</h2>
          <p>{monthlyCount} deadline trong tháng</p>
        </div>
        <div className="calendar-navigation">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(today?.slice(0, 7) ?? month)}
          >
            Hôm nay
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Tháng trước"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Tháng sau"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>
      <div className="calendar-weekdays" aria-hidden="true">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const events = rows.filter((row) => calendarDate(row.dueAt) === day)
          return (
            <div
              className="calendar-day"
              key={day}
              data-outside={!day.startsWith(month) || undefined}
              data-selected={selectedDay === day || undefined}
              data-today={day === today || undefined}
            >
              <button
                type="button"
                className="calendar-date"
                aria-label={`${dayLabel(day)}, ${events.length} deadline`}
                aria-pressed={selectedDay === day}
                onClick={() => onDaySelect(day)}
              >
                <time dateTime={day}>{Number(day.slice(-2))}</time>
              </button>
              <div className="calendar-events">
                {events.slice(0, 2).map((event) => {
                  const subject = subjects.find(
                    (entry) => entry.slug === event.subjectSlug
                  )
                  return (
                    <Link
                      key={event.id}
                      href={`/deadlines/${event.id}`}
                      className={`calendar-event ${event.completed ? "event-done" : event.priority === "high" ? "event-priority" : ""}`}
                      title={`${event.title} · ${subject?.shortName ?? ""}`}
                    >
                      <span className="calendar-event-dot" aria-hidden="true" />
                      <span>{event.title}</span>
                    </Link>
                  )
                })}
                {events.length > 2 && (
                  <button
                    className="calendar-more"
                    type="button"
                    onClick={() => onDaySelect(day)}
                  >
                    +{events.length - 2} công việc
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {selectedDay && (
        <footer className="calendar-footer">
          <span>
            Đang chọn ngày {selectedDay.split("-").reverse().join("/")}
          </span>
        </footer>
      )}
    </section>
  )
}
