import { test } from "node:test"
import assert from "node:assert/strict"
import { can, type Role, type Action } from "../lib/permissions"
import { parseDeadline, safeCallbackUrl } from "../lib/validation"

test("the full role/action matrix matches the assignment", () => {
  const actions: Action[] = ["view", "complete", "create", "delete"]
  const expected: Record<Role, boolean[]> = {
    guest: [true, false, false, false],
    user: [true, true, false, false],
    admin: [true, true, true, true],
  }
  for (const role of Object.keys(expected) as Role[])
    assert.deepEqual(
      actions.map((action) => can(role, action)),
      expected[role]
    )
})

test("callback URLs cannot redirect outside the application or loop through login", () => {
  for (const url of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/login",
    "/api/auth/signin",
    "\n//evil.test",
    null,
  ])
    assert.equal(safeCallbackUrl(url), "/dashboard")
  assert.equal(
    safeCallbackUrl("/dashboard/completed?from=login"),
    "/dashboard/completed?from=login"
  )
  assert.equal(safeCallbackUrl("/admin"), "/admin")
})

test("deadline input validates subject, real dates, priority and submission links", () => {
  const fields = {
    title: "Bài tập kiểm thử",
    description: "Nội dung bài tập đủ dài để kiểm tra.",
    subjectSlug: "web",
    dueAt: "2026-11-01T23:59",
    priority: "normal",
    submissionUrl: "https://example.com/submit",
  }
  const parse = (override = {}) => {
    const form = new FormData()
    Object.entries({ ...fields, ...override }).forEach(([key, value]) =>
      form.set(key, value)
    )
    return parseDeadline(form, ["web"])
  }
  assert.equal(parse().dueAt, "2026-11-01T23:59:00+07:00")
  for (const invalid of [
    { title: "a" },
    { description: "" },
    { subjectSlug: "unknown" },
    { priority: "root" },
    { dueAt: "2026-02-30T23:59" },
    { dueAt: "2026-11-01T25:00" },
    { submissionUrl: "javascript:alert(1)" },
    { submissionUrl: "https://user:pass@example.com" },
  ])
    assert.throws(() => parse(invalid))
})
