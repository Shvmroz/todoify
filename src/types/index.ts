// ─── USER & AUTH ─────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "org_admin" | "project_manager" | "team_lead" | "member" | "guest"

export interface User {
  id: string
  email: string
  username: string
  name: string
  avatar?: string
  role: UserRole
  bio?: string
  timezone?: string
  createdAt: string
  lastActive: string
  isOnline?: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── ORGANIZATION ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  avatar?: string
  description?: string
  ownerId: string
  createdAt: string
}

// ─── PROJECT ──────────────────────────────────────────────────────────────────

export type ProjectStatus = "active" | "archived" | "completed" | "on_hold"

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  coverImage?: string
  status: ProjectStatus
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  order: number
  isFavorite?: boolean
  isPinned?: boolean
  organizationId: string
  members: ProjectMember[]
}

export interface ProjectMember {
  userId: string
  role: UserRole
  joinedAt: string
}

// ─── INVITATION ───────────────────────────────────────────────────────────────

export type InvitationStatus = "pending" | "accepted" | "rejected" | "cancelled"

export interface Invitation {
  id: string
  projectId: string
  invitedBy: string
  invitedUser: string
  role: UserRole
  message?: string
  status: InvitationStatus
  createdAt: string
  updatedAt: string
}

// ─── SECTION ──────────────────────────────────────────────────────────────────

export interface Section {
  id: string
  projectId: string
  name: string
  order: number
  color?: string
  isCollapsed?: boolean
  createdAt: string
}

// ─── TASK ─────────────────────────────────────────────────────────────────────

export type TaskStatus = "pending" | "working_on" | "review" | "testing" | "completed" | "cancelled"
export type TaskPriority = "critical" | "high" | "medium" | "low" | "none"

export interface TaskAssignment {
  userId: string
  assignedBy: string
  assignedAt: string
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  completedBy?: string
  completedAt?: string
  order: number
}

export interface TimeEntry {
  id: string
  userId: string
  startedAt: string
  stoppedAt?: string
  duration?: number
  note?: string
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface CustomField {
  id: string
  name: string
  type: "text" | "number" | "date" | "boolean" | "select"
  value: string | number | boolean | null
}

export interface Task {
  id: string
  projectId: string
  sectionId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  labels: string[]
  createdBy: string
  assignedBy?: string
  assignees: TaskAssignment[]
  followers: string[]
  startDate?: string
  dueDate?: string
  completedAt?: string
  completedBy?: string
  estimatedTime?: number
  spentTime?: number
  progress: number
  checklist: ChecklistItem[]
  attachments: TaskAttachment[]
  timeEntries: TimeEntry[]
  customFields: CustomField[]
  order: number
  createdAt: string
  updatedAt: string
  isStarred?: boolean
  parentTaskId?: string
  isRecurring?: boolean
  startedWorkingAt?: string
  startedBy?: string
}

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────

export type ActivityType =
  | "task_created" | "task_updated" | "description_edited"
  | "assignee_added" | "assignee_removed" | "status_changed"
  | "priority_changed" | "checklist_updated" | "comment_added"
  | "attachment_uploaded" | "attachment_deleted" | "time_started"
  | "time_stopped" | "mentioned" | "due_date_changed" | "label_added"
  | "label_removed" | "section_changed" | "task_completed" | "task_deleted"

export interface Activity {
  id: string
  taskId: string
  projectId: string
  userId: string
  type: ActivityType
  oldValue?: string
  newValue?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// ─── COMMENT ──────────────────────────────────────────────────────────────────

export interface CommentReaction {
  emoji: string
  users: string[]
}

export interface Comment {
  id: string
  taskId: string
  projectId: string
  userId: string
  content: string
  parentId?: string
  reactions: CommentReaction[]
  isPinned?: boolean
  isEdited?: boolean
  mentions: string[]
  createdAt: string
  updatedAt: string
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "assigned" | "mentioned" | "invited" | "status_changed"
  | "comment_added" | "checklist_completed" | "deadline_near"
  | "task_completed" | "invitation_accepted" | "invitation_rejected"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  projectId?: string
  taskId?: string
  fromUserId?: string
  isRead: boolean
  createdAt: string
}

// ─── LABEL ────────────────────────────────────────────────────────────────────

export interface Label {
  id: string
  name: string
  color: string
  projectId: string
}

// ─── APP STORE ────────────────────────────────────────────────────────────────

export interface AppStore {
  users: User[]
  currentUser: User | null
  organizations: Organization[]
  projects: Project[]
  sections: Section[]
  tasks: Task[]
  activities: Activity[]
  comments: Comment[]
  notifications: Notification[]
  invitations: Invitation[]
  labels: Label[]
  recentlyViewed: string[]
}
