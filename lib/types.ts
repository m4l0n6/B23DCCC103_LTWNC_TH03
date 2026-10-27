export type Subject = {
  slug: string
  name: string
  shortName: string
  code: string
  lecturer: string
  description: string
}

export type Deadline = {
  id: string
  subjectSlug: string
  title: string
  description: string
  dueAt: string
  priority: "normal" | "high"
  submissionUrl: string
  createdAt: string
}

export type Completion = {
  userId: string
  deadlineId: string
  completedAt: string
}
export type InProgress = { userId: string; deadlineId: string }
export type Store = {
  deadlines: Deadline[]
  completions: Completion[]
  inProgress?: InProgress[]
  nextId: number
}
export type ActionState = { error?: string; success?: string }
