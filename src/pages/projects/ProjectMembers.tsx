import {
  Box, VStack, HStack, Text, Icon, Badge, Button, Input,
  Separator, Avatar
} from "@chakra-ui/react"
import { useState } from "react"
import { LuPlus, LuSearch, LuMail, LuUserPlus } from "react-icons/lu"
import { useStore } from "../../store"
import type { Project } from "../../types"
import { Avatar as AvatarSnippet } from "../../components/ui/avatar"
import { ROLE_LABELS, ROLE_COLORS, timeAgo } from "../../utils"
import InviteModal from "./InviteModal"

export default function ProjectMembers({ project }: { project: Project }) {
  const { store, getUserById } = useStore()
  const [search, setSearch] = useState("")
  const [showInvite, setShowInvite] = useState(false)

  const members = project.members
    .map(m => {
      const user = getUserById(m.userId)
      return user ? { ...m, user } : null
    })
    .filter(Boolean)
    .filter(m => m!.user.name.toLowerCase().includes(search.toLowerCase()) || m!.user.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <Box p="6" maxW="4xl">
      <HStack justify="space-between" mb="6">
        <VStack align="start" gap="0">
          <Text fontWeight="semibold" fontSize="lg" color="fg">Team Members</Text>
          <Text fontSize="sm" color="fg.muted">{project.members.length} members</Text>
        </VStack>
        <Button colorPalette="purple" size="sm" onClick={() => setShowInvite(true)}>
          <Icon as={LuUserPlus} />
          Invite Member
        </Button>
      </HStack>

      {/* Search */}
      <HStack
        gap="2" px="3" py="2" rounded="lg" bg="bg.panel"
        borderWidth="1px" borderColor="border.muted" mb="4" maxW="sm"
      >
        <Icon as={LuSearch} boxSize={4} color="fg.muted" />
        <Input
          variant="plain"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          p="0" h="auto" fontSize="sm"
        />
      </HStack>

      <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
        <VStack gap="0" align="stretch" divideY="1px">
          {members.map(m => {
            const isOnline = m!.user.isOnline
            return (
              <HStack key={m!.userId} gap="4" p="4" _hover={{ bg: "bg.subtle" }}>
                <Box position="relative">
                  <AvatarSnippet src={m!.user.avatar} name={m!.user.name} size="md" />
                  <Box
                    position="absolute" bottom="0" right="0"
                    w="3" h="3" rounded="full"
                    bg={isOnline ? "green.500" : "gray.400"}
                    borderWidth="2px" borderColor="bg.panel"
                  />
                </Box>
                <VStack align="start" gap="0.5" flex="1" minW="0">
                  <Text fontWeight="semibold" color="fg" fontSize="sm">{m!.user.name}</Text>
                  <HStack gap="1">
                    <Icon as={LuMail} boxSize={3} color="fg.muted" />
                    <Text fontSize="xs" color="fg.muted">{m!.user.email}</Text>
                  </HStack>
                </VStack>
                <VStack align="end" gap="1">
                  <Badge colorPalette={ROLE_COLORS[m!.role]} size="sm" variant="subtle">
                    {ROLE_LABELS[m!.role]}
                  </Badge>
                  <Text fontSize="xs" color="fg.muted">
                    {isOnline ? "Online now" : `Active ${timeAgo(m!.user.lastActive)}`}
                  </Text>
                </VStack>
              </HStack>
            )
          })}
        </VStack>
      </Box>

      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        projectId={project.id}
      />
    </Box>
  )
}
