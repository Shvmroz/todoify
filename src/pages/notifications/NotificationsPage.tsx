import {
  Box, VStack, HStack, Text, Heading, Icon, Badge, Button
} from "@chakra-ui/react"
import { LuBell, LuCheck, LuCheckCheck, LuTrash2 } from "react-icons/lu"
import { useStore } from "../../store"
import { Avatar as AvatarSnippet } from "../../components/ui/avatar"
import { timeAgo } from "../../utils"
import type { NotificationType } from "../../types"

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  assigned: "👤",
  mentioned: "💬",
  invited: "📧",
  status_changed: "🔄",
  comment_added: "💭",
  checklist_completed: "✅",
  deadline_near: "⏰",
  task_completed: "🎉",
  invitation_accepted: "✅",
  invitation_rejected: "❌",
}

export default function NotificationsPage() {
  const { store, markNotificationRead, markAllNotificationsRead, getUserById } = useStore()

  const notifications = store.notifications
    .filter(n => n.userId === store.currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const unread = notifications.filter(n => !n.isRead)

  return (
    <Box p={{ base: "4", md: "6" }} maxW="3xl">
      <VStack align="stretch" gap="5">
        <HStack justify="space-between" flexWrap="wrap" gap="2">
          <VStack align="start" gap="0">
            <Heading size="xl" color="fg">Notifications</Heading>
            <Text color="fg.muted" fontSize="sm">
              {unread.length} unread · {notifications.length} total
            </Text>
          </VStack>
          {unread.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllNotificationsRead}
            >
              <Icon as={LuCheckCheck} />
              Mark all as read
            </Button>
          )}
        </HStack>

        {notifications.length === 0 ? (
          <Box
            bg="bg.panel" rounded="2xl" p="12" textAlign="center"
            borderWidth="1px" borderColor="border.muted"
          >
            <Icon as={LuBell} boxSize={12} color="fg.subtle" mb="4" />
            <Text fontWeight="semibold" color="fg" mb="2">You're all caught up!</Text>
            <Text fontSize="sm" color="fg.muted">No notifications yet</Text>
          </Box>
        ) : (
          <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
            <VStack gap="0" align="stretch" divideY="1px">
              {notifications.map(notif => {
                const fromUser = notif.fromUserId ? getUserById(notif.fromUserId) : null
                return (
                  <HStack
                    key={notif.id}
                    gap="4"
                    p="4"
                    bg={notif.isRead ? "transparent" : "purple.50"}
                    _dark={{ bg: notif.isRead ? "transparent" : "purple.950" }}
                    cursor="pointer"
                    _hover={{ bg: "bg.subtle" }}
                    onClick={() => markNotificationRead(notif.id)}
                    align="start"
                  >
                    {/* Avatar or icon */}
                    <Box position="relative" flexShrink={0}>
                      {fromUser ? (
                        <AvatarSnippet src={fromUser.avatar} name={fromUser.name} size="sm" />
                      ) : (
                        <Box
                          w="9" h="9" rounded="full"
                          bg="bg.emphasized"
                          display="flex" alignItems="center" justifyContent="center"
                          fontSize="lg"
                        >
                          {NOTIFICATION_ICONS[notif.type]}
                        </Box>
                      )}
                      {!notif.isRead && (
                        <Box
                          position="absolute"
                          top="-0.5"
                          right="-0.5"
                          w="2.5"
                          h="2.5"
                          rounded="full"
                          bg="purple.500"
                          borderWidth="1.5px"
                          borderColor="bg.panel"
                        />
                      )}
                    </Box>

                    <VStack align="start" gap="0.5" flex="1" minW="0">
                      <Text
                        fontSize="sm"
                        fontWeight={notif.isRead ? "normal" : "semibold"}
                        color="fg"
                      >
                        {notif.title}
                      </Text>
                      <Text fontSize="sm" color="fg.muted" lineClamp={2}>
                        {notif.message}
                      </Text>
                      <Text fontSize="xs" color="fg.subtle">{timeAgo(notif.createdAt)}</Text>
                    </VStack>

                    {!notif.isRead && (
                      <Icon
                        as={LuCheck}
                        boxSize={4}
                        color="purple.500"
                        flexShrink={0}
                        mt="1"
                      />
                    )}
                  </HStack>
                )
              })}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
