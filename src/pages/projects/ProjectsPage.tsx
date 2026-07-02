import {
  Box, VStack, HStack, Text, Heading, Icon, Badge, Button, Input,
  SimpleGrid, Menu, Separator, Progress
} from "@chakra-ui/react"
import { Link, useNavigate } from "react-router-dom"
import {
  LuPlus, LuSearch, LuStar, LuPin, LuEllipsis, LuTrash2,
  LuPen, LuUsers, LuFolderOpen, LuFilter, LuArchive, LuCheck
} from "react-icons/lu"
import { useState } from "react"
import { useStore } from "../../store"
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from "../../components/ui/menu"
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogCloseTrigger } from "../../components/ui/dialog"
import { Field } from "../../components/ui/field"
import type { Project } from "../../types"
import CreateProjectModal from "./CreateProjectModal"
import { PROJECT_ICONS } from "../../store/storage"

export default function ProjectsPage() {
  const { store, deleteProject, toggleFavorite, togglePin, updateProject } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"active" | "archived">("active")
  const [showCreate, setShowCreate] = useState(false)

  const projects = store.projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <Box p={{ base: "4", md: "6" }}>
      <VStack align="stretch" gap="6">
        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap" gap="2">
          <VStack align="start" gap="0">
            <Heading size="xl" color="fg">Projects</Heading>
            <Text color="fg.muted" fontSize="sm">{store.projects.length} total projects</Text>
          </VStack>
          <Button onClick={() => setShowCreate(true)} colorPalette="purple">
            <Icon as={LuPlus} />
            New Project
          </Button>
        </HStack>

        {/* Filters */}
        <HStack gap="3" flexWrap="wrap">
          <HStack
            gap="2" px="3" py="2" rounded="lg" bg="bg.panel"
            borderWidth="1px" borderColor="border.muted" flex="1" maxW="sm"
          >
            <Icon as={LuSearch} boxSize={4} color="fg.muted" />
            <Input
              variant="plain"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              p="0" h="auto" fontSize="sm"
            />
          </HStack>
          <HStack gap="2">
            {(["active", "archived"] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "solid" : "outline"}
                colorPalette={filter === f ? "purple" : "gray"}
                onClick={() => setFilter(f)}
                textTransform="capitalize"
              >
                {f}
              </Button>
            ))}
          </HStack>
        </HStack>

        {/* Pinned */}
        {store.projects.filter(p => p.isPinned).length > 0 && (
          <Box>
            <HStack gap="2" mb="3">
              <Icon as={LuPin} boxSize={4} color="fg.muted" />
              <Text fontSize="sm" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">Pinned</Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
              {store.projects.filter(p => p.isPinned).map(p => (
                <ProjectCard key={p.id} project={p} onDelete={deleteProject} onToggleFavorite={toggleFavorite} onTogglePin={togglePin} onUpdateProject={updateProject} />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* All Projects */}
        <Box>
          {store.projects.some(p => p.isPinned) && (
            <HStack gap="2" mb="3">
              <Icon as={LuFolderOpen} boxSize={4} color="fg.muted" />
              <Text fontSize="sm" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">All Projects</Text>
            </HStack>
          )}
          {projects.length === 0 ? (
            <Box
              bg="bg.panel" rounded="2xl" p="12" textAlign="center"
              borderWidth="1px" borderColor="border.muted" borderStyle="dashed"
            >
              <Icon as={LuFolderOpen} boxSize={12} color="fg.subtle" mb="4" />
              <Text fontWeight="semibold" color="fg" mb="2">No projects found</Text>
              <Text fontSize="sm" color="fg.muted" mb="4">Create your first project to get started</Text>
              <Button onClick={() => setShowCreate(true)} colorPalette="purple">
                <Icon as={LuPlus} />
                Create Project
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} onDelete={deleteProject} onToggleFavorite={toggleFavorite} onTogglePin={togglePin} onUpdateProject={updateProject} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </Box>
  )
}

function ProjectCard({
  project,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onUpdateProject,
}: {
  project: Project
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onTogglePin: (id: string) => void
  onUpdateProject: (id: string, data: Partial<Project>) => void
}) {
  const { store } = useStore()
  const navigate = useNavigate()
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameName, setRenameName] = useState(project.name)
  const [renameIcon, setRenameIcon] = useState(project.icon)
  const tasks = store.tasks.filter(t => t.projectId === project.id)
  const completed = tasks.filter(t => t.status === "completed").length
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
  const members = project.members.slice(0, 3)

  const handleRenameSubmit = () => {
    if (renameName.trim()) {
      onUpdateProject(project.id, { name: renameName.trim(), icon: renameIcon })
      setShowRenameModal(false)
    }
  }

  return (
    <Box
      bg="bg.panel"
      rounded="xl"
      borderWidth="1px"
      borderColor="border.muted"
      shadow="sm"
      overflow="hidden"
      _hover={{ shadow: "md", borderColor: "border" }}
      transition="all 0.15s"
      cursor="pointer"
      onClick={() => !showRenameModal && navigate(`/projects/${project.id}`)}
      position="relative"
      display="flex"
      flexDir="column"
      h="220px"
    >
      {/* Color bar */}
      <Box h="1.5" bg={project.color} flexShrink={0} />

      <Box p="5" display="flex" flexDir="column" flex="1" gap="3">
        <HStack justify="space-between" gap="2" flexShrink={0}>
          <HStack gap="2" minW="0">
            <Box
              w="8" h="8" rounded="lg"
              bg={project.color}
              display="flex" alignItems="center" justifyContent="center"
              fontSize="md"
              flexShrink={0}
            >
              {project.icon}
            </Box>
            <VStack align="start" gap="0" minW="0" flex="1">
              <Text fontWeight="semibold" color="fg" fontSize="sm" truncate title={project.name}>{project.name}</Text>
              <Badge
                colorPalette={project.status === "active" ? "green" : project.status === "archived" ? "gray" : "blue"}
                size="xs"
                variant="subtle"
              >
                {project.status}
              </Badge>
            </VStack>
          </HStack>

          <HStack gap="1" onClick={e => e.stopPropagation()} flexShrink={0}>
            <Icon
              as={LuStar}
              boxSize={4}
              color={project.isFavorite ? "yellow.500" : "fg.subtle"}
              cursor="pointer"
              onClick={() => onToggleFavorite(project.id)}
              fill={project.isFavorite ? "yellow.500" : "transparent"}
              _hover={{ color: "yellow.500" }}
            />
            <MenuRoot>
              <MenuTrigger asChild>
                <Icon as={LuEllipsis} boxSize={4} color="fg.muted" cursor="pointer" _hover={{ color: "fg" }} />
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="view" onClick={() => navigate(`/projects/${project.id}`)}>
                  <Icon as={LuFolderOpen} /> Open
                </MenuItem>
                <MenuItem value="rename" onClick={() => setShowRenameModal(true)}>
                  <Icon as={LuPen} /> Rename
                </MenuItem>
                <MenuItem value="pin" onClick={() => onTogglePin(project.id)}>
                  <Icon as={LuPin} /> {project.isPinned ? "Unpin" : "Pin"}
                </MenuItem>
                <Separator />
                <MenuItem value="archive" onClick={() => onUpdateProject(project.id, { status: project.status === "active" ? "archived" : "active" })}>
                  <Icon as={LuArchive} /> {project.status === "active" ? "Archive" : "Unarchive"}
                </MenuItem>
                <MenuItem value="delete" color="fg.error" onClick={() => onDelete(project.id)}>
                  <Icon as={LuTrash2} /> Delete
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </HStack>
        </HStack>

        {/* Description - Fixed height with ellipsis */}
        <Box h="10" flexShrink={0}>
          {project.description && (
            <Text fontSize="sm" color="fg.muted" lineClamp={2} title={project.description}>{project.description}</Text>
          )}
        </Box>

        {/* Tags - Fixed height with scroll if needed */}
        <Box h="6" flexShrink={0} overflowY="auto" overflowX="hidden" css={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-track': { bg: 'transparent' }, '&::-webkit-scrollbar-thumb': { bg: 'var(--chakra-colors-border-muted)', borderRadius: '2px' } }}>
          {project.tags.length > 0 && (
            <HStack gap="1" flexWrap="nowrap">
              {project.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" size="xs" colorPalette="gray" flexShrink={0}>{tag}</Badge>
              ))}
            </HStack>
          )}
        </Box>

        <Separator my="0" flexShrink={0} />

        {/* Footer - Fixed height */}
        <HStack justify="space-between" flexShrink={0}>
          <HStack gap="-2">
            {members.map(m => {
              const user = store.users.find(u => u.id === m.userId)
              return (
                <Box
                  key={m.userId}
                  w="6" h="6" rounded="full"
                  bg="bg.panel"
                  borderWidth="1.5px"
                  borderColor="bg.panel"
                  overflow="hidden"
                  ml="-2"
                  _first={{ ml: 0 }}
                  flexShrink={0}
                >
                  <Box
                    as="img"
                    src={user?.avatar}
                    alt={user?.name}
                    w="full" h="full"
                    objectFit="cover"
                  />
                </Box>
              )
            })}
            {project.members.length > 3 && (
              <Box
                w="6" h="6" rounded="full"
                bg="bg.muted"
                display="flex" alignItems="center" justifyContent="center"
                borderWidth="1.5px"
                borderColor="bg.panel"
                ml="-2"
                flexShrink={0}
              >
                <Text fontSize="xs" color="fg.muted">+{project.members.length - 3}</Text>
              </Box>
            )}
          </HStack>
          <HStack gap="3" flexShrink={0}>
            <HStack gap="1">
              <Icon as={LuUsers} boxSize={3.5} color="fg.muted" flexShrink={0} />
              <Text fontSize="xs" color="fg.muted" flexShrink={0}>{project.members.length}</Text>
            </HStack>
            <Text fontSize="xs" color="fg.muted" flexShrink={0}>{tasks.length} tasks</Text>
          </HStack>
        </HStack>
      </Box>

      {/* Rename Modal */}
      <DialogRoot open={showRenameModal} onOpenChange={d => { if (!d.open) setShowRenameModal(false) }} size="md">
        <DialogContent onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <VStack gap="4">
              <Field label="Project name" required w="full">
                <Input
                  placeholder="Project name"
                  value={renameName}
                  onChange={e => setRenameName(e.target.value)}
                  autoFocus
                />
              </Field>

              <Field label="Icon" w="full">
                <SimpleGrid columns={10} gap="1">
                  {PROJECT_ICONS.map(icon => (
                    <Box
                      key={icon}
                      w="8" h="8" rounded="lg"
                      bg={renameIcon === icon ? "bg.emphasized" : "bg.subtle"}
                      display="flex" alignItems="center" justifyContent="center"
                      cursor="pointer"
                      onClick={() => setRenameIcon(icon)}
                      borderWidth="1px"
                      borderColor={renameIcon === icon ? "border" : "transparent"}
                      fontSize="lg"
                      _hover={{ bg: "bg.emphasized" }}
                    >
                      {renameIcon === icon && <Icon as={LuCheck} boxSize={3} color="purple.500" position="absolute" />}
                      <Text>{icon}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameModal(false)}>Cancel</Button>
            <Button colorPalette="purple" onClick={handleRenameSubmit} disabled={!renameName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  )
}
