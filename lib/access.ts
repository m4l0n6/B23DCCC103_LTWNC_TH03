import "server-only"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { can, type Action } from "@/lib/permissions"

export async function requireAccess(action: Action, callbackUrl: string) {
  const session = await auth()
  if (!session?.user)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  if (!can(session.user.role, action)) redirect("/403")
  return session.user
}
