export const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "")
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value))
