import Link from "next/link"
import { CalendarX2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="status-page">
      <CalendarX2 className="size-10 text-muted-foreground" />
      <p className="status-code">404</p>
      <h1>Không tìm thấy nội dung</h1>
      <p>Deadline hoặc môn học này không tồn tại, hoặc đã được xóa.</p>
      <Button render={<Link href="/deadlines" />}>Xem tất cả deadline</Button>
      <Link href="/" className="text-link">
        Về tổng quan lớp học
      </Link>
    </div>
  )
}
