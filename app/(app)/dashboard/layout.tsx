import { requireAccess } from "@/lib/access"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAccess("complete", "/dashboard")
  return <div className="dashboard-content min-w-0">{children}</div>
}
