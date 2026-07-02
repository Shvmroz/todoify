import {
  Box, HStack, Text, Icon, Input, Badge,
  Separator, IconButton
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { LuSearch, LuSun, LuMoon, LuChevronDown, LuUser, LuLogOut } from "react-icons/lu"
import { useStore } from "../../store"
import { useColorMode } from "../ui/color-mode"
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from "../ui/menu"
import { Avatar as AvatarSnippet } from "../ui/avatar"
import { InputGroup } from "../ui/input-group"
import { getInitials } from "../../utils"

interface TopbarProps {
  title?: string
}

export default function Topbar({ title }: TopbarProps) {
  const { store, logout } = useStore()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()

  return (
    <Box
      as="header"
      h="14"
      px="6"
      borderBottomWidth="1px"
      borderColor="border.muted"
      bg="bg.panel"
      display="flex"
      alignItems="center"
      gap="4"
      flexShrink={0}
    >
      {title && (
        <Text fontSize="lg" fontWeight="semibold" color="fg" mr="4">
          {title}
        </Text>
      )}

      {/* Search */}
      <HStack flex="1" maxW="sm" gap="2">
        <InputGroup startElement={<Icon as={LuSearch} color="fg.muted" boxSize={4} />} flex="1">
          <Input
            placeholder="Search projects, tasks..."
            size="sm"
            variant="subtle"
            rounded="lg"
            onClick={() => navigate("/search")}
            readOnly
            cursor="pointer"
          />
        </InputGroup>
      </HStack>

      <HStack ml="auto" gap="2">
        {/* Dark mode toggle */}
        <IconButton
          aria-label="Toggle color mode"
          variant="ghost"
          size="sm"
          onClick={toggleColorMode}
          rounded="lg"
        >
          <Icon as={colorMode === "dark" ? LuSun : LuMoon} boxSize={4} />
        </IconButton>

        {/* User menu */}
        <MenuRoot>
          <MenuTrigger asChild>
            <HStack gap="2" cursor="pointer" px="2" py="1" rounded="lg" _hover={{ bg: "bg.subtle" }}>
              <AvatarSnippet
                src={store.currentUser?.avatar}
                name={store.currentUser?.name}
                size="sm"
              />
              <Box hideBelow="md">
                <Text fontSize="sm" fontWeight="medium" color="fg" lineHeight="tight">{store.currentUser?.name}</Text>
                <Text fontSize="xs" color="fg.muted" lineHeight="tight">{store.currentUser?.role?.replace(/_/g, " ")}</Text>
              </Box>
              <Icon as={LuChevronDown} boxSize={3} color="fg.muted" hideBelow="md" />
            </HStack>
          </MenuTrigger>
          <MenuContent minW="48">
            <MenuItem value="profile" onClick={() => navigate("/profile")}>
              <Icon as={LuUser} />
              <Text>Profile</Text>
            </MenuItem>
            <Separator />
            <MenuItem value="logout" color="fg.error" onClick={() => { logout(); navigate("/login") }}>
              <Icon as={LuLogOut} />
              <Text>Sign out</Text>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </HStack>
    </Box>
  )
}
