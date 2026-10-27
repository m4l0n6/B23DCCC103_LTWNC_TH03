import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { getSubjects } from "@/lib/data"

export const metadata: Metadata = { robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell subjects={await getSubjects()} mode="app">
      {children}
    </AppShell>
  )
}
