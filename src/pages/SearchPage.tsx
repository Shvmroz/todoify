import {
  Box, VStack, HStack, Text, Heading, Icon, Input, SimpleGrid
} from "@chakra-ui/react"
import { useState } from "react"
import { LuSearch, LuFolderOpen, LuListTodo } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import { STATUS_COLORS, STATUS_LABELS, isOverdue } from "../utils"

export default function SearchPage() {
  const { store } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const q = query.toLowerCase()
  const matchedProjects = q ? store.projects.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : []
  const matchedTasks = q ? store.tasks.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) : []

  return (
    <Box p={{ base: "4", md: "6" }} maxW="3xl">
      <VStack align="stretch" gap="6">
        <Heading size="xl" color="fg">Search</Heading>

        <HStack gap="2" px="4" py="3" rounded="xl" bg="bg.panel" borderWidth="1px" borderColor="border.muted">
          <Icon as={LuSearch} boxSize={5} color="fg.muted" />
          <Input
            variant="plain"
            placeholder="Search projects, tasks, users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            p="0" h="auto"
            fontSize="lg"
            autoFocus
          />
        </HStack>

        {query && (
          <VStack gap="4" align="stretch">
            {matchedProjects.length > 0 && (
              <Box>
                <HStack gap="2" mb="2">
                  <Icon as={LuFolderOpen} boxSize={4} color="fg.muted" />
                  <Text fontSize="sm" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                    Projects ({matchedProjects.length})
                  </Text>
                </HStack>
                <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
                  <VStack gap="0" align="stretch" divideY="1px">
                    {matchedProjects.map(p => (
                      <HStack key={p.id} gap="3" px="4" py="3" cursor="pointer" _hover={{ bg: "bg.subtle" }} onClick={() => navigate(`/projects/${p.id}`)}>
                        <Box w="7" h="7" rounded-lg bg={p.color} display="flex" alignItems="center" justifyContent="center" fontSize="sm">{p.icon}</Box>
                        <VStack align="start" gap="0">
                          <Text fontSize="sm" fontWeight="medium" color="fg">{p.name}</Text>
                          {p.description && <Text fontSize="xs" color="fg.muted" truncate maxW="lg">{p.description}</Text>}
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>
            )}

            {matchedTasks.length > 0 && (
              <Box>
                <HStack gap="2" mb="2">
                  <Icon as={LuListTodo} boxSize={4} color="fg.muted" />
                  <Text fontSize="sm" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                    Tasks ({matchedTasks.length})
                  </Text>
                </HStack>
                <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
                  <VStack gap="0" align="stretch" divideY="1px">
                    {matchedTasks.slice(0, 10).map(t => {
                      const project = store.projects.find(p => p.id === t.projectId)
                      return (
                        <HStack key={t.id} gap="3" px="4" py="3" cursor="pointer" _hover={{ bg: "bg.subtle" }} onClick={() => navigate(`/projects/${t.projectId}`)}>
                          <Box w="2" h="2" rounded="full" bg={`${STATUS_COLORS[t.status]}.500`} />
                          <VStack align="start" gap="0" flex="1" minW="0">
                            <Text fontSize="sm" fontWeight="medium" color="fg" truncate>{t.title}</Text>
                            {project && <Text fontSize="xs" color="fg.muted">{project.name}</Text>}
                          </VStack>
                          <Text fontSize="xs" color="fg.muted">{STATUS_LABELS[t.status]}</Text>
                        </HStack>
                      )
                    })}
                  </VStack>
                </Box>
              </Box>
            )}

            {matchedProjects.length === 0 && matchedTasks.length === 0 && (
              <Box p="8" textAlign="center">
                <Icon as={LuSearch} boxSize={12} color="fg.subtle" mb="3" />
                <Text color="fg.muted">No results for "{query}"</Text>
              </Box>
            )}
          </VStack>
        )}

        {!query && (
          <Box p="8" textAlign="center">
            <Icon as={LuSearch} boxSize={12} color="fg.subtle" mb="3" />
            <Text color="fg.muted">Start typing to search...</Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
