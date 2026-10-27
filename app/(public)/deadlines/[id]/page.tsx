import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Flag, BookOpen } from "lucide-react"
import { getDeadline, getDeadlines, getSubjects } from "@/lib/data"
import { siteUrl, formatDate } from "@/lib/site"
import { Button } from "@/components/ui/button"
import { DeadlineStatus } from "@/components/deadline-status"
import { ShareButton } from "@/components/share-button"
import { DetailCompletion } from "@/components/detail-completion"

export const revalidate = false
export const dynamicParams = true
export async function generateStaticParams() {
  return (await getDeadlines()).map((deadline) => ({ id: deadline.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const deadline = await getDeadline(id)
  if (!deadline) notFound()
  const description = `${deadline.description.slice(0, 140)} Hạn nộp: ${formatDate(deadline.dueAt)}.`
  return {
    title: deadline.title,
    description,
    alternates: { canonical: `/deadlines/${id}` },
    openGraph: {
      title: deadline.title,
      description,
      url: `/deadlines/${id}`,
      type: "article",
      images: [
        {
          url: `/deadlines/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: deadline.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: deadline.title,
      description,
      images: [`/deadlines/${id}/opengraph-image`],
    },
  }
}

export default async function DeadlinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [deadline, subjects] = await Promise.all([
    getDeadline(id),
    getSubjects(),
  ])
  if (!deadline) notFound()
  const subject = subjects.find((entry) => entry.slug === deadline.subjectSlug)!
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tổng quan", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Deadline",
        item: `${siteUrl}/deadlines`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: deadline.title,
        item: `${siteUrl}/deadlines/${id}`,
      },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/deadlines" className="back-link">
        <ArrowLeft className="size-4" />
        Tất cả deadline
      </Link>
      <div className="detail-heading">
        <Link href={`/subjects/${subject.slug}`} className="subject-label">
          {subject.name}
        </Link>
        <h1>{deadline.title}</h1>
        <p>Được đăng ngày {formatDate(deadline.createdAt)} · Lớp trưởng</p>
      </div>
      <div className="detail-grid">
        <article className="panel detail-body">
          <h2>Nội dung bài tập</h2>
          <p className="whitespace-pre-wrap">{deadline.description}</p>
          <div className="detail-guidance">
            <DetailCompletion id={id} />
          </div>
        </article>
        <aside className="panel deadline-facts">
          <div className="flex items-center justify-between">
            <h2>Thông tin deadline</h2>
            <ShareButton title={deadline.title} />
          </div>
          <DeadlineStatus dueAt={deadline.dueAt} />
          <dl>
            <div>
              <dt>
                <CalendarDays />
                Hạn nộp
              </dt>
              <dd>
                <time dateTime={deadline.dueAt}>
                  {formatDate(deadline.dueAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt>
                <BookOpen />
                Môn học
              </dt>
              <dd>
                <Link href={`/subjects/${subject.slug}`}>{subject.name}</Link>
              </dd>
            </div>
            <div>
              <dt>
                <Flag />
                Mức ưu tiên
              </dt>
              <dd>
                {deadline.priority === "high" ? "Ưu tiên cao" : "Bình thường"}
              </dd>
            </div>
          </dl>
          {deadline.submissionUrl ? (
            <Button
              className="w-full"
              render={
                <a
                  href={deadline.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Đến nơi nộp bài
            </Button>
          ) : (
            <p className="submission-note">
              Nộp bài theo hướng dẫn của giảng viên trên lớp.
            </p>
          )}
        </aside>
      </div>
    </>
  )
}
