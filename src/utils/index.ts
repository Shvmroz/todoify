import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns"
import type { TaskStatus, TaskPriority, UserRole } from "../types"

export function formatDate(date: string | undefined): string {
  if (!date) return ""
  try {
    const d = new Date(date)
    if (isToday(d)) return "Today"
    if (isTomorrow(d)) return "Tomorrow"
    return format(d, "MMM d, yyyy")
  } catch {
    return ""
  }
}

export function formatDateTime(date: string | undefined): string {
  if (!date) return ""
  try {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
  } catch {
    return ""
  }
}

export function timeAgo(date: string | undefined): string {
  if (!date) return ""
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ""
  }
}

export function isOverdue(date: string | undefined): boolean {
  if (!date) return false
  try {
    return isPast(new Date(date)) && !isToday(new Date(date))
  } catch {
    return false
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatLiveTimer(startedAt: string | undefined): string {
  if (!startedAt) return ""
  const diff = Date.now() - new Date(startedAt).getTime()
  const totalMinutes = Math.floor(diff / 60000)
  if (totalMinutes < 1) return "just now"
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  working_on: "Working On",
  review: "Review",
  testing: "Testing",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "yellow",
  working_on: "blue",
  review: "purple",
  testing: "orange",
  completed: "green",
  cancelled: "gray",
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "blue",
  none: "gray",
}

export const PRIORITY_ICONS: Record<TaskPriority, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵",
  none: "⚪",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  org_admin: "Org Admin",
  project_manager: "Project Manager",
  team_lead: "Team Lead",
  member: "Member",
  guest: "Guest",
}

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "purple",
  org_admin: "red",
  project_manager: "blue",
  team_lead: "teal",
  member: "green",
  guest: "gray",
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
