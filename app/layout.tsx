import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteUrl } from "@/lib/site"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Class Deadline · Deadline của lớp",
    template: "%s | Class Deadline",
  },
  description:
    "Một nơi cho mọi deadline của lớp. Xem bài tập theo môn, nắm hạn nộp và theo dõi tiến độ học tập của bạn.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Class Deadline",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} antialiased`}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
