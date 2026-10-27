import type { MetadataRoute } from "next"
import { getSubjects, getDeadlines } from "@/lib/data"
import { siteUrl } from "@/lib/site"

export const revalidate = 60
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [subjects, deadlines] = await Promise.all([
    getSubjects(),
    getDeadlines(),
  ])
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/deadlines`, changeFrequency: "daily", priority: 0.9 },
    ...subjects.map((subject) => ({
      url: `${siteUrl}/subjects/${subject.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...deadlines.map((deadline) => ({
      url: `${siteUrl}/deadlines/${deadline.id}`,
      lastModified: deadline.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
