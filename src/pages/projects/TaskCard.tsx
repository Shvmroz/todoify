import { Box, HStack, VStack, Text, Icon, Badge } from "@chakra-ui/react"
import {
  LuGripVertical, LuMessageSquare, LuPaperclip, LuCalendar,
  LuSquareCheck, LuUser, LuCircleAlert, LuClock
} from "react-icons/lu"
import type { Task } from "../../types"
import { useStore } from "../../store"
import {
  STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
  PRIORITY_ICONS, formatDate, isOverdue
} from "../../utils"
import LiveTimer from "../../components/common/LiveTimer"

interface TaskCardProps {
  task: Task
  onOpen: (id: string) => void
  dragHandleProps?: Record<string, unknown>
}

export default function TaskCard({ task, onOpen, dragHandleProps }: TaskCardProps) {
  const { store } = useStore()
  const comments = store.comments.filter(c => c.taskId === task.id)
  const doneChecklist = task.checklist.filter(c => c.completed).length
  const isOverdueTask = task.dueDate ? isOverdue(task.dueDate) : false

  const assignees = task.assignees
    .map(a => store.users.find(u => u.id === a.userId))
    .filter(Boolean)
    .slice(0, 3)

  return (
    <Box
      bg="bg.panel"
      rounded="lg"
      borderWidth="1px"
      borderColor={isOverdueTask ? "red.200" : "border.muted"}
      p="3"
      shadow={"xs"}
      cursor="pointer"
      onClick={() => onOpen(task.id)}
      _hover={{
        borderColor: "gray.100",
        transform: "translateY(-1px)",
        shadow: "0 4px 12px -2px rgba(168, 85, 247, 0.2)",
      }}
      transition="all 0.15s"
      position="relative"
    >
      {/* Priority indicator */}
      <Box
        position="absolute"
        left="0" top="3"
        w="1" h="8"
        rounded="full"
        bg={`${PRIORITY_COLORS[task.priority]}.500`}
      />

      <Box pl="2">
        {/* Labels */}
        {task.labels.length > 0 && (
          <HStack gap="1" mb="2" flexWrap="wrap">
            {task.labels.slice(0, 3).map(label => (
              <Badge key={label} size="xs" variant="subtle" colorPalette="purple">{label}</Badge>
            ))}
          </HStack>
        )}

        {/* Title */}
        <HStack gap="2" mb="2" align="start">
          {dragHandleProps && (
            <Icon
              as={LuGripVertical}
              boxSize={3.5}
              color="fg.subtle"
              cursor="grab"
              flexShrink={0}
              mt="0.5"
              {...dragHandleProps}
              onClick={e => e.stopPropagation()}
            />
          )}
          <Text fontSize="sm" color="fg" fontWeight="medium" lineHeight="tight" flex="1">
            {task.title}
          </Text>
        </HStack>

        {/* Working indicator */}
        {task.status === "working_on" && (
          <HStack gap="1" mb="2">
            <Box w="1.5" h="1.5" rounded="full" bg="blue.500" animation="pulse 1s infinite" />
            <LiveTimer startedAt={task.startedWorkingAt} />
          </HStack>
        )}

        {/* Status & Priority */}
        <HStack gap="2" mb="2" flexWrap="wrap">
          <Badge
            colorPalette={STATUS_COLORS[task.status]}
            size="xs"
            variant="subtle"
          >
            {STATUS_LABELS[task.status]}
          </Badge>
          {task.priority !== "none" && (
            <Badge colorPalette={PRIORITY_COLORS[task.priority]} size="xs" variant="subtle">
              {PRIORITY_ICONS[task.priority]} {PRIORITY_LABELS[task.priority]}
            </Badge>
          )}
        </HStack>

        {/* Due date */}
        {task.dueDate && (
          <HStack gap="1" mb="2">
            <Icon
              as={isOverdueTask ? LuCircleAlert : LuCalendar}
              boxSize={3}
              color={isOverdueTask ? "red.500" : "fg.muted"}
            />
            <Text
              fontSize="xs"
              color={isOverdueTask ? "red.500" : "fg.muted"}
              fontWeight={isOverdueTask ? "medium" : "normal"}
            >
              {formatDate(task.dueDate)}
            </Text>
          </HStack>
        )}

        {/* Progress */}
        {task.progress > 0 && task.progress < 100 && (
          <Box mb="2">
            <Box h="1" bg="bg.emphasized" rounded="full">
              <Box
                h="1"
                rounded="full"
                bg={task.progress >= 80 ? "green.500" : "blue.500"}
                w={`${task.progress}%`}
              />
            </Box>
          </Box>
        )}

        {/* Footer */}
        <HStack justify="space-between" mt="2">
          {/* Assignees */}
          <HStack gap="-1.5">
            {assignees.map(user => (
              <Box
                key={user!.id}
                w="5" h="5" rounded="full"
                borderWidth="1.5px"
                borderColor="bg.panel"
                overflow="hidden"
                ml="-1.5"
                _first={{ ml: 0 }}
              >
                <Box as="img" src={user!.avatar} alt={user!.name} w="full" h="full" objectFit="cover" />
              </Box>
            ))}
            {task.assignees.length === 0 && (
              <Icon as={LuUser} boxSize={4} color="fg.subtle" />
            )}
          </HStack>

          {/* Stats */}
          <HStack gap="2">
            {task.checklist.length > 0 && (
              <HStack gap="0.5">
                <Icon as={LuSquareCheck} boxSize={3} color={doneChecklist === task.checklist.length ? "green.500" : "fg.muted"} />
                <Text fontSize="xs" color="fg.muted">{doneChecklist}/{task.checklist.length}</Text>
              </HStack>
            )}
            {comments.length > 0 && (
              <HStack gap="0.5">
                <Icon as={LuMessageSquare} boxSize={3} color="fg.muted" />
                <Text fontSize="xs" color="fg.muted">{comments.length}</Text>
              </HStack>
            )}
            {task.attachments.length > 0 && (
              <HStack gap="0.5">
                <Icon as={LuPaperclip} boxSize={3} color="fg.muted" />
                <Text fontSize="xs" color="fg.muted">{task.attachments.length}</Text>
              </HStack>
            )}
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}
