export type Role = "guest" | "user" | "admin"
export type Action = "view" | "complete" | "create" | "delete"

const permissions: Record<Role, readonly Action[]> = {
  guest: ["view"],
  user: ["view", "complete"],
  admin: ["view", "complete", "create", "delete"],
}

export function can(role: Role, action: Action): boolean {
  return permissions[role].includes(action)
}
