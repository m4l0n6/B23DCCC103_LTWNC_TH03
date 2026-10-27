"use client"

import { useActionState, useRef } from "react"
import { Plus, LoaderCircle } from "lucide-react"
import { createDeadline } from "@/lib/actions"
import type { ActionState, Subject } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateDeadlineForm({ subjects }: { subjects: Subject[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(
    async (previous: ActionState, data: FormData) => {
      const result = await createDeadline(previous, data)
      if (result.success) formRef.current?.reset()
      return result
    },
    {}
  )
  const subjectOptions = subjects.map((subject) => ({
    value: subject.slug,
    label: subject.name,
  }))
  return (
    <form
      id="new-deadline"
      ref={formRef}
      action={action}
      className="create-form min-w-0"
    >
      <DialogHeader className="mb-6 pr-8">
        <DialogTitle>Thêm deadline mới</DialogTitle>
        <DialogDescription>Các trường có * là bắt buộc.</DialogDescription>
      </DialogHeader>
      <div className="form-grid">
        <div className="field col-span-full">
          <Label htmlFor="title">
            Tên bài tập <span aria-hidden="true">*</span>
          </Label>
          <Input
            name="title"
            id="title"
            required
            minLength={5}
            maxLength={150}
            placeholder="Ví dụ: BTTH 4 · Xây dựng ứng dụng web"
          />
        </div>
        <div className="field">
          <Label htmlFor="subjectSlug">
            Môn học <span aria-hidden="true">*</span>
          </Label>
          <Select
            name="subjectSlug"
            defaultValue={subjects[0]?.slug}
            items={subjectOptions}
          >
            <SelectTrigger id="subjectSlug" className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.slug} value={subject.slug}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          <Label htmlFor="dueAt">
            Hạn nộp <span aria-hidden="true">*</span>
          </Label>
          <Input name="dueAt" id="dueAt" type="datetime-local" required />
        </div>
        <div className="field col-span-full">
          <Label htmlFor="description">
            Nội dung bài tập <span aria-hidden="true">*</span>
          </Label>
          <Textarea
            name="description"
            id="description"
            required
            minLength={10}
            maxLength={5000}
            rows={4}
            placeholder="Yêu cầu bài tập, nội dung cần nộp và các lưu ý…"
          />
        </div>
        <div className="field">
          <Label htmlFor="priority">Mức ưu tiên</Label>
          <Select
            name="priority"
            defaultValue="normal"
            items={[
              { value: "normal", label: "Bình thường" },
              { value: "high", label: "Ưu tiên cao" },
            ]}
          >
            <SelectTrigger id="priority" className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Bình thường</SelectItem>
              <SelectItem value="high">Ưu tiên cao</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          <Label htmlFor="submissionUrl">
            Liên kết nộp bài{" "}
            <span className="font-normal text-muted-foreground">
              (tùy chọn)
            </span>
          </Label>
          <Input
            name="submissionUrl"
            id="submissionUrl"
            type="url"
            maxLength={2000}
            placeholder="https://…"
          />
        </div>
      </div>
      <div aria-live="polite">
        {state.error && (
          <p role="alert" className="form-error">
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="form-success">
            {state.success}
          </p>
        )}
      </div>
      <div className="form-footer justify-end!">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {pending ? "Đang lưu…" : "Thêm deadline"}
        </Button>
      </div>
    </form>
  )
}
