import type { Deadline } from "./types"

export function safeCallbackUrl(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return "/dashboard"
  try {
    const url = new URL(value, "http://localhost")
    if (
      url.origin !== "http://localhost" ||
      /^\/(login|api)(\/|$)/.test(url.pathname)
    )
      return "/dashboard"
    return url.pathname + url.search
  } catch {
    return "/dashboard"
  }
}

export function parseDeadline(
  form: FormData,
  subjectSlugs: string[]
): Omit<Deadline, "id" | "createdAt"> {
  const text = (key: string) => String(form.get(key) ?? "").trim()
  const title = text("title")
  const description = text("description")
  const subjectSlug = text("subjectSlug")
  const priority = text("priority")
  const localDate = text("dueAt")
  const submissionUrl = text("submissionUrl")
  if (title.length < 5 || title.length > 150)
    throw new Error("Tiêu đề cần từ 5 đến 150 ký tự.")
  if (description.length < 10 || description.length > 5000)
    throw new Error("Mô tả cần từ 10 đến 5.000 ký tự.")
  if (!subjectSlugs.includes(subjectSlug))
    throw new Error("Môn học không hợp lệ.")
  if (priority !== "normal" && priority !== "high")
    throw new Error("Mức ưu tiên không hợp lệ.")
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localDate))
    throw new Error("Hạn nộp không hợp lệ.")
  const dueAt = `${localDate}:00+07:00`
  const date = new Date(dueAt)
  if (
    !Number.isFinite(date.getTime()) ||
    new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 16) !==
      localDate
  )
    throw new Error("Ngày hoặc giờ không tồn tại.")
  if (submissionUrl) {
    try {
      const url = new URL(submissionUrl)
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        submissionUrl.length > 2000
      )
        throw new Error()
    } catch {
      throw new Error("Liên kết nộp bài phải là URL http hoặc https hợp lệ.")
    }
  }
  return { title, description, subjectSlug, priority, dueAt, submissionUrl }
}
