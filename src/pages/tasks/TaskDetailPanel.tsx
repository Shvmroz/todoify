import {
  Box, VStack, HStack, Text, Icon, Badge, Button, Input, Textarea,
  Separator, IconButton, Progress, Checkbox
} from "@chakra-ui/react"
import { useState, useRef, useEffect } from "react"
import {
  LuX, LuPen, LuCheck, LuCalendar, LuUser, LuFlag, LuTag,
  LuSquareCheck, LuMessageSquare, LuPaperclip, LuClock, LuActivity,
  LuPlus, LuTrash2, LuStar, LuEllipsis, LuCopy, LuLink2
} from "react-icons/lu"
import { useStore } from "../../store"
import { Avatar as AvatarSnippet } from "../../components/ui/avatar"
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from "../../components/ui/menu"
import {
  STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
  PRIORITY_ICONS, formatDate, formatDateTime, timeAgo, isOverdue, ROLE_LABELS
} from "../../utils"
import type { TaskStatus, TaskPriority, ChecklistItem } from "../../types"
import LiveTimer from "../../components/common/LiveTimer"
import { uuidv4 } from "../../store/uuid"

interface Props {
  taskId: string
  onClose: () => void
}

const STATUSES: TaskStatus[] = ["pending", "working_on", "review", "testing", "completed", "cancelled"]
const PRIORITIES: TaskPriority[] = ["critical", "high", "medium", "low", "none"]

export default function TaskDetailPanel({ taskId, onClose }: Props) {
  const { store, updateTask, deleteTask, changeTaskStatus, addComment, deleteComment, addActivity, getUserById } = useStore()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<"details" | "activity" | "comments">("details")
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState("")
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState("")
  const [newComment, setNewComment] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")

  const task = store.tasks.find(t => t.id === taskId)
  if (!task) return null

  const comments = store.comments.filter(c => c.taskId === taskId && !c.parentId)
  const activities = store.activities.filter(a => a.taskId === taskId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const project = store.projects.find(p => p.id === task.projectId)
  const section = store.sections.find(s => s.id === task.sectionId)
  const creator = getUserById(task.createdBy)
  const checklistDone = task.checklist.filter(c => c.completed).length
  const checklistPct = task.checklist.length > 0 ? Math.round((checklistDone / task.checklist.length) * 100) : 0

  function startEditTitle() {
    setTitleValue(task.title)
    setEditingTitle(true)
  }

  function saveTitle() {
    if (titleValue.trim()) {
      updateTask(task.id, { title: titleValue.trim() })
      addActivity(task.id, task.projectId, "description_edited")
    }
    setEditingTitle(false)
  }

  function startEditDesc() {
    setDescValue(task.description ?? "")
    setEditingDesc(true)
  }

  function saveDesc() {
    updateTask(task.id, { description: descValue })
    setEditingDesc(false)
  }

  function handleStatusChange(status: TaskStatus) {
    changeTaskStatus(task.id, status)
  }

  function handlePriorityChange(priority: TaskPriority) {
    updateTask(task.id, { priority })
    addActivity(task.id, task.projectId, "priority_changed", task.priority, priority)
  }

  function handleAddComment() {
    if (!newComment.trim()) return
    addComment(task.id, task.projectId, newComment)
    setNewComment("")
  }

  function handleAddReply(parentId: string) {
    if (!replyContent.trim()) return
    addComment(task.id, task.projectId, replyContent, parentId)
    setReplyContent("")
    setReplyingTo(null)
  }

  function handleToggleChecklist(itemId: string, completed: boolean) {
    const updated = task.checklist.map(c =>
      c.id === itemId
        ? { ...c, completed, completedBy: completed ? store.currentUser?.id : undefined, completedAt: completed ? new Date().toISOString() : undefined }
        : c
    )
    const pct = updated.filter(c => c.completed).length / updated.length * 100
    updateTask(task.id, { checklist: updated, progress: Math.round(pct) })
    addActivity(task.id, task.projectId, "checklist_updated")
  }

  function handleAddChecklistItem() {
    if (!newChecklistItem.trim()) return
    const item: ChecklistItem = {
      id: uuidv4(),
      title: newChecklistItem.trim(),
      completed: false,
      order: task.checklist.length,
    }
    updateTask(task.id, { checklist: [...task.checklist, item] })
    setNewChecklistItem("")
    setAddingChecklist(false)
  }

  function handleDeleteChecklistItem(itemId: string) {
    updateTask(task.id, { checklist: task.checklist.filter(c => c.id !== itemId) })
  }

  function handleReaction(commentId: string, emoji: string) {
    const comment = store.comments.find(c => c.id === commentId)
    if (!comment) return
    const userId = store.currentUser?.id ?? ""
    const existingReaction = comment.reactions.find(r => r.emoji === emoji)
    let reactions
    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        reactions = comment.reactions.map(r =>
          r.emoji === emoji ? { ...r, users: r.users.filter(u => u !== userId) } : r
        ).filter(r => r.users.length > 0)
      } else {
        reactions = comment.reactions.map(r =>
          r.emoji === emoji ? { ...r, users: [...r.users, userId] } : r
        )
      }
    } else {
      reactions = [...comment.reactions, { emoji, users: [userId] }]
    }
    store.comments.find(c => c.id === commentId)
    const { dispatch } = useStore as unknown as { dispatch: (a: unknown) => void }
  }

  return (
    <Box
      position="fixed"
      top="0" right="0"
      h="full"
      w={{ base: "full", md: "2xl" }}
      bg="bg.panel"
      borderLeftWidth="1px"
      borderColor="border.muted"
      shadow="2xl"
      zIndex={1400}
      display="flex"
      flexDir="column"
      overflow="hidden"
    >
      {/* Header */}
      <HStack
        px="5" py="4"
        borderBottomWidth="1px"
        borderColor="border.muted"
        flexShrink={0}
        gap="2"
      >
        <VStack align="start" gap="0.5" flex="1" minW="0">
          {project && (
            <HStack gap="1.5">
              <Box w="2.5" h="2.5" rounded="sm" bg={project.color} fontSize="xs" display="flex" alignItems="center" justifyContent="center">{project.icon}</Box>
              <Text fontSize="xs" color="fg.muted">{project.name}</Text>
              {section && <><Text fontSize="xs" color="fg.muted">›</Text><Text fontSize="xs" color="fg.muted">{section.name}</Text></>}
            </HStack>
          )}
        </VStack>
        <HStack gap="1">
          <Icon
            as={LuStar}
            boxSize={4}
            color={task.isStarred ? "yellow.500" : "fg.muted"}
            fill={task.isStarred ? "yellow.500" : "transparent"}
            cursor="pointer"
            onClick={() => updateTask(task.id, { isStarred: !task.isStarred })}
            _hover={{ color: "yellow.500" }}
          />
          <IconButton
            aria-label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
            rounded="lg"
          >
            <Icon as={LuX} boxSize={4} />
          </IconButton>
        </HStack>
      </HStack>

      {/* Tabs */}
      <HStack
        px="5" py="0"
        borderBottomWidth="1px"
        borderColor="border.muted"
        flexShrink={0}
        gap="0"
      >
        {(["details", "activity", "comments"] as const).map(t => (
          <Text
            key={t}
            px="3" py="3"
            fontSize="sm"
            cursor="pointer"
            borderBottomWidth="2px"
            borderColor={activeTab === t ? "purple.500" : "transparent"}
            color={activeTab === t ? "purple.500" : "fg.muted"}
            fontWeight={activeTab === t ? "semibold" : "medium"}
            onClick={() => setActiveTab(t)}
            textTransform="capitalize"
          >
            {t}
          </Text>
        ))}
      </HStack>

      {/* Content */}
      <Box flex="1" overflowY="auto" p="5">
        {activeTab === "details" && (
          <VStack gap="5" align="stretch">
            {/* Title */}
            <Box>
              {editingTitle ? (
                <HStack gap="2">
                  <Input
                    value={titleValue}
                    onChange={e => setTitleValue(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false) }}
                    autoFocus
                    fontSize="xl"
                    fontWeight="bold"
                  />
                  <IconButton aria-label="Save" size="sm" colorPalette="green" onClick={saveTitle}>
                    <Icon as={LuCheck} />
                  </IconButton>
                </HStack>
              ) : (
                <HStack gap="2" align="start">
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="fg"
                    flex="1"
                    cursor="pointer"
                    onClick={startEditTitle}
                    _hover={{ color: "purple.500" }}
                  >
                    {task.title}
                  </Text>
                  <Icon as={LuPen} boxSize={4} color="fg.muted" cursor="pointer" onClick={startEditTitle} mt="1" />
                </HStack>
              )}
            </Box>

            {/* Status row */}
            <HStack gap="3" flexWrap="wrap">
              <Box>
                <Text fontSize="xs" color="fg.muted" mb="1" fontWeight="medium">STATUS</Text>
                <HStack gap="1" flexWrap="wrap">
                  {STATUSES.map(s => (
                    <Badge
                      key={s}
                      colorPalette={task.status === s ? STATUS_COLORS[s] : "gray"}
                      variant="subtle"
                      cursor="pointer"
                      onClick={() => handleStatusChange(s)}
                      size="sm"
                      _hover={{ colorPalette: STATUS_COLORS[s] }}
                    >
                      {STATUS_LABELS[s]}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            </HStack>

            {/* Live timer */}
            {task.status === "working_on" && (
              <Box p="3" rounded="lg" bg="blue.50" _dark={{ bg: "blue.950" }} borderWidth="1px" borderColor="blue.200" _dark={{ borderColor: "blue.800" }}>
                <HStack gap="2">
                  <Box w="2" h="2" rounded="full" bg="blue.500" animation="pulse 1s infinite" />
                  <Text fontSize="sm" color="blue.700" _dark={{ color: "blue.300" }} fontWeight="medium">
                    {task.startedBy ? (getUserById(task.startedBy)?.name ?? "Someone") : "Someone"} is working on this
                  </Text>
                  <LiveTimer startedAt={task.startedWorkingAt} />
                </HStack>
              </Box>
            )}

            {/* Grid of properties */}
            <Box
              bg="bg.subtle"
              rounded="xl"
              p="4"
              borderWidth="1px"
              borderColor="border.muted"
            >
              <VStack gap="3" align="stretch">
                {/* Priority */}
                <HStack justify="space-between">
                  <HStack gap="2">
                    <Icon as={LuFlag} boxSize={3.5} color="fg.muted" />
                    <Text fontSize="sm" color="fg.muted">Priority</Text>
                  </HStack>
                  <HStack gap="1">
                    {PRIORITIES.map(p => (
                      <Box
                        key={p}
                        px="2" py="0.5"
                        rounded="md"
                        fontSize="xs"
                        cursor="pointer"
                        bg={task.priority === p ? `${PRIORITY_COLORS[p]}.subtle` : "transparent"}
                        color={task.priority === p ? `${PRIORITY_COLORS[p]}.fg` : "fg.muted"}
                        _hover={{ bg: `${PRIORITY_COLORS[p]}.subtle` }}
                        onClick={() => handlePriorityChange(p)}
                        colorPalette={PRIORITY_COLORS[p]}
                      >
                        {PRIORITY_ICONS[p]}
                      </Box>
                    ))}
                  </HStack>
                </HStack>

                <Separator />

                {/* Assignees */}
                <HStack justify="space-between" align="center">
                  <HStack gap="2">
                    <Icon as={LuUser} boxSize={3.5} color="fg.muted" />
                    <Text fontSize="sm" color="fg.muted">Assignees</Text>
                  </HStack>
                  <HStack gap="2">
                    <HStack gap="1" flexWrap="wrap">
                      {task.assignees.length === 0 ? (
                        <Text fontSize="sm" color="fg.subtle">Unassigned</Text>
                      ) : (
                        task.assignees.map(a => {
                          const user = getUserById(a.userId)
                          return (
                            <HStack key={a.userId} gap="1" px="2" py="1" bg="bg.panel" rounded="md" borderWidth="1px" borderColor="border.muted">
                              <Box w="4" h="4" rounded="full" overflow="hidden">
                                <Box as="img" src={user?.avatar} alt={user?.name} w="full" h="full" objectFit="cover" />
                              </Box>
                              <Text fontSize="xs" color="fg">{user?.name}</Text>
                              <Icon
                                as={LuX}
                                boxSize={3}
                                color="fg.muted"
                                cursor="pointer"
                                _hover={{ color: "red.500" }}
                                onClick={() => updateTask(task.id, { assignees: task.assignees.filter(x => x.userId !== a.userId) })}
                              />
                            </HStack>
                          )
                        })
                      )}
                    </HStack>
                    <MenuRoot>
                      <MenuTrigger asChild>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="purple.500"
                        >
                          <Icon as={LuPlus} /> Assign
                        </Button>
                      </MenuTrigger>
                      <MenuContent minW="200px">
                        {project?.members && project.members.filter(m => !task.assignees.some(a => a.userId === m.userId)).length > 0 ? (
                          project.members
                            .filter(m => !task.assignees.some(a => a.userId === m.userId))
                            .map(member => {
                              const user = getUserById(member.userId)
                              return (
                                <MenuItem
                                  key={member.userId}
                                  value={member.userId}
                                  onClick={() => {
                                    updateTask(task.id, { assignees: [...task.assignees, { userId: member.userId, assignedBy: store.currentUser?.id, assignedAt: new Date().toISOString() }] })
                                    addActivity(task.id, task.projectId, "assignee_added", "", user?.name ?? "")
                                  }}
                                >
                                  <Box w="5" h="5" rounded="full" overflow="hidden">
                                    <Box as="img" src={user?.avatar} alt={user?.name} w="full" h="full" objectFit="cover" />
                                  </Box>
                                  <Text>{user?.name}</Text>
                                </MenuItem>
                              )
                            })
                        ) : (
                          <MenuItem isDisabled value="no-users" py="2">
                            <Text fontSize="sm" color="fg.muted" textAlign="center" w="full">No users</Text>
                          </MenuItem>
                        )}
                      </MenuContent>
                    </MenuRoot>
                  </HStack>
                </HStack>

                <Separator />
                {/* Target Date */}
                <VStack gap="2" align="stretch">
                  {showDatePicker && !task.dueDate ? (
                    <HStack justify="space-between" align="center">
                      <HStack gap="2">
                        <Icon as={LuCalendar} boxSize={3.5} color="fg.muted" />
                        <Text fontSize="sm" color="fg.muted">Target Date</Text>
                      </HStack>
                      <HStack gap="2">
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          size="sm"
                          w="160px"
                          autoFocus
                        />
                        <Button size="xs" variant="ghost" onClick={() => setShowDatePicker(false)}>
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          colorPalette="purple"
                          onClick={() => {
                            updateTask(task.id, { dueDate: selectedDate })
                            addActivity(task.id, task.projectId, "target_date_added", "", formatDate(selectedDate))
                            setShowDatePicker(false)
                          }}
                        >
                          Add
                        </Button>
                      </HStack>
                    </HStack>
                  ) : (
                    <HStack justify="space-between" align="center">
                      <HStack gap="2">
                        <Icon as={LuCalendar} boxSize={3.5} color="fg.muted" />
                        <Text fontSize="sm" color="fg.muted">Target Date</Text>
                      </HStack>
                      <HStack gap="2">
                        <Input
                          ref={dateInputRef}
                          type="date"
                          display="none"
                        />
                        {task.dueDate ? (
                          <>
                            <Text
                              fontSize="sm"
                              color={isOverdue(task.dueDate) ? "red.500" : "fg"}
                              fontWeight={isOverdue(task.dueDate) ? "semibold" : "normal"}
                            >
                              {formatDate(task.dueDate)}
                            </Text>
                            <Icon
                              as={LuCalendar}
                              boxSize={4}
                              color="fg.muted"
                              cursor="pointer"
                              _hover={{ color: "purple.500" }}
                              onClick={() => {
                                setSelectedDate(new Date(task.dueDate).toISOString().split('T')[0])
                                setShowDatePicker(true)
                              }}
                            />
                            <Icon
                              as={LuX}
                              boxSize={3.5}
                              color="fg.muted"
                              cursor="pointer"
                              _hover={{ color: "red.500" }}
                              onClick={() => {
                                updateTask(task.id, { dueDate: undefined })
                                addActivity(task.id, task.projectId, "target_date_removed")
                              }}
                            />
                          </>
                        ) : (
                          <Button
                            size="xs"
                            variant="ghost"
                            color="purple.500"
                            onClick={() => {
                              setSelectedDate(new Date().toISOString().split('T')[0])
                              setShowDatePicker(true)
                            }}
                          >
                            <Icon as={LuPlus} /> Add date
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                  )}
                </VStack>

                {task.startDate && (
                  <>
                    <Separator />
                    <HStack justify="space-between">
                      <HStack gap="2">
                        <Icon as={LuCalendar} boxSize={3.5} color="fg.muted" />
                        <Text fontSize="sm" color="fg.muted">Start Date</Text>
                      </HStack>
                      <Text fontSize="sm" color="fg">{formatDate(task.startDate)}</Text>
                    </HStack>
                  </>
                )}

                <Separator />

                {/* Created by */}
                <HStack justify="space-between">
                  <HStack gap="2">
                    <Icon as={LuUser} boxSize={3.5} color="fg.muted" />
                    <Text fontSize="sm" color="fg.muted">Created by</Text>
                  </HStack>
                  <HStack gap="1">
                    <Box w="5" h="5" rounded="full" overflow="hidden">
                      <Box as="img" src={creator?.avatar} alt={creator?.name} w="full" h="full" objectFit="cover" />
                    </Box>
                    <Text fontSize="sm" color="fg">{creator?.name}</Text>
                  </HStack>
                </HStack>

                {/* Completed info */}
                {task.completedAt && (
                  <>
                    <Separator />
                    <HStack justify="space-between">
                      <HStack gap="2">
                        <Icon as={LuCheck} boxSize={3.5} color="green.500" />
                        <Text fontSize="sm" color="fg.muted">Completed</Text>
                      </HStack>
                      <VStack align="end" gap="0">
                        <Text fontSize="sm" color="green.500">{formatDate(task.completedAt)}</Text>
                        {task.completedBy && (
                          <Text fontSize="xs" color="fg.muted">by {getUserById(task.completedBy)?.name}</Text>
                        )}
                      </VStack>
                    </HStack>
                  </>
                )}
              </VStack>
            </Box>

            {/* Description */}
            <Box>
              <HStack justify="space-between" mb="2">
                <Text fontWeight="semibold" color="fg" fontSize="sm">Description</Text>
                {!editingDesc && (
                  <Icon as={LuPen} boxSize={3.5} color="fg.muted" cursor="pointer" onClick={startEditDesc} _hover={{ color: "fg" }} />
                )}
              </HStack>
              {editingDesc ? (
                <VStack gap="2" align="stretch">
                  <Textarea
                    value={descValue}
                    onChange={e => setDescValue(e.target.value)}
                    rows={5}
                    autoFocus
                    placeholder="Add a description..."
                  />
                  <HStack gap="2">
                    <Button size="xs" colorPalette="purple" onClick={saveDesc}>Save</Button>
                    <Button size="xs" variant="ghost" onClick={() => setEditingDesc(false)}>Cancel</Button>
                  </HStack>
                </VStack>
              ) : (
                <Box
                  p="3"
                  rounded="lg"
                  bg="bg.subtle"
                  borderWidth="1px"
                  borderColor="border.muted"
                  minH="16"
                  cursor="pointer"
                  onClick={startEditDesc}
                  _hover={{ borderColor: "purple.300" }}
                >
                  {task.description ? (
                    <Text fontSize="sm" color="fg" whiteSpace="pre-wrap">{task.description}</Text>
                  ) : (
                    <Text fontSize="sm" color="fg.subtle">Click to add a description...</Text>
                  )}
                </Box>
              )}
            </Box>

            {/* Labels */}
            <Box>
              <Text fontWeight="semibold" color="fg" fontSize="sm" mb="2">Labels</Text>
              <HStack gap="2" flexWrap="wrap">
                {task.labels.map(label => (
                  <Badge
                    key={label}
                    colorPalette="purple"
                    variant="outline"
                    size="sm"
                    cursor="pointer"
                    onClick={() => updateTask(task.id, { labels: task.labels.filter(l => l !== label) })}
                  >
                    {label} ×
                  </Badge>
                ))}
                <Button size="xs" variant="ghost" color="fg.muted">
                  <Icon as={LuPlus} /> Add label
                </Button>
              </HStack>
            </Box>

            {/* Progress */}
            <Box>
              <HStack justify="space-between" mb="2">
                <Text fontWeight="semibold" color="fg" fontSize="sm">Progress</Text>
                <Text fontSize="sm" fontWeight="semibold" color={task.progress === 100 ? "green.500" : "fg"}>{task.progress}%</Text>
              </HStack>
              <Progress.Root value={task.progress} size="sm" rounded="full">
                <Progress.Track>
                  <Progress.Range bg={task.progress === 100 ? "green.500" : "purple.500"} />
                </Progress.Track>
              </Progress.Root>
            </Box>

            {/* Checklist */}
            <Box>
              <HStack justify="space-between" mb="2">
                <HStack gap="2">
                  <Icon as={LuSquareCheck} boxSize={4} color="fg.muted" />
                  <Text fontWeight="semibold" color="fg" fontSize="sm">Checklist</Text>
                  <Badge colorPalette="gray" variant="subtle" size="xs">{checklistDone}/{task.checklist.length}</Badge>
                </HStack>
              </HStack>

              {task.checklist.length > 0 && (
                <Box mb="2">
                  <Progress.Root value={checklistPct} size="xs">
                    <Progress.Track>
                      <Progress.Range bg={checklistPct === 100 ? "green.500" : "blue.500"} />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              )}

              <VStack gap="2" align="stretch">
                {task.checklist
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map(item => (
                    <HStack key={item.id} gap="2">
                      <Checkbox.Root
                        checked={item.completed}
                        onCheckedChange={c => handleToggleChecklist(item.id, c.checked === true)}
                        size="sm"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>
                      <Text
                        fontSize="sm"
                        color={item.completed ? "fg.muted" : "fg"}
                        textDecoration={item.completed ? "line-through" : "none"}
                        flex="1"
                      >
                        {item.title}
                      </Text>
                      <Icon
                        as={LuTrash2}
                        boxSize={3.5}
                        color="fg.subtle"
                        cursor="pointer"
                        _hover={{ color: "red.500" }}
                        onClick={() => handleDeleteChecklistItem(item.id)}
                      />
                    </HStack>
                  ))}

                {addingChecklist ? (
                  <HStack gap="2">
                    <Input
                      placeholder="Checklist item..."
                      value={newChecklistItem}
                      onChange={e => setNewChecklistItem(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddChecklistItem(); if (e.key === "Escape") setAddingChecklist(false) }}
                      size="sm"
                      autoFocus
                    />
                    <Button size="xs" colorPalette="green" onClick={handleAddChecklistItem}><Icon as={LuCheck} /></Button>
                    <Button size="xs" variant="ghost" onClick={() => setAddingChecklist(false)}><Icon as={LuX} /></Button>
                  </HStack>
                ) : (
                  <Button size="xs" variant="ghost" color="fg.muted" justifyContent="start" onClick={() => setAddingChecklist(true)}>
                    <Icon as={LuPlus} /> Add item
                  </Button>
                )}
              </VStack>
            </Box>
          </VStack>
        )}

        {activeTab === "activity" && (
          <VStack gap="4" align="stretch">
            <Text fontWeight="semibold" color="fg">Activity Timeline</Text>
            {activities.length === 0 && <Text fontSize="sm" color="fg.muted">No activity yet</Text>}
            {activities.map(act => {
              const user = getUserById(act.userId)
              return (
                <HStack key={act.id} gap="3" align="start">
                  <Box w="6" h="6" rounded="full" overflow="hidden" flexShrink={0}>
                    <Box as="img" src={user?.avatar} alt={user?.name} w="full" h="full" objectFit="cover" />
                  </Box>
                  <VStack align="start" gap="0.5" flex="1">
                    <Text fontSize="sm" color="fg">
                      <Text as="span" fontWeight="semibold">{user?.name}</Text>
                      {" "}{act.type.replace(/_/g, " ")}
                      {act.oldValue && act.newValue && (
                        <Text as="span" color="fg.muted">
                          {" "}from <Text as="span" color="orange.500">{act.oldValue.replace(/_/g, " ")}</Text> to <Text as="span" color="green.500">{act.newValue.replace(/_/g, " ")}</Text>
                        </Text>
                      )}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">{timeAgo(act.createdAt)}</Text>
                  </VStack>
                </HStack>
              )
            })}
          </VStack>
        )}

        {activeTab === "comments" && (
          <VStack gap="4" align="stretch">
            <Text fontWeight="semibold" color="fg">Comments</Text>

            {/* Add comment */}
            <HStack gap="3" align="start">
              <Box w="7" h="7" rounded="full" overflow="hidden" flexShrink={0}>
                <Box as="img" src={store.currentUser?.avatar} alt={store.currentUser?.name} w="full" h="full" objectFit="cover" />
              </Box>
              <VStack gap="2" flex="1">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                  fontSize="sm"
                />
                {newComment && (
                  <HStack gap="2" justifyContent="flex-end" w="full">
                    <Button size="xs" variant="ghost" onClick={() => setNewComment("")}>Cancel</Button>
                    <Button size="xs" colorPalette="purple" onClick={handleAddComment}>Comment</Button>
                  </HStack>
                )}
              </VStack>
            </HStack>

            <Separator />

            {comments.length === 0 && <Text fontSize="sm" color="fg.muted">No comments yet. Be the first!</Text>}

            {/* Comments list */}
            <VStack gap="4" align="stretch">
              {comments.map(comment => {
                const user = getUserById(comment.userId)
                const replies = store.comments.filter(c => c.parentId === comment.id)
                return (
                  <Box key={comment.id}>
                    <HStack gap="3" align="start">
                      <Box w="7" h="7" rounded="full" overflow="hidden" flexShrink={0}>
                        <Box as="img" src={user?.avatar} alt={user?.name} w="full" h="full" objectFit="cover" />
                      </Box>
                      <VStack align="start" gap="2" flex="1">
                        <Box bg="bg.subtle" p="3" rounded="lg" w="full" borderWidth="1px" borderColor="border.muted">
                          <HStack justify="space-between" mb="1">
                            <Text fontSize="sm" fontWeight="semibold" color="fg">{user?.name}</Text>
                            <Text fontSize="xs" color="fg.muted">{timeAgo(comment.createdAt)}</Text>
                          </HStack>
                          <Text fontSize="sm" color="fg" whiteSpace="pre-wrap">{comment.content}</Text>
                        </Box>

                        {/* Reactions */}
                        <HStack gap="2" flexWrap="wrap">
                          {comment.reactions.map(r => (
                            <Badge
                              key={r.emoji}
                              size="xs"
                              variant="outline"
                              cursor="pointer"
                              colorPalette="gray"
                            >
                              {r.emoji} {r.users.length}
                            </Badge>
                          ))}
                          <HStack gap="1">
                            {["👍", "❤️", "🎉", "🔥"].map(emoji => (
                              <Text
                                key={emoji}
                                fontSize="sm"
                                cursor="pointer"
                                opacity={0.4}
                                _hover={{ opacity: 1 }}
                              >
                                {emoji}
                              </Text>
                            ))}
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="fg.muted"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            Reply
                          </Button>
                          {comment.userId === store.currentUser?.id && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="red.500"
                              onClick={() => deleteComment(comment.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </HStack>

                        {/* Reply form */}
                        {replyingTo === comment.id && (
                          <HStack gap="2" w="full">
                            <Input
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={e => setReplyContent(e.target.value)}
                              size="sm"
                              autoFocus
                              onKeyDown={e => { if (e.key === "Enter") handleAddReply(comment.id); if (e.key === "Escape") setReplyingTo(null) }}
                            />
                            <Button size="xs" colorPalette="purple" onClick={() => handleAddReply(comment.id)}>Reply</Button>
                            <Button size="xs" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                          </HStack>
                        )}

                        {/* Replies */}
                        {replies.map(reply => {
                          const replyUser = getUserById(reply.userId)
                          return (
                            <HStack key={reply.id} gap="3" align="start" pl="4" borderLeftWidth="2px" borderColor="border.muted">
                              <Box w="5" h="5" rounded="full" overflow="hidden" flexShrink={0}>
                                <Box as="img" src={replyUser?.avatar} alt={replyUser?.name} w="full" h="full" objectFit="cover" />
                              </Box>
                              <Box bg="bg.subtle" p="2.5" rounded="lg" flex="1" borderWidth="1px" borderColor="border.muted">
                                <HStack justify="space-between" mb="1">
                                  <Text fontSize="xs" fontWeight="semibold" color="fg">{replyUser?.name}</Text>
                                  <Text fontSize="xs" color="fg.muted">{timeAgo(reply.createdAt)}</Text>
                                </HStack>
                                <Text fontSize="sm" color="fg">{reply.content}</Text>
                              </Box>
                            </HStack>
                          )
                        })}
                      </VStack>
                    </HStack>
                  </Box>
                )
              })}
            </VStack>
          </VStack>
        )}
      </Box>

      {/* Footer actions */}
      <HStack
        px="5" py="3"
        borderTopWidth="1px"
        borderColor="border.muted"
        flexShrink={0}
        gap="2"
        bg="bg.subtle"
      >
        <Button
          size="sm"
          variant="ghost"
          color="fg.muted"
          _hover={{ color: "red.500" }}
          onClick={() => { deleteTask(task.id); onClose() }}
        >
          <Icon as={LuTrash2} />
          Delete
        </Button>
        <Box flex="1" />
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </HStack>
    </Box>
  )
}
