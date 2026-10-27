import { Skeleton } from "@/components/ui/skeleton"

type Variant =
  | "overview"
  | "deadlines"
  | "subject"
  | "detail"
  | "dashboard"
  | "completed"
  | "admin"
  | "login"

function Heading() {
  return (
    <div className="page-heading">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
    </div>
  )
}

function Metrics() {
  return (
    <div className="metrics-strip">
      {[0, 1, 2, 3].map((index) => (
        <div className="metric space-y-3" key={index}>
          <Skeleton className="h-4 w-24 max-w-full" />
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-3 w-32 max-w-full" />
        </div>
      ))}
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="deadline-calendar calendar-skeleton" aria-hidden="true">
      <div className="calendar-heading">
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="calendar-weekdays">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: 35 }, (_, index) => (
          <div className="calendar-day" key={index}>
            <Skeleton className="h-6 w-6 rounded-lg" />
            {[8, 12, 19, 27].includes(index) && (
              <Skeleton className="h-4 w-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskList() {
  return (
    <div className="task-workspace">
      <CalendarSkeleton />
      <div className="task-list-pane">
        <div className="list-tabs">
          <Skeleton className="mb-3 h-5 w-16" />
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="mb-3 h-5 w-16" />
        </div>
        <div className="filter-bar">
          <div className="search-field">
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
        <div className="list-caption">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="deadline-rows">
          {[0, 1, 2, 3].map((index) => (
            <div className="deadline-row" key={index}>
              <div className="deadline-identity space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div className="deadline-time">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PageSkeleton({ variant }: { variant: Variant }) {
  if (variant === "login")
    return (
      <main
        className="login-page"
        aria-busy="true"
        aria-label="Đang tải đăng nhập"
      >
        <section className="login-story">
          <Skeleton className="h-8 w-52" />
          <div className="space-y-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </section>
        <section className="login-content">
          <div className="login-box space-y-6">
            <Skeleton className="h-4 w-28" />
            <Heading />
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
            <Skeleton className="h-32 w-full" />
          </div>
        </section>
      </main>
    )
  return (
    <div
      className="page-skeleton"
      aria-busy="true"
      aria-label={`Đang tải ${variant === "dashboard" || variant === "completed" ? "bảng tiến độ cá nhân" : variant === "detail" ? "chi tiết deadline" : variant === "admin" ? "quản lý deadline" : "deadline"}`}
    >
      <span role="status" className="sr-only">
        Đang tải nội dung…
      </span>
      {variant === "detail" ? (
        <>
          <Skeleton className="mb-7 h-4 w-32" />
          <Heading />
          <div className="detail-grid">
            <div className="panel space-y-5">
              <Skeleton className="h-5 w-40" />
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
              <Skeleton className="mt-8 h-8 w-32" />
            </div>
            <div className="panel space-y-6">
              <Skeleton className="h-5 w-40" />
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <Heading />
          {variant === "dashboard" && (
            <div className="progress-panel mb-6 space-y-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2 w-full" />
            </div>
          )}
          {(variant === "overview" || variant === "dashboard") && <Metrics />}
          {variant === "subject" && (
            <Skeleton className="mb-7 h-4 w-72 max-w-full" />
          )}
          {variant === "admin" && (
            <div className="section-heading">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          )}
          <TaskList />
          {variant === "overview" && (
            <div className="subjects-section">
              <Skeleton className="mb-5 h-5 w-48" />
              <div className="subjects-grid">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
