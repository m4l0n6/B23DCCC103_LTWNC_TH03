import Link from "next/link"
import { Flag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DeadlineStatus } from "@/components/deadline-status"
import { CompletionButton, DeleteButton } from "@/components/deadline-controls"
import { formatDate } from "@/lib/site"
import type { Deadline, Subject } from "@/lib/types"

export function DeadlineRow({
  deadline,
  subject,
  completed = false,
  personal = false,
  admin = false,
}: {
  deadline: Deadline
  subject: Subject
  completed?: boolean
  personal?: boolean
  admin?: boolean
}) {
  return (
    <article
      className={`deadline-row ${completed ? "is-completed" : ""}`}
      data-deadline-id={deadline.id}
    >
      <div className="deadline-identity">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link href={`/subjects/${subject.slug}`} className="subject-label">
            {subject.shortName}
          </Link>
          {deadline.priority === "high" && (
            <Badge variant="outline" className="priority-badge">
              <Flag className="size-3" />
              Ưu tiên cao
            </Badge>
          )}
        </div>
        <h3>
          <Link
            className="deadline-detail-link"
            href={`/deadlines/${deadline.id}`}
          >
            {deadline.title}
          </Link>
        </h3>
        <p className="deadline-excerpt">{deadline.description}</p>
      </div>
      <div className="deadline-time">
        <DeadlineStatus dueAt={deadline.dueAt} completed={completed} />
        <time dateTime={deadline.dueAt}>{formatDate(deadline.dueAt)}</time>
      </div>
      {personal && <CompletionButton id={deadline.id} completed={completed} />}
      {admin && <DeleteButton id={deadline.id} title={deadline.title} />}
    </article>
  )
}
