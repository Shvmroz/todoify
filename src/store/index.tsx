import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import type { AppStore, User, Project, Section, Task, Comment, Activity, Notification, Invitation, Label, TaskStatus, UserRole } from "../types"
import { loadStore, saveStore } from "./storage"
import { uuidv4 } from "./uuid"

// ─── ACTIONS ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_STORE"; payload: AppStore }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "CREATE_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Partial<Project> & { id: string } }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "REORDER_PROJECTS"; payload: Project[] }
  | { type: "CREATE_SECTION"; payload: Section }
  | { type: "UPDATE_SECTION"; payload: Partial<Section> & { id: string } }
  | { type: "DELETE_SECTION"; payload: string }
  | { type: "REORDER_SECTIONS"; payload: Section[] }
  | { type: "CREATE_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Partial<Task> & { id: string } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: Task[] }
  | { type: "ADD_COMMENT"; payload: Comment }
  | { type: "UPDATE_COMMENT"; payload: Partial<Comment> & { id: string } }
  | { type: "DELETE_COMMENT"; payload: string }
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "ADD_INVITATION"; payload: Invitation }
  | { type: "UPDATE_INVITATION"; payload: Partial<Invitation> & { id: string } }
  | { type: "ADD_LABEL"; payload: Label }
  | { type: "REMOVE_LABEL"; payload: string }
  | { type: "ADD_RECENTLY_VIEWED"; payload: string }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: Partial<User> & { id: string } }

// ─── REDUCER ──────────────────────────────────────────────────────────────────

function reducer(state: AppStore, action: Action): AppStore {
  let next: AppStore

  switch (action.type) {
    case "SET_STORE":
      return action.payload

    case "LOGIN":
      next = { ...state, currentUser: action.payload }
      break

    case "LOGOUT":
      next = { ...state, currentUser: null }
      break

    case "CREATE_PROJECT":
      next = { ...state, projects: [...state.projects, action.payload] }
      break

    case "UPDATE_PROJECT":
      next = {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: new Date().toISOString() } : p
        ),
      }
      break

    case "DELETE_PROJECT":
      next = {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        sections: state.sections.filter(s => s.projectId !== action.payload),
        tasks: state.tasks.filter(t => t.projectId !== action.payload),
      }
      break

    case "REORDER_PROJECTS":
      next = { ...state, projects: action.payload }
      break

    case "CREATE_SECTION":
      next = { ...state, sections: [...state.sections, action.payload] }
      break

    case "UPDATE_SECTION":
      next = {
        ...state,
        sections: state.sections.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      }
      break

    case "DELETE_SECTION":
      next = {
        ...state,
        sections: state.sections.filter(s => s.id !== action.payload),
        tasks: state.tasks.filter(t => t.sectionId !== action.payload),
      }
      break

    case "REORDER_SECTIONS":
      next = { ...state, sections: action.payload }
      break

    case "CREATE_TASK":
      next = { ...state, tasks: [...state.tasks, action.payload] }
      break

    case "UPDATE_TASK":
      next = {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload, updatedAt: new Date().toISOString() } : t
        ),
      }
      break

    case "DELETE_TASK":
      next = { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
      break

    case "REORDER_TASKS":
      next = { ...state, tasks: action.payload }
      break

    case "ADD_COMMENT":
      next = { ...state, comments: [...state.comments, action.payload] }
      break

    case "UPDATE_COMMENT":
      next = {
        ...state,
        comments: state.comments.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: new Date().toISOString() } : c
        ),
      }
      break

    case "DELETE_COMMENT":
      next = { ...state, comments: state.comments.filter(c => c.id !== action.payload) }
      break

    case "ADD_ACTIVITY":
      next = { ...state, activities: [action.payload, ...state.activities] }
      break

    case "ADD_NOTIFICATION":
      next = { ...state, notifications: [action.payload, ...state.notifications] }
      break

    case "MARK_NOTIFICATION_READ":
      next = {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
      }
      break

    case "MARK_ALL_NOTIFICATIONS_READ":
      next = {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      }
      break

    case "ADD_INVITATION":
      next = { ...state, invitations: [...state.invitations, action.payload] }
      break

    case "UPDATE_INVITATION":
      next = {
        ...state,
        invitations: state.invitations.map(i =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i
        ),
      }
      break

    case "ADD_LABEL":
      next = { ...state, labels: [...state.labels, action.payload] }
      break

    case "REMOVE_LABEL":
      next = { ...state, labels: state.labels.filter(l => l.id !== action.payload) }
      break

    case "ADD_RECENTLY_VIEWED": {
      const filtered = state.recentlyViewed.filter(id => id !== action.payload)
      next = { ...state, recentlyViewed: [action.payload, ...filtered].slice(0, 10) }
      break
    }

    case "ADD_USER":
      next = { ...state, users: [...state.users, action.payload] }
      break

    case "UPDATE_USER":
      next = {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u),
        currentUser: state.currentUser?.id === action.payload.id
          ? { ...state.currentUser, ...action.payload }
          : state.currentUser,
      }
      break

    default:
      return state
  }

  saveStore(next)
  return next
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  store: AppStore
  dispatch: React.Dispatch<Action>
  // helpers
  createProject: (data: Partial<Project>) => Project
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  toggleFavorite: (id: string) => void
  togglePin: (id: string) => void
  createSection: (projectId: string, name: string) => Section
  updateSection: (id: string, data: Partial<Section>) => void
  deleteSection: (id: string) => void
  createTask: (data: Partial<Task>) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  changeTaskStatus: (taskId: string, status: TaskStatus) => void
  addComment: (taskId: string, projectId: string, content: string, parentId?: string) => void
  deleteComment: (id: string) => void
  addActivity: (taskId: string, projectId: string, type: Activity["type"], oldValue?: string, newValue?: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  inviteUser: (projectId: string, userId: string, role: UserRole, message?: string) => void
  respondToInvitation: (invitationId: string, accept: boolean) => void
  login: (email: string, password: string) => boolean
  register: (data: Partial<User> & { password: string }) => boolean
  logout: () => void
  addRecentlyViewed: (projectId: string) => void
  getUserById: (id: string) => User | undefined
  getProjectTasks: (projectId: string) => Task[]
  getProjectSections: (projectId: string) => Section[]
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, dispatch] = useReducer(reducer, null, () => loadStore())

  const createProject = useCallback((data: Partial<Project>): Project => {
    const project: Project = {
      id: uuidv4(),
      name: data.name ?? "Untitled Project",
      description: data.description,
      color: data.color ?? "#6366f1",
      icon: data.icon ?? "🚀",
      status: data.status ?? "active",
      tags: data.tags ?? [],
      createdBy: store.currentUser?.id ?? "user_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: store.projects.length,
      organizationId: data.organizationId ?? "org_1",
      members: data.members ?? [{ userId: store.currentUser?.id ?? "user_1", role: "project_manager", joinedAt: new Date().toISOString() }],
    }
    dispatch({ type: "CREATE_PROJECT", payload: project })
    return project
  }, [store.currentUser, store.projects.length])

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    dispatch({ type: "UPDATE_PROJECT", payload: { ...data, id } })
  }, [])

  const deleteProject = useCallback((id: string) => {
    dispatch({ type: "DELETE_PROJECT", payload: id })
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const project = store.projects.find(p => p.id === id)
    if (project) dispatch({ type: "UPDATE_PROJECT", payload: { id, isFavorite: !project.isFavorite } })
  }, [store.projects])

  const togglePin = useCallback((id: string) => {
    const project = store.projects.find(p => p.id === id)
    if (project) dispatch({ type: "UPDATE_PROJECT", payload: { id, isPinned: !project.isPinned } })
  }, [store.projects])

  const createSection = useCallback((projectId: string, name: string): Section => {
    const existing = store.sections.filter(s => s.projectId === projectId)
    const section: Section = {
      id: uuidv4(),
      projectId,
      name,
      order: existing.length,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "CREATE_SECTION", payload: section })
    return section
  }, [store.sections])

  const updateSection = useCallback((id: string, data: Partial<Section>) => {
    dispatch({ type: "UPDATE_SECTION", payload: { ...data, id } })
  }, [])

  const deleteSection = useCallback((id: string) => {
    dispatch({ type: "DELETE_SECTION", payload: id })
  }, [])

  const createTask = useCallback((data: Partial<Task>): Task => {
    const sectionTasks = store.tasks.filter(t => t.sectionId === data.sectionId)
    const task: Task = {
      id: uuidv4(),
      projectId: data.projectId ?? "",
      sectionId: data.sectionId ?? "",
      title: data.title ?? "Untitled Task",
      description: data.description,
      status: data.status ?? "pending",
      priority: data.priority ?? "medium",
      labels: data.labels ?? [],
      createdBy: store.currentUser?.id ?? "user_1",
      assignees: data.assignees ?? [],
      followers: [store.currentUser?.id ?? "user_1"],
      progress: 0,
      checklist: [],
      attachments: [],
      timeEntries: [],
      customFields: [],
      order: sectionTasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: data.dueDate,
      startDate: data.startDate,
    }
    dispatch({ type: "CREATE_TASK", payload: task })
    addActivity(task.id, task.projectId, "task_created")
    return task
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentUser, store.tasks])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    dispatch({ type: "UPDATE_TASK", payload: { ...data, id } })
  }, [])

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id })
  }, [])

  const changeTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    const task = store.tasks.find(t => t.id === taskId)
    if (!task || task.status === status) return

    const now = new Date().toISOString()
    const updates: Partial<Task> = { status }

    if (status === "working_on" && task.status !== "working_on") {
      updates.startedWorkingAt = now
      updates.startedBy = store.currentUser?.id
    }
    if (status === "completed") {
      updates.completedAt = now
      updates.completedBy = store.currentUser?.id
      updates.progress = 100
    }

    dispatch({ type: "UPDATE_TASK", payload: { ...updates, id: taskId } })
    addActivity(taskId, task.projectId, "status_changed", task.status, status)

    // notification
    if (task.createdBy !== store.currentUser?.id) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: uuidv4(),
          userId: task.createdBy,
          type: "status_changed",
          title: "Task status updated",
          message: `${store.currentUser?.name} changed '${task.title}' to ${status.replace(/_/g, " ")}`,
          projectId: task.projectId,
          taskId,
          fromUserId: store.currentUser?.id,
          isRead: false,
          createdAt: now,
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tasks, store.currentUser])

  const addComment = useCallback((taskId: string, projectId: string, content: string, parentId?: string) => {
    const comment: Comment = {
      id: uuidv4(),
      taskId,
      projectId,
      userId: store.currentUser?.id ?? "user_1",
      content,
      parentId,
      reactions: [],
      mentions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_COMMENT", payload: comment })
    addActivity(taskId, projectId, "comment_added")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentUser])

  const deleteComment = useCallback((id: string) => {
    dispatch({ type: "DELETE_COMMENT", payload: id })
  }, [])

  const addActivity = useCallback((taskId: string, projectId: string, type: Activity["type"], oldValue?: string, newValue?: string) => {
    const activity: Activity = {
      id: uuidv4(),
      taskId,
      projectId,
      userId: store.currentUser?.id ?? "user_1",
      type,
      oldValue,
      newValue,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_ACTIVITY", payload: activity })
  }, [store.currentUser])

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id })
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })
  }, [])

  const inviteUser = useCallback((projectId: string, userId: string, role: UserRole, message?: string) => {
    const invitation: Invitation = {
      id: uuidv4(),
      projectId,
      invitedBy: store.currentUser?.id ?? "user_1",
      invitedUser: userId,
      role,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_INVITATION", payload: invitation })
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: uuidv4(),
        userId,
        type: "invited",
        title: "Project invitation",
        message: `${store.currentUser?.name} invited you to join a project`,
        projectId,
        fromUserId: store.currentUser?.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    })
  }, [store.currentUser])

  const respondToInvitation = useCallback((invitationId: string, accept: boolean) => {
    const inv = store.invitations.find(i => i.id === invitationId)
    if (!inv) return
    dispatch({ type: "UPDATE_INVITATION", payload: { id: invitationId, status: accept ? "accepted" : "rejected" } })
    if (accept) {
      dispatch({
        type: "UPDATE_PROJECT",
        payload: {
          id: inv.projectId,
          members: [
            ...store.projects.find(p => p.id === inv.projectId)?.members ?? [],
            { userId: inv.invitedUser, role: inv.role, joinedAt: new Date().toISOString() },
          ],
        },
      })
    }
  }, [store.invitations, store.projects])

  const login = useCallback((email: string, password: string): boolean => {
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return false
    // Only allow login for admin@todoify.com with password admin@todoify.com
    if (user.email === "admin@todoify.com" && password !== "admin@todoify.com") return false
    dispatch({ type: "LOGIN", payload: user })
    return true
  }, [store.users])

  const register = useCallback((data: Partial<User> & { password: string }): boolean => {
    if (store.users.find(u => u.email === data.email)) return false
    const user: User = {
      id: uuidv4(),
      email: data.email ?? "",
      username: data.username ?? data.email?.split("@")[0] ?? "",
      name: data.name ?? "",
      role: "member",
      avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${data.name}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    }
    dispatch({ type: "ADD_USER", payload: user })
    dispatch({ type: "LOGIN", payload: user })
    return true
  }, [store.users])

  const logout = useCallback(() => {
    localStorage.clear()
    dispatch({ type: "LOGOUT" })
  }, [])

  const addRecentlyViewed = useCallback((projectId: string) => {
    dispatch({ type: "ADD_RECENTLY_VIEWED", payload: projectId })
  }, [])

  const getUserById = useCallback((id: string) => store.users.find(u => u.id === id), [store.users])

  const getProjectTasks = useCallback((projectId: string) => store.tasks.filter(t => t.projectId === projectId), [store.tasks])

  const getProjectSections = useCallback((projectId: string) => store.sections.filter(s => s.projectId === projectId).sort((a, b) => a.order - b.order), [store.sections])

  const value: StoreContextValue = {
    store,
    dispatch,
    createProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    togglePin,
    createSection,
    updateSection,
    deleteSection,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    addComment,
    deleteComment,
    addActivity,
    markNotificationRead,
    markAllNotificationsRead,
    inviteUser,
    respondToInvitation,
    login,
    register,
    logout,
    addRecentlyViewed,
    getUserById,
    getProjectTasks,
    getProjectSections,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
