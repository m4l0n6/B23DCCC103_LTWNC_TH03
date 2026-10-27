import { notFound } from "next/navigation"
import { getDeadline, getSubjects } from "@/lib/data"
import { deadlineImage } from "@/lib/og-image"
import { formatDate } from "@/lib/site"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [deadline, subjects] = await Promise.all([
    getDeadline(id),
    getSubjects(),
  ])
  if (!deadline) notFound()
  const subject = subjects.find((entry) => entry.slug === deadline.subjectSlug)
  return deadlineImage({
    id,
    title: deadline.title,
    subject: subject?.name ?? "Deadline của lớp",
    date: `Hạn nộp: ${formatDate(deadline.dueAt)}`,
  })
}
