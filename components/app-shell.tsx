"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SessionProvider, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  BookOpen,
  CheckCheck,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  CalendarDays,
  UserRound,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { can } from "@/lib/permissions"
import { logout } from "@/lib/actions"
import type { Subject } from "@/lib/types"

export function AppShell({
  children,
  subjects,
  mode = "public",
}: {
  children: React.ReactNode
  subjects: Subject[]
  mode?: "public" | "app"
}) {
  // Fetch the session on the client to preserve SSG/ISR of the public server tree.
  return (
    <SessionProvider>
      <Shell subjects={subjects} mode={mode}>
        {children}
      </Shell>
    </SessionProvider>
  )
}

function Shell({
  children,
  subjects,
  mode,
}: {
  children: React.ReactNode
  subjects: Subject[]
  mode: "public" | "app"
}) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
    >
      <Navigation subjects={subjects} />
      <SidebarInset className="app-canvas min-w-0 p-4 md:p-6">
        <AppHeader mode={mode} subjects={subjects} />
        <div id="main-content" className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
        <footer className="app-footer">
          <span>Class Deadline</span>
          <span>Học kỳ I · 2026–2027</span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}

function Navigation({ subjects }: { subjects: Subject[] }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { setOpenMobile, isMobile } = useSidebar()
  const close = () => {
    if (isMobile) setOpenMobile(false)
  }
  const [subjectsOpen, setSubjectsOpen] = useState(true)
  const links = [
    { href: "/", label: "Tổng quan", icon: LayoutGrid },
    { href: "/deadlines", label: "Tất cả deadline", icon: CalendarDays },
    { href: "/dashboard", label: "Deadline của tôi", icon: CheckCheck },
    ...(can(session?.user.role ?? "guest", "create")
      ? [{ href: "/admin", label: "Quản lý deadline", icon: ShieldCheck }]
      : []),
  ]
  return (
    <Sidebar collapsible="icon" variant="floating" className="app-sidebar">
      <SidebarHeader className="h-16 justify-center px-3">
        <SidebarMenuButton
          className="brand-button h-11"
          render={<Link href="/" onClick={close} />}
          tooltip="Class Deadline"
        >
          <span className="text-sm font-semibold tracking-tight">
            Class Deadline
          </span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 pt-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                tooltip={
                  session?.user.role === "admin"
                    ? "Thêm deadline"
                    : "Theo dõi tiến độ"
                }
                render={
                  <Link
                    href={
                      session?.user.role === "admin"
                        ? "/admin#new-deadline"
                        : "/dashboard"
                    }
                    onClick={close}
                  />
                }
              >
                <Plus />
                <span>
                  {session?.user.role === "admin"
                    ? "Thêm deadline"
                    : "Theo dõi tiến độ"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="px-3">
          <SidebarGroupLabel>Không gian lớp học</SidebarGroupLabel>
          <SidebarMenu>
            {links.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={
                    href === "/" ? pathname === href : pathname.startsWith(href)
                  }
                  tooltip={label}
                  render={<Link href={href} onClick={close} />}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {session?.user && (
          <SidebarGroup className="px-3">
            <SidebarGroupLabel>Học kỳ I · 2026–2027</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                  <CollapsibleTrigger
                    render={<SidebarMenuButton tooltip="Môn học" />}
                  >
                    <BookOpen />
                    <span>Môn học</span>
                    <ChevronRight
                      className={`ml-auto transition-transform ${subjectsOpen ? "rotate-90" : ""}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {subjects.map((subject) => (
                        <SidebarMenuSubItem key={subject.slug}>
                          <SidebarMenuSubButton
                            isActive={pathname === `/subjects/${subject.slug}`}
                            render={
                              <Link
                                href={`/subjects/${subject.slug}`}
                                onClick={close}
                              />
                            }
                          >
                            <span>{subject.shortName}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="sidebar-account p-3">
        <Account />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Đổi giao diện"
      title="Đổi giao diện sáng/tối"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  )
}

function AppHeader({
  mode,
  subjects,
}: {
  mode: "public" | "app"
  subjects: Subject[]
}) {
  const pathname = usePathname()
  const title =
    pathname === "/"
      ? "Tổng quan"
      : pathname.startsWith("/subjects/")
        ? (subjects.find((subject) => pathname.endsWith(subject.slug))?.name ??
          "Môn học")
        : pathname.startsWith("/deadlines/")
          ? "Chi tiết deadline"
          : pathname === "/deadlines"
            ? "Tất cả deadline"
            : pathname.startsWith("/admin")
              ? "Quản lý deadline"
              : pathname === "/dashboard/completed"
                ? "Đã hoàn thành"
                : "Deadline của tôi"
  return (
    <header className="shell-header">
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger
          aria-label="Mở hoặc thu gọn menu"
          className="shrink-0"
        />
        <Separator orientation="vertical" className="h-4! self-center!" />
        <Breadcrumb>
          <BreadcrumbList>
            {pathname.startsWith("/subjects/") && (
              <>
                <BreadcrumbItem>
                  <span>Môn học</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {(pathname.startsWith("/deadlines/") ||
              (mode === "app" && pathname === "/dashboard/completed")) && (
              <>
                <BreadcrumbItem className="hidden lg:flex">
                  <BreadcrumbLink
                    render={
                      <Link
                        href={
                          pathname.startsWith("/deadlines/")
                            ? "/deadlines"
                            : "/dashboard"
                        }
                      />
                    }
                  >
                    {pathname.startsWith("/deadlines/")
                      ? "Tất cả deadline"
                      : "Deadline của tôi"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden lg:flex" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-44 truncate sm:max-w-none">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ThemeToggle />
    </header>
  )
}

function Account() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  if (status === "loading")
    return (
      <div className="sidebar-profile">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="profile-placeholder h-8 flex-1 rounded-md" />
      </div>
    )
  if (!session?.user)
    return (
      <div className="sidebar-guest">
        <Button
          size="sm"
          variant="default"
          aria-label="Đăng nhập"
          title="Đăng nhập"
          render={
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname === "/" ? "/dashboard" : pathname)}`}
            />
          }
        >
          <span className="login-label">Đăng nhập</span>
          <UserRound
            className="login-collapsed-icon size-4"
            aria-hidden="true"
          />
        </Button>
      </div>
    )
  return (
    <div className="sidebar-profile">
      <Avatar className="account-avatar size-8">
        <AvatarFallback>
          {session.user.name?.trim().charAt(0).toLocaleUpperCase("vi-VN") ||
            "S"}
        </AvatarFallback>
      </Avatar>
      <div className="account-name">
        <p className="text-xs font-medium">{session.user.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {session.user.role === "admin" ? "Lớp trưởng · Admin" : "Sinh viên"}
        </p>
      </div>
      <div className="profile-actions">
        <form action={logout}>
          <Button
            type="submit"
            size="icon-sm"
            variant="ghost"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
