import {
  Box, VStack, HStack, Text, Input, Button, Icon, Badge, Textarea
} from "@chakra-ui/react"
import { useState } from "react"
import { LuSearch, LuUserPlus } from "react-icons/lu"
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogCloseTrigger } from "../../components/ui/dialog"
import { Field } from "../../components/ui/field"
import { useStore } from "../../store"
import { Avatar as AvatarSnippet } from "../../components/ui/avatar"
import type { UserRole } from "../../types"
import { ROLE_LABELS } from "../../utils"

interface Props {
  open: boolean
  onClose: () => void
  projectId: string
}

export default function InviteModal({ open, onClose, projectId }: Props) {
  const { store, inviteUser } = useStore()
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>("member")
  const [message, setMessage] = useState("")

  const project = store.projects.find(p => p.id === projectId)
  const existingMemberIds = new Set(project?.members.map(m => m.userId) ?? [])

  const results = search.length > 1
    ? store.users.filter(u =>
        !existingMemberIds.has(u.id) &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
         u.email.toLowerCase().includes(search.toLowerCase()) ||
         u.username.toLowerCase().includes(search.toLowerCase()))
      )
    : []

  function handleInvite() {
    if (!selectedUser) return
    inviteUser(projectId, selectedUser, role, message)
    onClose()
    setSelectedUser(null)
    setSearch("")
    setMessage("")
  }

  const selectedUserObj = selectedUser ? store.users.find(u => u.id === selectedUser) : null

  return (
    <DialogRoot open={open} onOpenChange={d => !d.open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap="4">
            <Field label="Search user" w="full">
              <HStack w="full" gap="2" borderWidth="1px" borderColor="border.muted" rounded="lg" px="3" py="2">
                <Icon as={LuSearch} boxSize={4} color="fg.muted" />
                <Input
                  variant="plain"
                  placeholder="Search by name, email, or username..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedUser(null) }}
                  p="0" h="auto" fontSize="sm"
                />
              </HStack>
            </Field>

            {/* Search results */}
            {results.length > 0 && !selectedUser && (
              <Box w="full" bg="bg.subtle" rounded="lg" borderWidth="1px" borderColor="border.muted" overflow="hidden">
                {results.map(user => (
                  <HStack
                    key={user.id}
                    gap="3" p="3"
                    cursor="pointer"
                    _hover={{ bg: "bg.muted" }}
                    onClick={() => { setSelectedUser(user.id); setSearch(user.name) }}
                  >
                    <AvatarSnippet src={user.avatar} name={user.name} size="sm" />
                    <VStack align="start" gap="0">
                      <Text fontSize="sm" fontWeight="medium" color="fg">{user.name}</Text>
                      <Text fontSize="xs" color="fg.muted">{user.email}</Text>
                    </VStack>
                  </HStack>
                ))}
              </Box>
            )}

            {/* Selected user */}
            {selectedUserObj && (
              <HStack gap="3" p="3" bg="bg.subtle" rounded="lg" w="full" borderWidth="1px" borderColor="purple.200">
                <AvatarSnippet src={selectedUserObj.avatar} name={selectedUserObj.name} size="sm" />
                <VStack align="start" gap="0" flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="fg">{selectedUserObj.name}</Text>
                  <Text fontSize="xs" color="fg.muted">{selectedUserObj.email}</Text>
                </VStack>
                <Badge colorPalette="purple" variant="subtle">Selected</Badge>
              </HStack>
            )}

            {/* Role */}
            <Field label="Role" w="full">
              <HStack gap="2" flexWrap="wrap">
                {(["member", "team_lead", "project_manager", "guest"] as UserRole[]).map(r => (
                  <Button
                    key={r}
                    size="xs"
                    variant={role === r ? "solid" : "outline"}
                    colorPalette={role === r ? "purple" : "gray"}
                    onClick={() => setRole(r)}
                  >
                    {ROLE_LABELS[r]}
                  </Button>
                ))}
              </HStack>
            </Field>

            <Field label="Message (optional)" w="full">
              <Textarea
                placeholder="Add a personal message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
              />
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            colorPalette="purple"
            onClick={handleInvite}
            disabled={!selectedUser}
          >
            <Icon as={LuUserPlus} />
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
