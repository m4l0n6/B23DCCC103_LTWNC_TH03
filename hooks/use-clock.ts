"use client"

import { useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  const interval = setInterval(onChange, 30_000)
  return () => clearInterval(interval)
}
const currentMinute = () => Math.floor(Date.now() / 60_000) * 60_000
const serverTime = () => 0

export function useClock() {
  return useSyncExternalStore(subscribe, currentMinute, serverTime)
}
