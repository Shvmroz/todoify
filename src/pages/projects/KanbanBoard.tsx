import {
  Box, HStack, VStack, Text, Icon, Badge, Button, Input
} from "@chakra-ui/react"
import { useState, useCallback } from "react"
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, type DragEndEvent, type DragOverEvent,
  type DragStartEvent
} from "@dnd-kit/core"
import {
  SortableContext, useSortable, verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  LuPlus, LuEllipsis, LuGripVertical, LuTrash2,
  LuChevronDown, LuPen
} from "react-icons/lu"
import { useStore } from "../../store"
import type { Task, Section } from "../../types"
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, formatDate, isOverdue } from "../../utils"
import TaskCard from "./TaskCard"
import TaskDetailPanel from "../tasks/TaskDetailPanel"

interface Props {
  projectId: string
}

export default function KanbanBoard({ projectId }: Props) {
  const { store, createSection, updateSection, deleteSection, createTask, dispatch } = useStore()
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [addingSectionName, setAddingSectionName] = useState("")
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState("")

  const sections = store.sections
    .filter(s => s.projectId === projectId)
    .sort((a, b) => a.order - b.order)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeTask = store.tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // If dropping over a section
    const overSection = sections.find(s => s.id === over.id)
    if (overSection && activeTask.sectionId !== overSection.id) {
      dispatch({
        type: "UPDATE_TASK",
        payload: { id: activeTask.id, sectionId: overSection.id },
      })
    }

    // If dropping over another task
    const overTask = store.tasks.find(t => t.id === over.id)
    if (overTask && overTask.sectionId !== activeTask.sectionId) {
      dispatch({
        type: "UPDATE_TASK",
        payload: { id: activeTask.id, sectionId: overTask.sectionId },
      })
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTaskId(null)
    if (!over) return

    const activeTask = store.tasks.find(t => t.id === active.id)
    const overTask = store.tasks.find(t => t.id === over.id)

    if (activeTask && overTask && activeTask.sectionId === overTask.sectionId) {
      const sectionTasks = store.tasks
        .filter(t => t.sectionId === activeTask.sectionId)
        .sort((a, b) => a.order - b.order)

      const oldIndex = sectionTasks.findIndex(t => t.id === active.id)
      const newIndex = sectionTasks.findIndex(t => t.id === over.id)

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(sectionTasks, oldIndex, newIndex)
          .map((t, i) => ({ ...t, order: i }))
        dispatch({ type: "REORDER_TASKS", payload: [...store.tasks.filter(t => t.sectionId !== activeTask.sectionId), ...reordered] })
      }
    }
  }

  const activeTask = activeTaskId ? store.tasks.find(t => t.id === activeTaskId) : null

  function addSection() {
    if (!addingSectionName.trim()) return
    createSection(projectId, addingSectionName.trim())
    setAddingSectionName("")
    setShowAddSection(false)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          display="flex"
          flexDir="row"
          gap="4"
          p="4"
          overflowX="auto"
          minH="full"
          alignItems="start"
        >
          {sections.map(section => (
            <SectionColumn
              key={section.id}
              section={section}
              tasks={store.tasks
                .filter(t => t.sectionId === section.id)
                .sort((a, b) => a.order - b.order)}
              onTaskClick={setSelectedTaskId}
              onCreateTask={() => {
                createTask({ projectId, sectionId: section.id, title: "New Task" })
              }}
              editingSectionId={editingSectionId}
              editingSectionName={editingSectionName}
              onStartEditSection={(s) => {
                setEditingSectionId(s.id)
                setEditingSectionName(s.name)
              }}
              onSaveEditSection={() => {
                if (editingSectionId) {
                  updateSection(editingSectionId, { name: editingSectionName })
                }
                setEditingSectionId(null)
              }}
              onEditNameChange={setEditingSectionName}
              onDeleteSection={deleteSection}
            />
          ))}

          {/* Add Section */}
          <Box flexShrink={0} w="72">
            {showAddSection ? (
              <Box
                bg="bg.panel"
                rounded="xl"
                p="3"
                borderWidth="1px"
                borderColor="border.muted"
              >
                <Input
                  placeholder="Section name"
                  value={addingSectionName}
                  onChange={e => setAddingSectionName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setShowAddSection(false) }}
                  autoFocus
                  size="sm"
                  mb="2"
                />
                <HStack gap="2">
                  <Button size="xs" colorPalette="purple" onClick={addSection}>Add</Button>
                  <Button size="xs" variant="ghost" onClick={() => setShowAddSection(false)}>Cancel</Button>
                </HStack>
              </Box>
            ) : (
              <Button
                variant="ghost"
                color="fg.muted"
                w="full"
                justifyContent="start"
                gap="2"
                onClick={() => setShowAddSection(true)}
                borderWidth="1px"
                borderColor="border.muted"
                borderStyle="dashed"
                rounded="xl"
                py="6"
              >
                <Icon as={LuPlus} />
                Add Section
              </Button>
            )}
          </Box>
        </Box>

        <DragOverlay>
          {activeTask && (
            <Box opacity={0.9} transform="rotate(2deg)">
              <TaskCard task={activeTask} onOpen={() => {}} />
            </Box>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Panel */}
      {selectedTaskId && (
        <>
          <Box
            position="fixed"
            top="0" left="0"
            w="full" h="full"
            bg="black"
            opacity={0.3}
            zIndex={1300}
            onClick={() => setSelectedTaskId(null)}
          />
          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        </>
      )}
    </>
  )
}

interface SectionColumnProps {
  section: Section
  tasks: Task[]
  onTaskClick: (id: string) => void
  onCreateTask: () => void
  editingSectionId: string | null
  editingSectionName: string
  onStartEditSection: (s: Section) => void
  onSaveEditSection: () => void
  onEditNameChange: (name: string) => void
  onDeleteSection: (id: string) => void
}

function SectionColumn({
  section, tasks, onTaskClick, onCreateTask,
  editingSectionId, editingSectionName,
  onStartEditSection, onSaveEditSection, onEditNameChange, onDeleteSection,
}: SectionColumnProps) {
  const { store, changeTaskStatus } = useStore()
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const { createTask } = useStore()

  const { setNodeRef } = useSortable({
    id: section.id,
    data: { type: "section" },
  })

  function handleAddTask() {
    if (!newTaskTitle.trim()) return
    createTask({ projectId: section.projectId, sectionId: section.id, title: newTaskTitle })
    setNewTaskTitle("")
    setAddingTask(false)
  }

  return (
    <Box
      ref={setNodeRef}
      flexShrink={0}
      w="72"
      bg="bg.subtle"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.200"
      display="flex"
      flexDir="column"
      maxH="calc(100vh - 220px)"
    >
      {/* Header */}
      <HStack
        px="3" py="2.5"
        borderBottomWidth="1px"
        borderColor="border.muted"
        flexShrink={0}
      >
        <Box w="2" h="2" rounded="full" bg={section.color ?? "gray.400"} />
        {editingSectionId === section.id ? (
          <Input
            value={editingSectionName}
            onChange={e => onEditNameChange(e.target.value)}
            onBlur={onSaveEditSection}
            onKeyDown={e => { if (e.key === "Enter") onSaveEditSection() }}
            size="xs"
            autoFocus
            flex="1"
          />
        ) : (
          <Text
            fontWeight="semibold"
            color="fg"
            fontSize="sm"
            flex="1"
            onDoubleClick={() => onStartEditSection(section)}
            cursor="default"
          >
            {section.name}
          </Text>
        )}
        <Badge size="xs" colorPalette="gray" variant="subtle" rounded="full">{tasks.length}</Badge>
        <HStack gap="1">
          <Icon
            as={LuPen}
            boxSize={3.5}
            color="fg.muted"
            cursor="pointer"
            onClick={() => onStartEditSection(section)}
            _hover={{ color: "fg" }}
          />
          <Icon
            as={LuPlus}
            boxSize={4}
            color="fg.muted"
            cursor="pointer"
            onClick={() => setAddingTask(true)}
            _hover={{ color: "fg" }}
          />
          <Icon
            as={LuTrash2}
            boxSize={3.5}
            color="fg.muted"
            cursor="pointer"
            onClick={() => onDeleteSection(section.id)}
            _hover={{ color: "red.500" }}
          />
        </HStack>
      </HStack>

      {/* Tasks */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <VStack
          gap="2"
          p="2"
          flex="1"
          overflowY="auto"
          align="stretch"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "var(--chakra-colors-border-muted)", borderRadius: "full" },
          }}
        >
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} onOpen={onTaskClick} />
          ))}
        </VStack>
      </SortableContext>

      {/* Add Task */}
      <Box p="2" flexShrink={0}>
        {addingTask ? (
          <Box bg="bg.panel" rounded="lg" p="3" borderWidth="1px" borderColor="border.muted">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setAddingTask(false) }}
              size="sm"
              autoFocus
              mb="2"
            />
            <HStack gap="1">
              <Button size="xs" colorPalette="purple" onClick={handleAddTask}>Add task</Button>
              <Button size="xs" variant="ghost" onClick={() => setAddingTask(false)}>Cancel</Button>
            </HStack>
          </Box>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            w="full"
            justifyContent="start"
            color="fg.muted"
            _hover={{ bg: "bg.muted", color: "fg" }}
            onClick={() => setAddingTask(true)}
          >
            <Icon as={LuPlus} />
            Add task
          </Button>
        )}
      </Box>
    </Box>
  )
}

function SortableTaskCard({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task" },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} onOpen={onOpen} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}
