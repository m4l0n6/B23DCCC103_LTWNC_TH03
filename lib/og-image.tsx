import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"

export async function deadlineImage({
  title,
  subject,
  date,
  id,
}: {
  title: string
  subject: string
  date: string
  id?: string
}) {
  const font = await readFile(
    path.join(process.cwd(), "assets/BeVietnamPro-SemiBold.ttf")
  )
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#f4f6f4",
        padding: "56px 64px",
        fontFamily: "BeVietnam",
        color: "#18251d",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 23,
        }}
      >
        <span style={{ color: "#16805e" }}>Class Deadline</span>
        <span style={{ color: "#626a65", fontSize: 18 }}>
          {id ? `DEADLINE #${id}` : "Học kỳ I · 2026–2027"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 24, color: "#626a65", marginBottom: 22 }}>
          {subject}
        </span>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 65 ? 44 : 56,
            lineHeight: 1.3,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          borderTop: "2px solid #d8e1da",
          paddingTop: 28,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 23 }}>{date}</span>
        <span style={{ fontSize: 18, color: "#16805e" }}>
          Chủ động học tập, cùng nhau tiến bộ ↗
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "BeVietnam", data: font, style: "normal", weight: 600 }],
    }
  )
}
