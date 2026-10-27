import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { readFile } from "node:fs/promises"
import { scryptSync, timingSafeEqual } from "node:crypto"
import path from "node:path"
import type { Role } from "@/lib/permissions"

type StoredUser = {
  id: string
  name: string
  email: string
  role: Exclude<Role, "guest">
  salt: string
  passwordHash: string
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string" ||
          credentials.email.length > 254 ||
          credentials.password.length > 128
        )
          return null
        const users: StoredUser[] = JSON.parse(
          await readFile(path.join(process.cwd(), "data/users.json"), "utf8")
        )
        const user = users.find(
          (entry) =>
            entry.email === (credentials.email as string).trim().toLowerCase()
        )
        const hash = scryptSync(
          credentials.password,
          user?.salt ?? "invalid-user",
          64
        )
        if (
          !user ||
          !timingSafeEqual(hash, Buffer.from(user.passwordHash, "hex"))
        )
          return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHub({
            profile(profile) {
              return {
                id: String(profile.id),
                name: profile.name ?? profile.login,
                email: profile.email,
                image: profile.avatar_url,
                role: "user" as const,
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt({ token, user, account }) {
      if (user) {
        token.sub =
          account?.provider === "github" ? `github:${user.id}` : user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? ""
      session.user.role = token.role === "admin" ? "admin" : "user"
      return session
    },
  },
})
