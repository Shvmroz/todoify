import { Box, VStack, HStack, Text, Heading, Icon, Badge, Button } from "@chakra-ui/react"
import { useState } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns"
import { LuChevronLeft, LuChevronRight, LuCalendar } from "react-icons/lu"
import { useStore } from "../../store"
import { STATUS_COLORS, PRIORITY_COLORS } from "../../utils"
import TaskDetailPanel from "../tasks/TaskDetailPanel"

export default function CalendarPage() {
  const { store } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const tasks = store.tasks.filter(t => t.dueDate)

  function getTasksForDay(date: Date) {
    return tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  return (
    <>
      <Box p={{ base: "4", md: "6" }}>
        <VStack align="stretch" gap="4">
          <HStack justify="space-between" flexWrap="wrap" gap="2">
            <VStack align="start" gap="0">
              <Heading size="xl" color="fg">Calendar</Heading>
              <Text color="fg.muted" fontSize="sm">{tasks.length} tasks with due dates</Text>
            </VStack>
          </HStack>

          {/* Calendar Grid */}
          <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
              {/* Month navigation */}
              <HStack px="5" py="3" borderBottomWidth="1px" borderColor="border.muted" justify="space-between">
                <Icon as={LuChevronLeft} boxSize={5} cursor="pointer" onClick={() => setCurrentDate(d => subMonths(d, 1))} color="fg.muted" _hover={{ color: "fg" }} />
                <Text fontWeight="bold" fontSize="lg" color="fg">
                  {format(currentDate, "MMMM yyyy")}
                </Text>
                <Icon as={LuChevronRight} boxSize={5} cursor="pointer" onClick={() => setCurrentDate(d => addMonths(d, 1))} color="fg.muted" _hover={{ color: "fg" }} />
              </HStack>

              {/* Day headers */}
              <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" borderBottomWidth="1px" borderColor="border.muted">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <Box key={d} py="2" textAlign="center">
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted">{d}</Text>
                  </Box>
                ))}
              </Box>

              {/* Calendar grid */}
              <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
                {days.map((day, idx) => {
                  const dayTasks = getTasksForDay(day)
                  const inMonth = isSameMonth(day, currentDate)
                  const isCurrentDay = isToday(day)

                  return (
                    <Box
                      key={idx}
                      minH="100px"
                      p="2"
                      borderRightWidth={idx % 7 !== 6 ? "1px" : "0"}
                      borderBottomWidth="1px"
                      borderColor="border.muted"
                      bg={isCurrentDay ? "purple.50" : "transparent"}
                      _dark={{ bg: isCurrentDay ? "purple.950" : "transparent" }}
                    >
                      <Box
                        w="6" h="6" rounded="full"
                        display="flex" alignItems="center" justifyContent="center"
                        bg={isCurrentDay ? "purple.500" : "transparent"}
                        mb="1"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight={isCurrentDay ? "bold" : "medium"}
                          color={isCurrentDay ? "white" : inMonth ? "fg" : "fg.subtle"}
                        >
                          {format(day, "d")}
                        </Text>
                      </Box>
                      <VStack gap="0.5" align="stretch">
                        {dayTasks.slice(0, 3).map(task => (
                          <Box
                            key={task.id}
                            px="1.5" py="0.5"
                            rounded="sm"
                            bg={`${STATUS_COLORS[task.status]}.100`}
                            _dark={{ bg: `${STATUS_COLORS[task.status]}.900` }}
                            cursor="pointer"
                            onClick={() => setSelectedTaskId(task.id)}
                            _hover={{ opacity: 0.8 }}
                          >
                            <Text fontSize="xs" color={`${STATUS_COLORS[task.status]}.700`} _dark={{ color: `${STATUS_COLORS[task.status]}.300` }} truncate>
                              {task.title}
                            </Text>
                          </Box>
                        ))}
                        {dayTasks.length > 3 && (
                          <Text fontSize="xs" color="fg.muted">+{dayTasks.length - 3} more</Text>
                        )}
                      </VStack>
                    </Box>
                  )
                })}
              </Box>
            </Box>
        </VStack>
      </Box>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </>
  )
}
