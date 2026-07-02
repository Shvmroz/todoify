import {
  Box, VStack, HStack, Text, Icon, Badge, Button, Input,
  Table, Checkbox
} from "@chakra-ui/react"
import { useState } from "react"
import {
  LuPlus, LuChevronDown, LuChevronRight, LuCalendar,
  LuCircleAlert, LuUser
} from "react-icons/lu"
import { useStore } from "../../store"
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_ICONS, formatDate, isOverdue } from "../../utils"
import TaskDetailPanel from "../tasks/TaskDetailPanel"

export default function ListView({ projectId }: { projectId: string }) {
  const { store, createTask } = useStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const sections = store.sections
    .filter(s => s.projectId === projectId)
    .sort((a, b) => a.order - b.order)

  function toggleSection(id: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <Box p="4">
        <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="bg.subtle">
                <Table.ColumnHeader w="8" />
                <Table.ColumnHeader>Task</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Priority</Table.ColumnHeader>
                <Table.ColumnHeader>Assignees</Table.ColumnHeader>
                <Table.ColumnHeader>Due Date</Table.ColumnHeader>
                <Table.ColumnHeader>Progress</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sections.map(section => {
                const tasks = store.tasks
                  .filter(t => t.sectionId === section.id)
                  .sort((a, b) => a.order - b.order)
                const isCollapsed = collapsedSections.has(section.id)

                return (
                  <>
                    {/* Section row */}
                    <Table.Row
                      key={`section-${section.id}`}
                      bg="bg.subtle"
                      cursor="pointer"
                      onClick={() => toggleSection(section.id)}
                      _hover={{ bg: "bg.muted" }}
                    >
                      <Table.Cell>
                        <Icon
                          as={isCollapsed ? LuChevronRight : LuChevronDown}
                          boxSize={3.5}
                          color="fg.muted"
                        />
                      </Table.Cell>
                      <Table.Cell colSpan={6}>
                        <HStack gap="2">
                          <Box w="2" h="2" rounded="full" bg={section.color ?? "gray.400"} />
                          <Text fontWeight="semibold" fontSize="sm" color="fg">{section.name}</Text>
                          <Badge size="xs" colorPalette="gray" variant="subtle">{tasks.length}</Badge>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>

                    {/* Task rows */}
                    {!isCollapsed && tasks.map(task => {
                      const isOverdueTask = task.dueDate ? isOverdue(task.dueDate) : false
                      const assignees = task.assignees
                        .map(a => store.users.find(u => u.id === a.userId))
                        .filter(Boolean)

                      return (
                        <Table.Row
                          key={task.id}
                          cursor="pointer"
                          onClick={() => setSelectedTaskId(task.id)}
                          _hover={{ bg: "bg.subtle" }}
                        >
                          <Table.Cell>
                            <Box w="0.5" h="5" bg={`${PRIORITY_COLORS[task.priority]}.500`} rounded="full" mx="auto" />
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize="sm" color="fg" fontWeight="medium" pl="4">{task.title}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={STATUS_COLORS[task.status]} size="xs" variant="subtle">
                              {STATUS_LABELS[task.status]}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={PRIORITY_COLORS[task.priority]} size="xs" variant="subtle">
                              {PRIORITY_ICONS[task.priority]} {task.priority}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <HStack gap="-1">
                              {assignees.slice(0, 3).map(user => (
                                <Box
                                  key={user!.id}
                                  w="5" h="5" rounded="full"
                                  borderWidth="1.5px"
                                  borderColor="bg.panel"
                                  overflow="hidden"
                                  ml="-1"
                                  _first={{ ml: 0 }}
                                >
                                  <Box as="img" src={user!.avatar} w="full" h="full" objectFit="cover" />
                                </Box>
                              ))}
                              {assignees.length === 0 && (
                                <Icon as={LuUser} boxSize={3.5} color="fg.subtle" />
                              )}
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            {task.dueDate && (
                              <HStack gap="1">
                                <Icon
                                  as={isOverdueTask ? LuCircleAlert : LuCalendar}
                                  boxSize={3}
                                  color={isOverdueTask ? "red.500" : "fg.muted"}
                                />
                                <Text
                                  fontSize="xs"
                                  color={isOverdueTask ? "red.500" : "fg.muted"}
                                >
                                  {formatDate(task.dueDate)}
                                </Text>
                              </HStack>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {task.progress > 0 && (
                              <HStack gap="2">
                                <Box w="16" h="1.5" bg="bg.emphasized" rounded="full">
                                  <Box
                                    h="1.5" rounded="full"
                                    bg={task.progress === 100 ? "green.500" : "blue.500"}
                                    w={`${task.progress}%`}
                                  />
                                </Box>
                                <Text fontSize="xs" color="fg.muted">{task.progress}%</Text>
                              </HStack>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}

                    {/* Add task row */}
                    {!isCollapsed && (
                      <Table.Row key={`add-${section.id}`}>
                        <Table.Cell />
                        <Table.Cell colSpan={6}>
                          <Button
                            variant="ghost"
                            size="xs"
                            color="fg.muted"
                            ml="4"
                            onClick={() => createTask({
                              projectId,
                              sectionId: section.id,
                              title: "New Task",
                            })}
                          >
                            <Icon as={LuPlus} />
                            Add task
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </>
  )
}
