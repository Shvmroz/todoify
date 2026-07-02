import {
  Box, VStack, HStack, Text, Heading, Icon, Badge, Input, SimpleGrid
} from "@chakra-ui/react"
import { useState } from "react"
import { LuSearch, LuCircleAlert } from "react-icons/lu"
import { useStore } from "../../store"
import { STATUS_COLORS, STATUS_LABELS, isOverdue, formatDate } from "../../utils"
import TaskDetailPanel from "./TaskDetailPanel"

export default function MyTasksPage() {
  const { store } = useStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "assigned" | "created" | "overdue">("all")

  const userId = store.currentUser?.id
  const allTasks = store.tasks.filter(t => {
    if (filter === "assigned") return t.assignees.some(a => a.userId === userId)
    if (filter === "created") return t.createdBy === userId
    if (filter === "overdue") return isOverdue(t.dueDate) && t.status !== "completed"
    return t.assignees.some(a => a.userId === userId) || t.createdBy === userId
  }).filter(t => t.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <Box p={{ base: "4", md: "6" }}>
        <VStack align="stretch" gap="5">
          <VStack align="start" gap="0">
            <Heading size="xl" color="fg">My Tasks</Heading>
            <Text color="fg.muted" fontSize="sm">{allTasks.length} tasks</Text>
          </VStack>

          <HStack gap="3" flexWrap="wrap">
            <HStack gap="2" px="3" py="2" rounded="lg" bg="bg.panel" borderWidth="1px" borderColor="border.muted" flex="1" maxW="sm">
              <Icon as={LuSearch} boxSize={4} color="fg.muted" />
              <Input variant="plain" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} p="0" h="auto" fontSize="sm" />
            </HStack>
            <HStack gap="2">
              {(["all", "assigned", "created", "overdue"] as const).map(f => (
                <Box
                  key={f}
                  px="3" py="1.5"
                  rounded="lg"
                  bg={filter === f ? "purple.500" : "bg.panel"}
                  color={filter === f ? "white" : "fg.muted"}
                  cursor="pointer"
                  onClick={() => setFilter(f)}
                  fontSize="sm"
                  fontWeight="medium"
                  borderWidth="1px"
                  borderColor={filter === f ? "purple.500" : "border.muted"}
                  textTransform="capitalize"
                >
                  {f}
                </Box>
              ))}
            </HStack>
          </HStack>

          <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
            {allTasks.length === 0 ? (
              <Box p="8" textAlign="center">
                <Text color="fg.muted">No tasks found</Text>
              </Box>
            ) : (
              <VStack gap="0" align="stretch" divideY="1px">
                {allTasks.map(task => {
                  const project = store.projects.find(p => p.id === task.projectId)
                  const overdue = isOverdue(task.dueDate)
                  return (
                    <HStack
                      key={task.id}
                      gap="4" px="5" py="3"
                      cursor="pointer"
                      _hover={{ bg: "bg.subtle" }}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <Box w="2" h="8" rounded="full" bg={`${STATUS_COLORS[task.status]}.500`} flexShrink={0} />
                      <VStack align="start" gap="0.5" flex="1" minW="0">
                        <Text fontSize="sm" fontWeight="medium" color="fg" truncate>{task.title}</Text>
                        {project && <Text fontSize="xs" color="fg.muted">{project.name}</Text>}
                      </VStack>
                      <HStack gap="2" flexShrink={0}>
                        {overdue && (
                          <HStack gap="1">
                            <Icon as={LuCircleAlert} boxSize={3.5} color="red.500" />
                            <Text fontSize="xs" color="red.500">{formatDate(task.dueDate)}</Text>
                          </HStack>
                        )}
                        {!overdue && task.dueDate && (
                          <Text fontSize="xs" color="fg.muted">{formatDate(task.dueDate)}</Text>
                        )}
                        <Badge colorPalette={STATUS_COLORS[task.status]} size="xs" variant="subtle">
                          {STATUS_LABELS[task.status]}
                        </Badge>
                      </HStack>
                    </HStack>
                  )
                })}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </>
  )
}
