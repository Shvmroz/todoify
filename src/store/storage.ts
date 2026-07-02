import type { AppStore, User, Project, Section, Task, Comment, Activity, Notification, Invitation, Label } from "../types"
import { uuidv4 } from "./uuid"

const STORAGE_KEY = "pm_app_data"

const PROJECT_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4"]
const PROJECT_ICONS = ["🚀", "💡", "🔥", "⚡", "🎯", "🛠️", "🌟", "🎨", "📱", "🔮"]

function generateSeedData(): AppStore {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString()

  const users: User[] = [
    {
      id: "user_1",
      email: "admin@todoify.com",
      username: "admin",
      name: "Alex Johnson",
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=Alex`,
      role: "org_admin",
      bio: "Organization Admin",
      timezone: "UTC",
      createdAt: lastWeek,
      lastActive: now,
      isOnline: true,
    },
    {
      id: "user_2",
      email: "sarah@todoify.com",
      username: "sarah",
      name: "Sarah Chen",
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah`,
      role: "project_manager",
      bio: "Project Manager",
      timezone: "UTC",
      createdAt: lastWeek,
      lastActive: yesterday,
      isOnline: true,
    },
    {
      id: "user_3",
      email: "mike@todoify.com",
      username: "mike",
      name: "Mike Davis",
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=Mike`,
      role: "team_lead",
      bio: "Team Lead",
      timezone: "UTC",
      createdAt: lastWeek,
      lastActive: now,
      isOnline: false,
    },
    {
      id: "user_4",
      email: "emma@todoify.com",
      username: "emma",
      name: "Emma Wilson",
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=Emma`,
      role: "member",
      bio: "Frontend Developer",
      timezone: "UTC",
      createdAt: lastWeek,
      lastActive: yesterday,
      isOnline: true,
    },
    {
      id: "user_5",
      email: "james@todoify.com",
      username: "james",
      name: "James Brown",
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=James`,
      role: "member",
      bio: "Backend Developer",
      timezone: "UTC",
      createdAt: lastWeek,
      lastActive: now,
      isOnline: false,
    },
  ]

  const projects: Project[] = [
    {
      id: "proj_1",
      name: "E-Commerce Platform",
      description: "Build a modern e-commerce platform with React and Node.js",
      color: "#6366f1",
      icon: "🛒",
      status: "active",
      tags: ["frontend", "backend", "react"],
      createdBy: "user_1",
      createdAt: lastWeek,
      updatedAt: now,
      order: 0,
      isFavorite: true,
      isPinned: true,
      organizationId: "org_1",
      members: [
        { userId: "user_1", role: "org_admin", joinedAt: lastWeek },
        { userId: "user_2", role: "project_manager", joinedAt: lastWeek },
        { userId: "user_3", role: "team_lead", joinedAt: lastWeek },
        { userId: "user_4", role: "member", joinedAt: lastWeek },
        { userId: "user_5", role: "member", joinedAt: lastWeek },
      ],
    },
    {
      id: "proj_2",
      name: "Mobile App Redesign",
      description: "Redesign the mobile app for better UX and performance",
      color: "#8b5cf6",
      icon: "📱",
      status: "active",
      tags: ["design", "mobile", "ux"],
      createdBy: "user_2",
      createdAt: lastWeek,
      updatedAt: yesterday,
      order: 1,
      isFavorite: false,
      organizationId: "org_1",
      members: [
        { userId: "user_1", role: "org_admin", joinedAt: lastWeek },
        { userId: "user_2", role: "project_manager", joinedAt: lastWeek },
        { userId: "user_4", role: "member", joinedAt: lastWeek },
      ],
    },
    {
      id: "proj_3",
      name: "API Gateway Service",
      description: "Microservices API gateway with authentication and rate limiting",
      color: "#22c55e",
      icon: "⚡",
      status: "active",
      tags: ["backend", "api", "microservices"],
      createdBy: "user_1",
      createdAt: lastWeek,
      updatedAt: now,
      order: 2,
      organizationId: "org_1",
      members: [
        { userId: "user_1", role: "org_admin", joinedAt: lastWeek },
        { userId: "user_3", role: "team_lead", joinedAt: lastWeek },
        { userId: "user_5", role: "member", joinedAt: lastWeek },
      ],
    },
  ]

  const sections: Section[] = [
    { id: "sec_1", projectId: "proj_1", name: "Backlog", order: 0, color: "#94a3b8", createdAt: lastWeek },
    { id: "sec_2", projectId: "proj_1", name: "Todo", order: 1, color: "#60a5fa", createdAt: lastWeek },
    { id: "sec_3", projectId: "proj_1", name: "In Progress", order: 2, color: "#f97316", createdAt: lastWeek },
    { id: "sec_4", projectId: "proj_1", name: "Review", order: 3, color: "#a855f7", createdAt: lastWeek },
    { id: "sec_5", projectId: "proj_1", name: "Done", order: 4, color: "#22c55e", createdAt: lastWeek },
    { id: "sec_6", projectId: "proj_2", name: "Todo", order: 0, color: "#60a5fa", createdAt: lastWeek },
    { id: "sec_7", projectId: "proj_2", name: "In Progress", order: 1, color: "#f97316", createdAt: lastWeek },
    { id: "sec_8", projectId: "proj_2", name: "Done", order: 2, color: "#22c55e", createdAt: lastWeek },
    { id: "sec_9", projectId: "proj_3", name: "Backlog", order: 0, color: "#94a3b8", createdAt: lastWeek },
    { id: "sec_10", projectId: "proj_3", name: "In Progress", order: 1, color: "#f97316", createdAt: lastWeek },
    { id: "sec_11", projectId: "proj_3", name: "Done", order: 2, color: "#22c55e", createdAt: lastWeek },
  ]

  const tasks: Task[] = [
    {
      id: "task_1",
      projectId: "proj_1",
      sectionId: "sec_3",
      title: "Setup authentication system",
      description: "Implement JWT-based authentication with refresh tokens",
      status: "working_on",
      priority: "high",
      labels: ["backend", "security"],
      createdBy: "user_1",
      assignedBy: "user_1",
      assignees: [{ userId: "user_5", assignedBy: "user_1", assignedAt: lastWeek }],
      followers: ["user_1", "user_2"],
      startDate: lastWeek,
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      progress: 60,
      checklist: [
        { id: "cl_1", title: "Setup JWT library", completed: true, completedBy: "user_5", completedAt: yesterday, order: 0 },
        { id: "cl_2", title: "Create login endpoint", completed: true, completedBy: "user_5", completedAt: yesterday, order: 1 },
        { id: "cl_3", title: "Add refresh token logic", completed: false, order: 2 },
        { id: "cl_4", title: "Write unit tests", completed: false, order: 3 },
        { id: "cl_5", title: "Document API", completed: false, order: 4 },
      ],
      attachments: [],
      timeEntries: [
        { id: "te_1", userId: "user_5", startedAt: yesterday, stoppedAt: yesterday, duration: 120, note: "Initial setup" },
      ],
      customFields: [],
      order: 0,
      createdAt: lastWeek,
      updatedAt: now,
      startedWorkingAt: yesterday,
      startedBy: "user_5",
    },
    {
      id: "task_2",
      projectId: "proj_1",
      sectionId: "sec_3",
      title: "Design product catalog UI",
      description: "Create responsive product listing and detail pages",
      status: "working_on",
      priority: "medium",
      labels: ["frontend", "design"],
      createdBy: "user_2",
      assignedBy: "user_2",
      assignees: [{ userId: "user_4", assignedBy: "user_2", assignedAt: lastWeek }],
      followers: ["user_2"],
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      progress: 35,
      checklist: [
        { id: "cl_6", title: "Create wireframes", completed: true, completedBy: "user_4", completedAt: yesterday, order: 0 },
        { id: "cl_7", title: "Build product card component", completed: false, order: 1 },
        { id: "cl_8", title: "Implement filters", completed: false, order: 2 },
      ],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 1,
      createdAt: lastWeek,
      updatedAt: yesterday,
      startedWorkingAt: yesterday,
      startedBy: "user_4",
    },
    {
      id: "task_3",
      projectId: "proj_1",
      sectionId: "sec_2",
      title: "Implement shopping cart",
      description: "Build cart functionality with persistent storage",
      status: "pending",
      priority: "high",
      labels: ["frontend", "backend"],
      createdBy: "user_1",
      assignees: [{ userId: "user_4", assignedBy: "user_1", assignedAt: lastWeek }],
      followers: ["user_1"],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      progress: 0,
      checklist: [],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 0,
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
    {
      id: "task_4",
      projectId: "proj_1",
      sectionId: "sec_2",
      title: "Payment gateway integration",
      description: "Integrate Stripe for payment processing",
      status: "pending",
      priority: "critical",
      labels: ["backend", "payments"],
      createdBy: "user_2",
      assignees: [{ userId: "user_5", assignedBy: "user_2", assignedAt: lastWeek }],
      followers: ["user_1", "user_2"],
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      progress: 0,
      checklist: [],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 1,
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
    {
      id: "task_5",
      projectId: "proj_1",
      sectionId: "sec_5",
      title: "Setup CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment",
      status: "completed",
      priority: "medium",
      labels: ["devops"],
      createdBy: "user_3",
      assignees: [{ userId: "user_3", assignedBy: "user_1", assignedAt: lastWeek }],
      followers: ["user_1"],
      completedAt: yesterday,
      completedBy: "user_3",
      progress: 100,
      checklist: [
        { id: "cl_9", title: "Setup GitHub Actions", completed: true, completedBy: "user_3", completedAt: yesterday, order: 0 },
        { id: "cl_10", title: "Configure Docker", completed: true, completedBy: "user_3", completedAt: yesterday, order: 1 },
      ],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 0,
      createdAt: lastWeek,
      updatedAt: yesterday,
    },
    {
      id: "task_6",
      projectId: "proj_1",
      sectionId: "sec_4",
      title: "Database schema design",
      description: "Design and implement the database schema for all entities",
      status: "review",
      priority: "high",
      labels: ["backend", "database"],
      createdBy: "user_1",
      assignees: [{ userId: "user_5", assignedBy: "user_1", assignedAt: lastWeek }],
      followers: ["user_1", "user_3"],
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      progress: 90,
      checklist: [],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 0,
      createdAt: lastWeek,
      updatedAt: now,
    },
    {
      id: "task_7",
      projectId: "proj_2",
      sectionId: "sec_7",
      title: "Redesign onboarding flow",
      description: "Create new user onboarding experience",
      status: "working_on",
      priority: "high",
      labels: ["design", "ux"],
      createdBy: "user_2",
      assignees: [{ userId: "user_4", assignedBy: "user_2", assignedAt: lastWeek }],
      followers: ["user_2"],
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      progress: 45,
      checklist: [],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 0,
      createdAt: lastWeek,
      updatedAt: now,
      startedWorkingAt: yesterday,
      startedBy: "user_4",
    },
    {
      id: "task_8",
      projectId: "proj_1",
      sectionId: "sec_1",
      title: "Performance optimization",
      description: "Optimize app performance and loading times",
      status: "pending",
      priority: "low",
      labels: ["performance"],
      createdBy: "user_3",
      assignees: [],
      followers: ["user_3"],
      dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      progress: 0,
      checklist: [],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: 0,
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
  ]

  const activities: Activity[] = [
    {
      id: "act_1",
      taskId: "task_1",
      projectId: "proj_1",
      userId: "user_5",
      type: "status_changed",
      oldValue: "pending",
      newValue: "working_on",
      createdAt: yesterday,
    },
    {
      id: "act_2",
      taskId: "task_1",
      projectId: "proj_1",
      userId: "user_1",
      type: "task_created",
      createdAt: lastWeek,
    },
    {
      id: "act_3",
      taskId: "task_2",
      projectId: "proj_1",
      userId: "user_4",
      type: "checklist_updated",
      newValue: "Create wireframes",
      createdAt: yesterday,
    },
  ]

  const comments: Comment[] = [
    {
      id: "comm_1",
      taskId: "task_1",
      projectId: "proj_1",
      userId: "user_5",
      content: "Started working on this. The JWT library is already set up. @user_2 please review when done.",
      reactions: [{ emoji: "👍", users: ["user_1", "user_2"] }],
      mentions: ["user_2"],
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "comm_2",
      taskId: "task_1",
      projectId: "proj_1",
      userId: "user_2",
      content: "Great progress! Make sure to handle token expiration edge cases.",
      parentId: "comm_1",
      reactions: [],
      mentions: [],
      createdAt: now,
      updatedAt: now,
    },
  ]

  const notifications: Notification[] = [
    {
      id: "notif_1",
      userId: "user_1",
      type: "status_changed",
      title: "Task status updated",
      message: "James Brown changed 'Setup authentication system' to Working On",
      projectId: "proj_1",
      taskId: "task_1",
      fromUserId: "user_5",
      isRead: false,
      createdAt: yesterday,
    },
    {
      id: "notif_2",
      userId: "user_1",
      type: "comment_added",
      title: "New comment",
      message: "James Brown commented on 'Setup authentication system'",
      projectId: "proj_1",
      taskId: "task_1",
      fromUserId: "user_5",
      isRead: false,
      createdAt: now,
    },
    {
      id: "notif_3",
      userId: "user_1",
      type: "deadline_near",
      title: "Deadline approaching",
      message: "Task 'Database schema design' is due tomorrow",
      projectId: "proj_1",
      taskId: "task_6",
      isRead: true,
      createdAt: now,
    },
  ]

  const invitations: Invitation[] = []

  const labels: Label[] = [
    { id: "lbl_1", name: "frontend", color: "#3b82f6", projectId: "proj_1" },
    { id: "lbl_2", name: "backend", color: "#22c55e", projectId: "proj_1" },
    { id: "lbl_3", name: "design", color: "#a855f7", projectId: "proj_1" },
    { id: "lbl_4", name: "security", color: "#ef4444", projectId: "proj_1" },
    { id: "lbl_5", name: "database", color: "#f97316", projectId: "proj_1" },
    { id: "lbl_6", name: "devops", color: "#14b8a6", projectId: "proj_1" },
    { id: "lbl_7", name: "design", color: "#a855f7", projectId: "proj_2" },
    { id: "lbl_8", name: "ux", color: "#ec4899", projectId: "proj_2" },
    { id: "lbl_9", name: "backend", color: "#22c55e", projectId: "proj_3" },
    { id: "lbl_10", name: "api", color: "#6366f1", projectId: "proj_3" },
  ]

  return {
    users,
    currentUser: null,
    organizations: [
      {
        id: "org_1",
        name: "Todoify",
        slug: "todoify",
        description: "Building the future of project management",
        ownerId: "user_1",
        createdAt: lastWeek,
      },
    ],
    projects,
    sections,
    tasks,
    activities,
    comments,
    notifications,
    invitations,
    labels,
    recentlyViewed: ["proj_1", "proj_2"],
  }
}

export function loadStore(): AppStore {
  // Check if user is logged in (persisted in localStorage)
  const savedCurrentUserId = localStorage.getItem("pm_current_user_id")
  
  const seed = generateSeedData()
  
  // If a user was logged in before, restore that user
  if (savedCurrentUserId) {
    const user = seed.users.find(u => u.id === savedCurrentUserId)
    if (user) {
      seed.currentUser = user
    }
  }
  
  saveStore(seed)
  return seed
}

export function saveStore(store: AppStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    // Also save the currentUser ID so we can restore the session on refresh
    if (store.currentUser) {
      localStorage.setItem("pm_current_user_id", store.currentUser.id)
    } else {
      localStorage.removeItem("pm_current_user_id")
    }
  } catch {
    // ignore storage errors
  }
}

export { uuidv4, PROJECT_COLORS, PROJECT_ICONS }
