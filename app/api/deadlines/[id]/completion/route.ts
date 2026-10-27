import { auth } from "@/lib/auth"
import { readStore } from "@/lib/data"
import { can } from "@/lib/permissions"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !can(session.user.role, "complete"))
    return Response.json({ error: "Vui lòng đăng nhập." }, { status: 401 })
  const { id } = await params
  const store = await readStore()
  if (!store.deadlines.some((deadline) => deadline.id === id))
    return Response.json({ error: "Deadline không tồn tại." }, { status: 404 })
  return Response.json(
    {
      completed: store.completions.some(
        (entry) => entry.userId === session.user.id && entry.deadlineId === id
      ),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
