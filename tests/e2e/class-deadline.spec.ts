import { test, expect, type Page } from "@playwright/test"
import { readFile } from "node:fs/promises"

async function login(
  page: Page,
  role: "student" | "admin",
  destination = "/dashboard"
) {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(destination)}`)
  await page
    .getByLabel("Email", { exact: true })
    .fill(role === "admin" ? "admin@ptit.edu.vn" : "sv@ptit.edu.vn")
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(role === "admin" ? "admin123" : "sv123456")
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await expect(page).toHaveURL(destination)
}

test("public HTML includes content, SEO, generated image and real 404", async ({
  page,
  request,
}) => {
  const response = await request.get("/deadlines/1")
  const source = await response.text()
  expect(source).toContain("BTTH 3 · Class Deadline")
  expect(source).toContain("BreadcrumbList")
  expect(source).toContain('property="og:image"')
  expect(source).toContain('rel="canonical"')
  expect((await request.get("/deadlines/999999")).status()).toBe(404)
  const image = await request.get("/deadlines/1/opengraph-image")
  expect(image.status()).toBe(200)
  expect(image.headers()["content-type"]).toContain("image/png")
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/deadlines/1"
  )
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /admin"
  )
  await page.goto("/deadlines")
  await page.getByLabel("Tìm deadline", { exact: true }).fill("Class Deadline")
  await expect(page.locator(".deadline-row")).toHaveCount(1)
  await page
    .getByLabel("Tìm deadline", { exact: true })
    .fill("khong-co-bai-tap-nay")
  await expect(page.getByText("Chưa có deadline phù hợp")).toBeVisible()
})

test("guest redirects preserve return path and invalid login stays on the form", async ({
  page,
}) => {
  await page.goto("/dashboard/completed")
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard%2Fcompleted/)
  await page.getByLabel("Email", { exact: true }).fill("sv@ptit.edu.vn")
  await page.getByLabel("Mật khẩu", { exact: true }).fill("incorrect")
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await expect(page.locator(".login-form [role='alert']")).toHaveText(
    "Email hoặc mật khẩu không đúng."
  )
})

test("student completion persists, is private, supports undo, and admin stays forbidden", async ({
  page,
  browser,
}) => {
  await login(page, "student")
  const row = page.locator('[data-deadline-id="1"]')
  await row
    .getByRole("button", { name: "Đánh dấu hoàn thành", exact: true })
    .click()
  await expect(row.getByText("Đã hoàn thành", { exact: true })).toBeVisible()
  await page.reload()
  await expect(
    row.getByRole("button", { name: "Đánh dấu chưa xong" })
  ).toBeVisible()
  await page.goto("/dashboard/completed")
  await expect(page.locator('[data-deadline-id="1"]')).toBeVisible()
  const context = await browser.newContext()
  const adminPage = await context.newPage()
  await login(adminPage, "admin")
  await expect(
    adminPage
      .locator('[data-deadline-id="1"]')
      .getByRole("button", { name: "Đánh dấu hoàn thành", exact: true })
  ).toBeVisible()
  await context.close()
  await page
    .locator('[data-deadline-id="1"]')
    .getByRole("button", { name: "Đánh dấu chưa xong" })
    .click()
  await expect(page.locator('[data-deadline-id="1"]')).toHaveCount(0)
  await page.goto("/admin")
  await expect(page).toHaveURL("/403")
  await expect(
    page.getByRole("heading", { name: "Bạn chưa có quyền truy cập" })
  ).toBeVisible()
  await page.goto("/dashboard")
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click()
  await expect(page).toHaveURL("/")
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login/)
})

test("admin create/delete invalidates ISR, rejects a student action replay, and cleans data", async ({
  page,
  browser,
  request,
}) => {
  await login(page, "admin", "/admin")
  await expect(
    page.getByRole("heading", { name: "Quản lý deadline", exact: true })
  ).toBeVisible()
  // Remove only leftovers created by a previously interrupted run of this test.
  const leftovers = page.getByRole("button", { name: /^Xóa Bài tập E2E / })
  while (await leftovers.count()) {
    await leftovers.first().click()
    await page
      .getByRole("button", { name: "Xóa deadline", exact: true })
      .click()
    await expect(page.getByRole("alertdialog")).toHaveCount(0)
  }
  const title = `Bài tập E2E ${Date.now()}`
  await page.getByRole("button", { name: "Thêm mới", exact: true }).click()
  await page.getByLabel("Tên bài tập").fill(title)
  await page.locator("#dueAt").fill("2026-12-01T23:59")
  await page
    .getByLabel("Nội dung bài tập")
    .fill("Nội dung kiểm thử tạo và xóa deadline trên production.")
  const actionRequest = page.waitForRequest(
    (entry) =>
      entry.method() === "POST" && Boolean(entry.headers()["next-action"])
  )
  await page.getByRole("button", { name: "Thêm deadline", exact: true }).click()
  const captured = await actionRequest
  await expect(
    page.getByText("Đã thêm deadline mới.", { exact: true })
  ).toBeVisible()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click()
  await expect(
    page.locator(".deadline-row").filter({ hasText: title })
  ).toBeVisible()
  const href = await page
    .locator(".deadline-row")
    .filter({ hasText: title })
    .getByRole("link", { name: title })
    .getAttribute("href")
  expect(href).toBeTruthy()
  expect(await (await request.get(href!)).text()).toContain(title)
  expect(await (await request.get("/deadlines")).text()).toContain(title)
  expect(await (await request.get("/sitemap.xml")).text()).toContain(href!)
  const student = await browser.newContext()
  const studentPage = await student.newPage()
  await login(studentPage, "student")
  const before = JSON.parse(await readFile("data/store.json", "utf8")).deadlines
    .length
  const replay = await student.request.post("/", {
    headers: {
      "next-action": captured.headers()["next-action"],
      "content-type": captured.headers()["content-type"],
      origin: new URL(test.info().project.use.baseURL as string).origin,
    },
    data: captured.postDataBuffer()!,
  })
  // An action absent from this route's manifest may be rejected before our own guard runs.
  expect(await replay.text()).not.toContain("Đã thêm deadline mới.")
  expect(
    JSON.parse(await readFile("data/store.json", "utf8")).deadlines
  ).toHaveLength(before)
  await page
    .locator(".deadline-row")
    .filter({ hasText: title })
    .getByRole("button", { name: `Xóa ${title}`, exact: true })
    .click()
  await expect(page.getByRole("alertdialog")).toBeVisible()
  await page.getByRole("button", { name: "Giữ lại", exact: true }).click()
  await expect(
    page.locator(".deadline-row").filter({ hasText: title })
  ).toBeVisible()
  await page
    .locator(".deadline-row")
    .filter({ hasText: title })
    .getByRole("button", { name: `Xóa ${title}`, exact: true })
    .click()
  const deletionRequest = page.waitForRequest(
    (entry) =>
      entry.method() === "POST" && Boolean(entry.headers()["next-action"])
  )
  await page.getByRole("button", { name: "Xóa deadline", exact: true }).click()
  const deletion = await deletionRequest
  await expect(
    page.locator(".deadline-row").filter({ hasText: title })
  ).toHaveCount(0)
  expect((await request.get(href!)).status()).toBe(404)
  expect(await (await request.get("/deadlines")).text()).not.toContain(title)
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(href!)
  const deleteReplay = await student.request.post("/", {
    headers: {
      "next-action": deletion.headers()["next-action"],
      "content-type": deletion.headers()["content-type"],
      origin: new URL(test.info().project.use.baseURL as string).origin,
    },
    data: deletion.postDataBuffer()!,
  })
  const deleteBody = await deleteReplay.text()
  console.log(
    "Denied action replay:",
    deleteReplay.status(),
    deleteReplay.headers()["content-type"],
    deleteBody.slice(0, 400)
  )
  expect(deleteBody).toContain("Bạn không có quyền")
  await student.close()
})

test("mobile and tablet navigation fold, navigate and close without overflow", async ({
  page,
}) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/")
    await page.getByRole("button", { name: "Mở hoặc thu gọn menu" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Tất cả deadline" })
      .click()
    await expect(page).toHaveURL("/deadlines")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  }
})
