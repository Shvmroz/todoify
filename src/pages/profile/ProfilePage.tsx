import {
  Box, VStack, HStack, Text, Heading, Icon, Badge, Button, Input, Textarea, SimpleGrid
} from "@chakra-ui/react"
import { useState } from "react"
import { LuPen, LuCheck, LuUser, LuMail, LuCamera } from "react-icons/lu"
import { useStore } from "../../store"
import { Avatar as AvatarSnippet } from "../../components/ui/avatar"
import { ROLE_LABELS, ROLE_COLORS } from "../../utils"

export default function ProfilePage() {
  const { store, dispatch } = useStore()
  const user = store.currentUser
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name ?? "", bio: user?.bio ?? "" })

  if (!user) return null

  function handleSave() {
    dispatch({ type: "UPDATE_USER", payload: { id: user!.id, name: form.name, bio: form.bio } })
    setEditing(false)
  }

  function handleCancel() {
    setForm({ name: user.name, bio: user.bio })
    setEditing(false)
  }

  return (
    <Box p={{ base: "4", md: "6" }} maxW="2xl">
      <VStack align="stretch" gap="6">
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="fg">Profile Settings</Heading>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Icon as={LuPen} />
              Edit Profile
            </Button>
          )}
        </HStack>

        {/* Profile Card */}
        <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" p="6">
          <VStack align="stretch" gap="6">
            {/* Avatar Section */}
            <HStack gap="4" align="start">
              <Box position="relative">
                <AvatarSnippet src={user.avatar} name={user.name} size="lg" />
                <Box
                  position="absolute" bottom="0" right="0"
                  w="8" h="8" rounded="full"
                  bg="purple.500"
                  display="flex" alignItems="center" justifyContent="center"
                  cursor="pointer"
                  borderWidth="2px"
                  borderColor="bg.panel"
                  _hover={{ bg: "purple.600" }}
                >
                  <Icon as={LuCamera} boxSize={4} color="white" />
                </Box>
              </Box>
              <VStack align="start" gap="1" flex="1">
                <Text fontSize="sm" color="fg.muted">Profile Picture</Text>
                <Text fontSize="xs" color="fg.muted">Click the camera icon to upload a new photo</Text>
              </VStack>
            </HStack>

            {/* Form Fields */}
            <VStack align="stretch" gap="4">
              {/* Name Field */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="fg" mb="2">Full Name</Text>
                {editing ? (
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    size="md"
                  />
                ) : (
                  <Box p="3" rounded="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.muted">
                    <Text fontSize="sm" color="fg">{user.name}</Text>
                  </Box>
                )}
              </Box>

              {/* Email Field - Read Only */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="fg" mb="2">Email Address</Text>
                <Box p="3" rounded="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.muted">
                  <HStack gap="2">
                    <Icon as={LuMail} boxSize={4} color="fg.muted" />
                    <Text fontSize="sm" color="fg">{user.email}</Text>
                  </HStack>
                </Box>
              </Box>

              {/* Username Field - Read Only */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="fg" mb="2">Username</Text>
                <Box p="3" rounded="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.muted">
                  <HStack gap="2">
                    <Text fontSize="sm" color="fg.muted">@</Text>
                    <Text fontSize="sm" color="fg">{user.username}</Text>
                  </HStack>
                </Box>
              </Box>

              {/* Role Badge */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="fg" mb="2">Role</Text>
                <Badge
                  colorPalette={ROLE_COLORS[user.role]}
                  variant="subtle"
                  size="md"
                  w="fit-content"
                >
                  {ROLE_LABELS[user.role]}
                </Badge>
              </Box>

              {/* Bio Field */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="fg" mb="2">Bio</Text>
                {editing ? (
                  <Textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    resize="vertical"
                  />
                ) : (
                  <Box p="3" rounded="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.muted" minH="80px">
                    <Text fontSize="sm" color={form.bio ? "fg" : "fg.muted"}>
                      {form.bio || "No bio added yet."}
                    </Text>
                  </Box>
                )}
              </Box>
            </VStack>

            {/* Action Buttons */}
            {editing && (
              <HStack gap="3" justify="flex-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button colorPalette="purple" onClick={handleSave} disabled={!form.name.trim()}>
                  <Icon as={LuCheck} />
                  Save Changes
                </Button>
              </HStack>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
