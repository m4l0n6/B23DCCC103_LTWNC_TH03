import type { Metadata } from "next"
import { requireAccess } from "@/lib/access"
import { getSubjects, readStore } from "@/lib/data"
import { DeadlineList } from "@/components/deadline-list"
import { PageHeading } from "@/components/page-heading"

export const metadata: Metadata = {
  title: "Đã hoàn thành",
  robots: { index: false, follow: false },
}

export default async function CompletedPage() {
  const user = await requireAccess("complete", "/dashboard/completed")
  const [store, subjects] = await Promise.all([readStore(), getSubjects()])
  const completedIds = store.completions
    .filter((entry) => entry.userId === user.id)
    .map((entry) => entry.deadlineId)
  return (
    <>
      <PageHeading
        title="Đã hoàn thành"
        description="Những bài tập bạn đã đánh dấu xong. Có thể hoàn tác bất cứ lúc nào."
      />
      <DeadlineList
        deadlines={store.deadlines.filter((entry) =>
          completedIds.includes(entry.id)
        )}
        subjects={subjects}
        completedIds={completedIds}
        personal
      />
    </>
  )
}
