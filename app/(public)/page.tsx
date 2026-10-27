import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react"
import { getDeadlines, getSubjects } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { DeadlineSummary } from "@/components/deadline-summary"
import { DeadlineList } from "@/components/deadline-list"
import { Button } from "@/components/ui/button"

export const dynamic = "force-static"

export default async function HomePage() {
  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ])
  const priorities = deadlines
    .filter((entry) => entry.priority === "high")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 3)
  return (
    <>
      <PageHeading
        title="Tổng quan lớp học"
        description="Mọi deadline ở một nơi. Chủ động sắp xếp, nhẹ đầu học tập."
      >
        <Button render={<Link href="/deadlines" />}>Xem deadline</Button>
      </PageHeading>
      <DeadlineSummary deadlines={deadlines} subjectCount={subjects.length} />
      <section className="priority-board-section">
        <div className="section-heading">
          <div>
            <h2>Deadline ưu tiên</h2>
            <p>Các bài tập được lớp trưởng đánh dấu cần chú ý.</p>
          </div>
          <Link href="/deadlines" className="text-link">
            Xem tất cả <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <DeadlineList deadlines={priorities} subjects={subjects} />
      </section>
      <section className="subjects-section">
        <div className="section-heading">
          <div>
            <h2>Môn học trong học kỳ</h2>
            <p>{subjects.length} môn học · Theo dõi bài tập theo từng môn.</p>
          </div>
          <span className="semester-label">Học kỳ I · 2026–2027</span>
        </div>
        <div className="subjects-grid">
          {subjects.map((subject) => {
            const count = deadlines.filter(
              (entry) => entry.subjectSlug === subject.slug
            ).length
            return (
              <Link
                className="subject-card"
                href={`/subjects/${subject.slug}`}
                key={subject.slug}
              >
                <div className="subject-card-top">
                  <span>{subject.code}</span>
                  <ArrowUpRight className="size-4" />
                </div>
                <BookOpen className="my-5 size-5 text-muted-foreground" />
                <h3>{subject.name}</h3>
                <p>{subject.lecturer}</p>
                <div className="subject-card-footer">
                  <span>{count} deadline</span>
                  <span>
                    Xem môn học <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
