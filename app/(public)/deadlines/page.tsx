import type { Metadata } from "next"
import { getDeadlines, getSubjects } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { DeadlineList } from "@/components/deadline-list"

export const metadata: Metadata = {
  title: "Tất cả deadline",
  alternates: { canonical: "/deadlines" },
}
export const revalidate = 60

export default async function DeadlinesPage() {
  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ])
  return (
    <>
      <PageHeading
        title="Tất cả deadline"
        description="Bài tập, báo cáo và đồ án của lớp. Đừng để lỡ hạn nộp."
      />
      <DeadlineList deadlines={deadlines} subjects={subjects} />
    </>
  )
}
