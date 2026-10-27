import { AppShell } from "@/components/app-shell"
import { getSubjects } from "@/lib/data"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell subjects={await getSubjects()}>{children}</AppShell>
}
