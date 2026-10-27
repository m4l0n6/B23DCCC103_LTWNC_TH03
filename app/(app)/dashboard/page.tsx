import type { Metadata } from "next"
import { requireAccess } from "@/lib/access"
import { getSubjects, readStore } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { DeadlineList } from "@/components/deadline-list"
import { DeadlineSummary } from "@/components/deadline-summary"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "Deadline của tôi",
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const user = await requireAccess("complete", "/dashboard")
  const [store, subjects] = await Promise.all([readStore(), getSubjects()])
  const completedIds = store.completions
    .filter((entry) => entry.userId === user.id)
    .map((entry) => entry.deadlineId)
  const percent = store.deadlines.length
    ? Math.round((completedIds.length / store.deadlines.length) * 100)
    : 0
  return (
    <>
      <PageHeading
        title="Deadline của tôi"
        description="Từng bài hoàn thành, từng chút nhẹ đầu. Tiến độ của bạn được lưu tự động."
      />
      <div className="progress-panel">
        <div>
          <span>Tiến độ học kỳ</span>
          <strong>
            {completedIds.length}/{store.deadlines.length} bài tập{" "}
            <span>· {percent}%</span>
          </strong>
        </div>
        <Progress value={percent} aria-label="Tiến độ hoàn thành bài tập" />
      </div>
      <DeadlineSummary
        deadlines={store.deadlines}
        subjectCount={subjects.length}
        completedIds={completedIds}
      />
      <DeadlineList
        deadlines={store.deadlines}
        subjects={subjects}
        completedIds={completedIds}
        personal
      />
    </>
  )
}
