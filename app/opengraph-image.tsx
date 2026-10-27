import { deadlineImage } from "@/lib/og-image"

export const alt = "Class Deadline · Mọi deadline của lớp ở một nơi"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return deadlineImage({
    title: "Mọi deadline của lớp, ở một nơi.",
    subject: "Bài tập · Báo cáo · Đồ án",
    date: "4 môn học · Tiến độ của riêng bạn",
  })
}
