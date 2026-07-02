import { Box, VStack, HStack, Text, Icon, Badge, Separator } from "@chakra-ui/react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Tooltip } from "../../components/ui/tooltip"
import {
  LuFolderOpen, LuCalendar, LuLayoutDashboard,
  LuChevronLeft, LuChevronRight, LuStar, LuPin,
  LuSearch, LuLogOut
} from "react-icons/lu"
import { useState } from "react"
import { useStore } from "../../store"

interface NavItem {
  label: string
  icon: React.ComponentType<{ size?: number }>
  href: string
  badge?: number
}

const mainNav: NavItem[] = [
  { label: "Dashboard", icon: LuLayoutDashboard, href: "/dashboard" },
  { label: "Projects", icon: LuFolderOpen, href: "/projects" },
  { label: "Calendar", icon: LuCalendar, href: "/calendar" },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { store, logout } = useStore()
  const unreadNotifs = store.notifications.filter(n => n.userId === store.currentUser?.id && !n.isRead).length

  const pinnedProjects = store.projects.filter(p => p.isPinned)
  const favoriteProjects = store.projects.filter(p => p.isFavorite)

  const isActive = (href: string) => {
    if (href === "/projects") return location.pathname.startsWith("/projects")
    return location.pathname.startsWith(href)
  }

  return (
    <Box
      as="aside"
      w={collapsed ? "16" : "64"}
      minH="100vh"
      bg="bg.panel"
      borderRightWidth="1px"
      borderColor="border.muted"
      display="flex"
      flexDir="column"
      transition="width 0.2s ease"
      position="relative"
      flexShrink={0}
    >
      {/* Header */}
      <VStack px="4" py="4" gap="1" borderBottomWidth="1px" borderColor="border.muted" align={collapsed ? "center" : "start"} w="full">
        {!collapsed && (
          <>
            <Text fontWeight="bold" fontSize="lg" color="fg">
              Todoify
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </>
        )}
      </VStack>

      {/* Toggle button */}
      <Box
        position="absolute"
        right="-3.5"
        top="20"
        zIndex={10}
        bg="bg.panel"
        border="1px solid"
        borderColor="border.muted"
        rounded="full"
        w="7" h="7"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        onClick={() => setCollapsed(c => !c)}
        _hover={{ bg: "bg.subtle" }}
        boxShadow="sm"
      >
        <Icon as={collapsed ? LuChevronRight : LuChevronLeft} boxSize={3} color="fg.muted" />
      </Box>

      {/* Search */}
      {!collapsed && (
        <Box px="3" py="3">
          <HStack
            as={Link}
            to="/search"
            gap="2"
            px="3" py="2"
            rounded="lg"
            bg="bg.subtle"
            _hover={{ bg: "bg.emphasized" }}
            cursor="pointer"
          >
            <Icon as={LuSearch} boxSize={4} color="fg.muted" />
            <Text fontSize="sm" color="fg.muted">Search...</Text>
            <Box ml="auto" px="1.5" py="0.5" rounded="sm" bg="bg.muted" borderWidth="1px" borderColor="border.muted">
              <Text fontSize="xs" color="fg.subtle">⌘K</Text>
            </Box>
          </HStack>
        </Box>
      )}

      {/* Main Nav */}
      <VStack gap="0.5" px="2" py="2" align="stretch">
        {mainNav.map(item => {
          const active = isActive(item.href)
          const badge = item.label === "Notifications" ? unreadNotifs : undefined
          return (
            <Tooltip key={item.href} content={collapsed ? item.label : ""} positioning={{ placement: "right" }} disabled={!collapsed}>
              <HStack
                as={Link}
                to={item.href}
                gap="3"
                px="3" py="2"
                rounded="lg"
                bg={active ? "colorPalette.subtle" : "transparent"}
                color={active ? "colorPalette.fg" : "fg.muted"}
                colorPalette="purple"
                _hover={{ bg: active ? "colorPalette.subtle" : "bg.subtle", color: "fg" }}
                fontWeight={active ? "semibold" : "medium"}
                fontSize="sm"
                transition="all 0.15s"
              >
                <Icon as={item.icon} boxSize={4.5} flexShrink={0} />
                {!collapsed && <Text flex="1">{item.label}</Text>}
                {!collapsed && badge ? <Badge colorPalette="red" size="sm">{badge}</Badge> : null}
              </HStack>
            </Tooltip>
          )
        })}
      </VStack>

      <Separator my="2" />

      {/* Pinned & Favorites */}
      {!collapsed && pinnedProjects.length + favoriteProjects.length > 0 && (
        <Box px="3" pb="2">
          {pinnedProjects.length > 0 && (
            <>
              <HStack gap="1" mb="1">
                <Icon as={LuPin} boxSize={3} color="fg.subtle" />
                <Text fontSize="xs" fontWeight="semibold" color="fg.subtle" textTransform="uppercase" letterSpacing="wider">
                  Pinned
                </Text>
              </HStack>
              {pinnedProjects.map(p => (
                <ProjectLink key={p.id} project={p} />
              ))}
            </>
          )}
          {favoriteProjects.filter(p => !p.isPinned).length > 0 && (
            <>
              <HStack gap="1" mt="2" mb="1">
                <Icon as={LuStar} boxSize={3} color="fg.subtle" />
                <Text fontSize="xs" fontWeight="semibold" color="fg.subtle" textTransform="uppercase" letterSpacing="wider">
                  Favorites
                </Text>
              </HStack>
              {favoriteProjects.filter(p => !p.isPinned).map(p => (
                <ProjectLink key={p.id} project={p} />
              ))}
            </>
          )}
        </Box>
      )}

      {/* Bottom */}
      <Box mt="auto" borderTopWidth="1px" borderColor="border.muted" px="2" py="2">
        <Tooltip content={collapsed ? "Logout" : ""} positioning={{ placement: "right" }} disabled={!collapsed}>
          <HStack
            gap="3" px="3" py="2" rounded="lg"
            color="fg.muted"
            _hover={{ bg: "bg.subtle", color: "fg" }}
            fontSize="sm"
            cursor="pointer"
            onClick={() => {
              logout()
              navigate("/login")
            }}
          >
            <Icon as={LuLogOut} boxSize={4.5} flexShrink={0} />
            {!collapsed && <Text>Logout</Text>}
          </HStack>
        </Tooltip>
      </Box>
    </Box>
  )
}

function ProjectLink({ project }: { project: import("../../types").Project }) {
  const location = useLocation()
  const active = location.pathname.startsWith(`/projects/${project.id}`)
  return (
    <HStack
      as={Link}
      to={`/projects/${project.id}`}
      gap="2" px="2" py="1.5" rounded="md"
      bg={active ? "bg.subtle" : "transparent"}
      _hover={{ bg: "bg.subtle" }}
      fontSize="sm"
      color={active ? "fg" : "fg.muted"}
    >
      <Box
        w="5" h="5" rounded="sm" flexShrink={0}
        bg={project.color}
        display="flex" alignItems="center" justifyContent="center"
        fontSize="xs"
      >
        {project.icon}
      </Box>
      <Text truncate flex="1" fontSize="sm">{project.name}</Text>
    </HStack>
  )
}
