import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"
import { requireAccess } from "@/lib/access"
import { getSubjects, getDeadlines } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { AdminDeadlineTools } from "@/components/admin-deadline-tools"
import { DeadlineList } from "@/components/deadline-list"

export const metadata: Metadata = {
  title: "Quản lý deadline",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  await requireAccess("create", "/admin")
  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ])
  return (
    <>
      <PageHeading title="Quản lý deadline">
        <span className="admin-label">
          <ShieldCheck className="size-4" />
          Quyền lớp trưởng
        </span>
      </PageHeading>
      <AdminDeadlineTools subjects={subjects} />
      <DeadlineList deadlines={deadlines} subjects={subjects} admin />
    </>
  )
}
