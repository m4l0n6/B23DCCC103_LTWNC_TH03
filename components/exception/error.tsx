"use client"

import { RotateCcw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="status-page">
      <TriangleAlert className="size-9 text-muted-foreground" />
      <h1>Chưa thể tải nội dung</h1>
      <p>Đã có lỗi khi xử lý dữ liệu. Vui lòng thử lại sau ít phút.</p>
      <Button onClick={reset}>
        <RotateCcw className="size-4" />
        Thử lại
      </Button>
    </div>
  )
}
