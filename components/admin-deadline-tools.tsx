"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateDeadlineForm } from "@/components/create-deadline-form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { Subject } from "@/lib/types"

export function AdminDeadlineTools({ subjects }: { subjects: Subject[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const openFromLink = () => {
      if (window.location.hash === "#new-deadline") setOpen(true)
    }
    openFromLink()
    window.addEventListener("hashchange", openFromLink)
    return () => window.removeEventListener("hashchange", openFromLink)
  }, [])

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value && window.location.hash === "#new-deadline")
          window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname + window.location.search
          )
      }}
    >
      <div className="section-heading">
        <h2>Deadline đã đăng</h2>
        <DialogTrigger render={<Button />}>
          <Plus className="size-4" /> Thêm mới
        </DialogTrigger>
      </div>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <CreateDeadlineForm subjects={subjects} />
      </DialogContent>
    </Dialog>
  )
}
