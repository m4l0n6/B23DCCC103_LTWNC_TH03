import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000",
    launchOptions: { channel: "chrome" },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
})
