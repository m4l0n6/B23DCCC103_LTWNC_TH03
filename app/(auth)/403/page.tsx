import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <main className="status-page">
      <ShieldX className="size-10 text-muted-foreground" />
      <p className="status-code">403</p>
      <h1>Bạn chưa có quyền truy cập</h1>
      <p>Khu vực quản lý deadline chỉ dành cho lớp trưởng.</p>
      <Button render={<Link href="/dashboard" />}>Về deadline của tôi</Button>
      <Link href="/" className="text-link">
        Về trang công khai
      </Link>
    </main>
  )
}
