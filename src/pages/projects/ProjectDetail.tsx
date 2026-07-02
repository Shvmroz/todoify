import {
  Box, VStack, HStack, Text, Heading, Icon, Badge, Button, Tabs,
  Separator, Avatar as ChakraAvatar
} from "@chakra-ui/react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  LuKanban, LuUsers, LuSettings, LuPlus, LuStar,
  LuArrowLeft, LuCalendar, LuPin
} from "react-icons/lu"
import { useStore } from "../../store"
import { Avatar as AvatarSnippet } from "../../components/ui/avatar"
import KanbanBoard from "./KanbanBoard"
import ProjectMembers from "./ProjectMembers"
import { ROLE_LABELS, ROLE_COLORS, timeAgo } from "../../utils"

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { store, toggleFavorite, addRecentlyViewed } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState("sections")

  const project = store.projects.find(p => p.id === id)

  useEffect(() => {
    if (id) addRecentlyViewed(id)
  }, [id, addRecentlyViewed])

  if (!project) {
    return (
      <Box p="6">
        <Text color="fg.muted">Project not found</Text>
        <Button mt="4" onClick={() => navigate("/projects")}>Back to Projects</Button>
      </Box>
    )
  }

  const tasks = store.tasks.filter(t => t.projectId === id)
  const completed = tasks.filter(t => t.status === "completed").length
  const members = project.members.map(m => store.users.find(u => u.id === m.userId)).filter(Boolean)

  return (
    <Box display="flex" flexDir="column" h="full">
      {/* Project Header */}
      <Box
        px="6" py="4"
        borderBottomWidth="1px"
        borderColor="border.muted"
        bg="bg.panel"
        flexShrink={0}
      >
        <VStack align="stretch" gap="3">
          <HStack gap="2">
            <Icon
              as={LuArrowLeft}
              boxSize={4}
              color="fg.muted"
              cursor="pointer"
              onClick={() => navigate("/projects")}
              _hover={{ color: "fg" }}
            />
            <Text fontSize="sm" color="fg.muted" as={Link} to="/projects" _hover={{ color: "fg" }}>Projects</Text>
            <Text fontSize="sm" color="fg.muted">/</Text>
            <Text fontSize="sm" color="fg">{project.name}</Text>
          </HStack>

          <HStack justify="space-between" flexWrap="wrap" gap="3">
            <HStack gap="3">
              <Box
                w="10" h="10" rounded="xl"
                bg={project.color}
                display="flex" alignItems="center" justifyContent="center"
                fontSize="xl"
              >
                {project.icon}
              </Box>
              <VStack align="start" gap="0.5">
                <HStack gap="2">
                  <Heading size="lg" color="fg">{project.name}</Heading>
                  <Badge
                    colorPalette={project.status === "active" ? "green" : "gray"}
                    variant="subtle"
                  >
                    {project.status}
                  </Badge>
                </HStack>
                {project.description && (
                  <Text fontSize="sm" color="fg.muted">{project.description}</Text>
                )}
              </VStack>
            </HStack>

            <HStack gap="3" flexWrap="wrap">
              {/* Stats */}
              <HStack gap="4">
                <VStack gap="0">
                  <Text fontSize="xl" fontWeight="bold" color="fg">{tasks.length}</Text>
                  <Text fontSize="xs" color="fg.muted">Tasks</Text>
                </VStack>
                <VStack gap="0">
                  <Text fontSize="xl" fontWeight="bold" color="fg">{completed}</Text>
                  <Text fontSize="xs" color="fg.muted">Done</Text>
                </VStack>
                <VStack gap="0">
                  <Text fontSize="xl" fontWeight="bold" color="fg">{members.length}</Text>
                  <Text fontSize="xs" color="fg.muted">Members</Text>
                </VStack>
              </HStack>

              {/* Member avatars */}
              <HStack gap="-2">
                {members.slice(0, 4).map(user => (
                  <Box
                    key={user!.id}
                    w="7" h="7" rounded="full"
                    borderWidth="2px"
                    borderColor="bg.panel"
                    overflow="hidden"
                    ml="-2"
                    _first={{ ml: 0 }}
                  >
                    <Box as="img" src={user!.avatar} alt={user!.name} w="full" h="full" objectFit="cover" />
                  </Box>
                ))}
                {members.length > 4 && (
                  <Box
                    w="7" h="7" rounded="full"
                    bg="bg.emphasized"
                    display="flex" alignItems="center" justifyContent="center"
                    borderWidth="2px" borderColor="bg.panel"
                    ml="-2"
                  >
                    <Text fontSize="xs" color="fg.muted">+{members.length - 4}</Text>
                  </Box>
                )}
              </HStack>

              <HStack gap="2">
                <Icon
                  as={LuStar}
                  boxSize={5}
                  color={project.isFavorite ? "yellow.500" : "fg.muted"}
                  fill={project.isFavorite ? "yellow.500" : "transparent"}
                  cursor="pointer"
                  onClick={() => toggleFavorite(project.id)}
                  _hover={{ color: "yellow.500" }}
                />
                <Button size="sm" colorPalette="purple" onClick={() => setTab("sections")}>
                  <Icon as={LuPlus} />
                  Add Task
                </Button>
              </HStack>
            </HStack>
          </HStack>

          {/* Tags */}
          {project.tags.length > 0 && (
            <HStack gap="2" flexWrap="wrap">
              {project.tags.map(tag => (
                <Badge key={tag} variant="outline" size="sm" colorPalette="gray">{tag}</Badge>
              ))}
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Tabs */}
      <Box
        px="6" py="0"
        borderBottomWidth="1px"
        borderColor="border.muted"
        bg="bg.panel"
        flexShrink={0}
      >
        <HStack gap="0">
          {[
            { id: "sections", label: "Sections", icon: LuKanban },
            { id: "members", label: "Members", icon: LuUsers },
          ].map(t => (
            <HStack
              key={t.id}
              gap="1.5"
              px="4" py="3"
              cursor="pointer"
              borderBottomWidth="2px"
              borderColor={tab === t.id ? "purple.500" : "transparent"}
              color={tab === t.id ? "purple.500" : "fg.muted"}
              fontWeight={tab === t.id ? "semibold" : "medium"}
              fontSize="sm"
              _hover={{ color: tab === t.id ? "purple.500" : "fg" }}
              onClick={() => setTab(t.id)}
              transition="all 0.15s"
            >
              <Icon as={t.icon} boxSize={4} />
              <Text>{t.label}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>

      {/* Content */}
      <Box flex="1" overflow="auto">
        {tab === "sections" && <KanbanBoard projectId={project.id} />}
        {tab === "members" && <ProjectMembers project={project} />}
      </Box>
    </Box>
  )
}
