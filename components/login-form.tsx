"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, LoaderCircle, Code2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function LoginForm({
  callbackUrl,
  githubEnabled,
  oauthError,
}: {
  callbackUrl: string
  githubEnabled: boolean
  oauthError: boolean
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(
    oauthError ? "Đăng nhập chưa thành công. Vui lòng thử lại." : ""
  )
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      })
      if (result?.error) {
        setError("Email hoặc mật khẩu không đúng.")
        setPending(false)
        return
      }
      window.location.assign(callbackUrl)
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.")
      setPending(false)
    }
  }
  return (
    <>
      <form onSubmit={submit} className="login-form">
        <div className="field">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            placeholder="ban@ptit.edu.vn"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="password-field">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={128}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
          {pending && <LoaderCircle className="size-4 animate-spin" />}
        </Button>
      </form>
      {githubEnabled && (
        <Button
          className="mt-3 h-11 w-full"
          variant="outline"
          disabled={pending}
          onClick={() => signIn("github", { redirectTo: callbackUrl })}
        >
          <Code2 className="size-4" />
          Tiếp tục với GitHub
        </Button>
      )}
    </>
  )
}
