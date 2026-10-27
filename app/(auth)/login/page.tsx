import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { auth } from "@/lib/auth"
import { safeCallbackUrl } from "@/lib/validation"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(params.callbackUrl)
  if (await auth()) redirect(callbackUrl)
  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="login-brand">
          Class Deadline
        </Link>
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Không gian học tập của lớp
          </p>
          <h2>
            Rõ việc cần làm.
            <br />
            Vững nhịp học tập.
          </h2>
          <p className="login-story-description">
            Một nơi để nắm hạn nộp, lưu tiến độ và chủ động hơn trong mỗi học
            kỳ.
          </p>
          <ul>
            <li>
              <Check />
              Tất cả môn học trong một không gian
            </li>
            <li>
              <Check />
              Deadline công khai, dễ chia sẻ
            </li>
            <li>
              <Check />
              Tiến độ được lưu riêng cho bạn
            </li>
          </ul>
        </div>
      </section>
      <section className="login-content">
        <div className="login-box">
          <Link href="/" className="back-link">
            <ArrowLeft className="size-4" />
            Về trang chủ
          </Link>
          <h1>Đăng nhập</h1>
          <p className="login-description">Tiếp tục với tài khoản của bạn.</p>
          <LoginForm
            callbackUrl={callbackUrl}
            githubEnabled={Boolean(
              process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
            )}
            oauthError={Boolean(params.error)}
          />
        </div>
      </section>
    </main>
  )
}
