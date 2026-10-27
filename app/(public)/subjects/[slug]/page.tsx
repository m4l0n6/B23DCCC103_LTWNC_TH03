import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BookOpen, UserRound } from "lucide-react"
import { getDeadlines, getSubjects } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { DeadlineList } from "@/components/deadline-list"

export const dynamic = "force-static"
export const dynamicParams = false
export async function generateStaticParams() {
  return (await getSubjects()).map((subject) => ({ slug: subject.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const subject = (await getSubjects()).find((entry) => entry.slug === slug)
  return {
    title: subject?.name ?? "Không tìm thấy môn học",
    description: subject?.description,
    alternates: { canonical: `/subjects/${slug}` },
  }
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [subjects, deadlines] = await Promise.all([
    getSubjects(),
    getDeadlines(),
  ])
  const subject = subjects.find((entry) => entry.slug === slug)
  if (!subject) notFound()
  return (
    <>
      <PageHeading title={subject.name} description={subject.description} />
      <div className="subject-info">
        <span>
          <BookOpen className="size-4" />
          {subject.code}
        </span>
        <span>
          <UserRound className="size-4" />
          Giảng viên: {subject.lecturer}
        </span>
        <span>Học kỳ I · 2026–2027</span>
      </div>
      <DeadlineList
        deadlines={deadlines.filter((entry) => entry.subjectSlug === slug)}
        subjects={[subject]}
      />
    </>
  )
}
