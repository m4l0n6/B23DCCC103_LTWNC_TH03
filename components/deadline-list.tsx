import { DeadlineBrowser } from "@/components/deadline-browser"
import { DeadlineRow } from "@/components/deadline-row"
import type { Deadline, Subject } from "@/lib/types"
import { calendarDate } from "@/lib/calendar"

export function DeadlineList({
  deadlines,
  subjects,
  completedIds = [],
  personal = false,
  admin = false,
  initialStatus = "all",
}: {
  deadlines: Deadline[]
  subjects: Subject[]
  completedIds?: string[]
  personal?: boolean
  admin?: boolean
  initialStatus?: string
}) {
  // Server-only snapshot keeps the first calendar render identical during hydration.
  // eslint-disable-next-line react-hooks/purity
  const initialMonth = calendarDate(Date.now()).slice(0, 7)
  const rows = deadlines.flatMap((deadline) => {
    const subject = subjects.find(
      (entry) => entry.slug === deadline.subjectSlug
    )
    if (!subject) return []
    const completed = completedIds.includes(deadline.id)
    return [
      {
        ...deadline,
        completed,
        content: (
          <DeadlineRow
            deadline={deadline}
            subject={subject}
            completed={completed}
            personal={personal}
            admin={admin}
          />
        ),
      },
    ]
  })
  return (
    <DeadlineBrowser
      rows={rows}
      subjects={subjects}
      personal={personal}
      initialStatus={initialStatus}
      initialMonth={initialMonth}
    />
  )
}
