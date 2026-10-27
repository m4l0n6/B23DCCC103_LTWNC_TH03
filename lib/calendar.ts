const vietnamOffset = 7 * 60 * 60 * 1000

export function calendarDate(value: string | number): string {
  return new Date(new Date(value).getTime() + vietnamOffset)
    .toISOString()
    .slice(0, 10)
}

export function shiftMonth(month: string, amount: number): string {
  const [year, index] = month.split("-").map(Number)
  return new Date(Date.UTC(year, index - 1 + amount, 1))
    .toISOString()
    .slice(0, 7)
}

export function monthDays(month: string): string[] {
  const [year, index] = month.split("-").map(Number)
  const first = new Date(Date.UTC(year, index - 1, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(year, index, 0)).getUTCDate()
  const count = Math.ceil((offset + days) / 7) * 7
  return Array.from({ length: count }, (_, day) =>
    new Date(Date.UTC(year, index - 1, 1 - offset + day))
      .toISOString()
      .slice(0, 10)
  )
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`))
}

export function dayLabel(day: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`))
}
