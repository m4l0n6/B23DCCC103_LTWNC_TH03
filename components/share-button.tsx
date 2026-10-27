"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState("")
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({ title, url: window.location.href })
      else {
        await navigator.clipboard.writeText(window.location.href)
        setStatus("Đã sao chép liên kết")
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setStatus(
          "Không thể sao chép. Bạn có thể sao chép URL từ thanh địa chỉ."
        )
    }
  }
  return (
    <div className="share-control">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Chia sẻ deadline"
        onClick={share}
      >
        {status.startsWith("Đã") ? (
          <Check className="size-4" />
        ) : (
          <Share2 className="size-4" />
        )}
      </Button>
      {status && (
        <span className="share-feedback" role="status">
          {status}
        </span>
      )}
    </div>
  )
}
