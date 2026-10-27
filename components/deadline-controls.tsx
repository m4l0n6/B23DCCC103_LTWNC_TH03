"use client"

import { useActionState, useState } from "react"
import { Check, RotateCcw, Trash2, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { deleteDeadline, setCompleted } from "@/lib/actions"
import type { ActionState } from "@/lib/types"

const initialState: ActionState = {}

export function CompletionButton({
  id,
  completed,
}: {
  id: string
  completed: boolean
}) {
  const [state, action, pending] = useActionState(
    async (previous: ActionState & { completed: boolean }, form: FormData) => {
      const result = await setCompleted(previous, form)
      return {
        ...result,
        completed: result.success
          ? form.get("completed") === "true"
          : previous.completed,
      }
    },
    { ...initialState, completed }
  )
  const isCompleted = state.completed
  return (
    <form action={action} className="row-action">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="completed" value={String(!isCompleted)} />
      <Button
        type="submit"
        variant={isCompleted ? "ghost" : "default"}
        size="sm"
        disabled={pending}
        aria-label={isCompleted ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" />
        ) : isCompleted ? (
          <RotateCcw className="size-3.5" />
        ) : (
          <Check className="size-3.5" />
        )}
        <span>{isCompleted ? "Hoàn tác" : "Hoàn thành"}</span>
      </Button>
      {state.error && (
        <p role="alert" className="form-error text-xs">
          {state.error}
        </p>
      )}
      <span role="status" className="sr-only">
        {state.success}
      </span>
    </form>
  )
}

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(deleteDeadline, initialState)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Xóa ${title}`} />
        }
      >
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa deadline này?</AlertDialogTitle>
          <AlertDialogDescription>
            “{title}” sẽ bị xóa cùng trạng thái hoàn thành của các sinh viên.
            Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          {state.error && (
            <p className="form-error mb-4" role="alert">
              {state.error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Giữ lại</AlertDialogCancel>
            <Button
              type="submit"
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending && <LoaderCircle className="size-4 animate-spin" />}Xóa
              deadline
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
