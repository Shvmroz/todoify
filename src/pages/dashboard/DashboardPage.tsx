import { Box, VStack, HStack, Text, Heading, Icon, Badge, Grid, GridItem, Button } from "@chakra-ui/react"
import { LuCheck, LuClock, LuTriangleAlert, LuUsers, LuArrowRight } from "react-icons/lu"
import { Link } from "react-router-dom"
import { useStore } from "../../store"
import { STATUS_COLORS, STATUS_LABELS } from "../../utils"

export default function DashboardPage() {
  const { store, getUserById } = useStore()

  // Get all tasks for current user
  const userTasks = store.tasks.filter(t =>
    t.assignees.some(a => a.userId === store.currentUser?.id)
  )

  // Count tasks by status
  const completedTasks = userTasks.filter(t => t.status === "completed").length
  const workingOnTasks = userTasks.filter(t => t.status === "working_on").length
  const pendingTasks = userTasks.filter(t => t.status === "pending").length

  // Get all team members from projects
  const allMembers = new Map<string, { userId: string; name: string; avatar: string; role: string }>()
  store.projects.forEach(project => {
    project.members.forEach(member => {
      const user = getUserById(member.userId)
      if (user && !allMembers.has(member.userId)) {
        allMembers.set(member.userId, {
          userId: member.userId,
          name: user.name,
          avatar: user.avatar || "",
          role: member.role,
        })
      }
    })
  })

  const teamMembers = Array.from(allMembers.values())
  const activeProjects = store.projects.filter(p => p.status === "active").length

  return (
    <Box
      minH="full"
      bg="gray.50"
      _dark={{ bg: "bg" }}
      p={{ base: "4", md: "6" }}
    >
      <VStack align="stretch" gap="6" maxW="7xl" mx="auto">
        {/* Welcome Header */}
        <VStack align="start" gap="1" pb="2">
          <Heading size="xl" color="fg">
            Welcome back, {store.currentUser?.name.split(" ")[0]}! 👋
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            Here's what's happening with your projects today
          </Text>
        </VStack>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3">
          {/* Total Tasks */}
          <GridItem
            bg="linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)"
            _dark={{ bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)" }}
            rounded="xl"
            p="4"
            borderWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "border.muted" }}
            transition="all 0.2s"
          >
            <VStack align="start" gap="3">
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">Total Tasks</Text>
                <Box
                  w="8" h="8"
                  rounded="lg"
                  bg="blue.100"
                  _dark={{ bg: "blue.900" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={LuCheck} boxSize={4} color="blue.500" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="fg">{userTasks.length}</Text>
            </VStack>
          </GridItem>

          {/* Completed */}
          <GridItem
            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)"
            _dark={{ bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)" }}
            rounded="xl"
            p="4"
            borderWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "border.muted" }}
            transition="all 0.2s"
          >
            <VStack align="start" gap="3">
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">Completed</Text>
                <Box
                  w="8" h="8"
                  rounded="lg"
                  bg="green.100"
                  _dark={{ bg: "green.900" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={LuCheck} boxSize={4} color="green.500" />
                </Box>
              </HStack>
              <HStack gap="1" align="baseline">
                <Text fontSize="2xl" fontWeight="bold" color="fg">{completedTasks}</Text>
                <Text fontSize="xs" color="fg.muted">of {userTasks.length}</Text>
              </HStack>
            </VStack>
          </GridItem>

          {/* Working On */}
          <GridItem
            bg="linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)"
            _dark={{ bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)" }}
            rounded="xl"
            p="4"
            borderWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "border.muted" }}
            transition="all 0.2s"
          >
            <VStack align="start" gap="3">
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">In Progress</Text>
                <Box
                  w="8" h="8"
                  rounded="lg"
                  bg="blue.100"
                  _dark={{ bg: "blue.900" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={LuClock} boxSize={4} color="blue.500" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="fg">{workingOnTasks}</Text>
            </VStack>
          </GridItem>

          {/* Pending */}
          <GridItem
            bg="linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)"
            _dark={{ bg: "linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)" }}
            rounded="xl"
            p="4"
            borderWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "border.muted" }}
            transition="all 0.2s"
          >
            <VStack align="start" gap="3">
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase">Pending</Text>
                <Box
                  w="8" h="8"
                  rounded="lg"
                  bg="yellow.100"
                  _dark={{ bg: "yellow.900" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={LuTriangleAlert} boxSize={4} color="yellow.500" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="fg">{pendingTasks}</Text>
            </VStack>
          </GridItem>
        </Grid>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6">
          {/* Recent Tasks */}
          <VStack
            align="stretch"
            gap="4"
            bg="linear-gradient(135deg, rgba(168, 85, 247, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)"
            _dark={{ bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)" }}
            rounded="xl"
            p="6"
            borderWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "border.muted" }}
          >
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Heading size="sm" color="fg">Recent Tasks</Heading>
                <Text fontSize="xs" color="fg.muted">Your assigned tasks</Text>
              </VStack>
              <Button
                as={Link}
                to="/projects"
                size="xs"
                variant="ghost"
                color="purple.500"
                gap="1"
              >
                View all <Icon as={LuArrowRight} boxSize={3} />
              </Button>
            </HStack>

            {userTasks.length === 0 ? (
              <VStack py="8" gap="2">
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  No tasks assigned yet
                </Text>
                <Button
                  as={Link}
                  to="/projects"
                  size="sm"
                  colorPalette="purple"
                  variant="ghost"
                >
                  Browse Projects
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" gap="2">
                {userTasks.slice(0, 6).map(task => {
                  const project = store.projects.find(p => p.id === task.projectId)
                  return (
                    <HStack
                      key={task.id}
                      p="3"
                      rounded="lg"
                      bg="bg.subtle"
                      justify="space-between"
                      align="center"
                      _hover={{ bg: "bg.emphasized" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <VStack align="start" gap="1" flex="1" minW="0">
                        <HStack gap="2">
                          <Box
                            w="3" h="3"
                            rounded="full"
                            bg={project?.color || "gray"}
                          />
                          <Text fontSize="sm" fontWeight="medium" color="fg" noOfLines={1}>
                            {task.title}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                          {project?.name}
                        </Text>
                      </VStack>
                      <Badge
                        colorPalette={STATUS_COLORS[task.status]}
                        variant="subtle"
                        size="sm"
                        flexShrink={0}
                      >
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </HStack>
                  )
                })}
              </VStack>
            )}
          </VStack>

          {/* Team & Projects */}
          <VStack align="stretch" gap="6">
            {/* Projects Overview */}
            <VStack
              align="stretch"
              gap="3"
              bg="linear-gradient(135deg, rgba(168, 85, 247, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)"
              _dark={{ bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)" }}
              rounded="xl"
              p="6"
              borderWidth="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "border.muted" }}
            >
              <VStack align="start" gap="1">
                <Heading size="sm" color="fg">Projects</Heading>
                <Text fontSize="xs" color="fg.muted">Your active projects</Text>
              </VStack>
              <HStack
                p="4"
                rounded="lg"
                bg="purple.50"
                _dark={{ bg: "purple.950" }}
                justify="space-between"
                align="center"
              >
                <VStack align="start" gap="0">
                  <Text fontSize="xl" fontWeight="bold" color="purple.700" _dark={{ color: "purple.300" }}>
                    {activeProjects}
                  </Text>
                  <Text fontSize="xs" color="purple.600" _dark={{ color: "purple.400" }}>
                    Active projects
                  </Text>
                </VStack>
                <Button
                  as={Link}
                  to="/projects"
                  size="xs"
                  colorPalette="purple"
                  variant="solid"
                >
                  View
                </Button>
              </HStack>
            </VStack>

            {/* Team Members */}
            <VStack
              align="stretch"
              gap="3"
              bg="linear-gradient(135deg, rgba(168, 85, 247, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)"
              _dark={{ bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)" }}
              rounded="xl"
              p="6"
              borderWidth="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "border.muted" }}
            >
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <Icon as={LuUsers} boxSize={4} color="fg.muted" />
                  <Heading size="sm" color="fg">Team</Heading>
                </HStack>
                <Text fontSize="xs" color="fg.muted">{teamMembers.length} members</Text>
              </VStack>

              {teamMembers.length === 0 ? (
                <Text fontSize="sm" color="fg.muted" textAlign="center" py="4">
                  No team members
                </Text>
              ) : (
                <VStack align="stretch" gap="2">
                  {teamMembers.slice(0, 5).map(member => (
                    <HStack
                      key={member.userId}
                      p="2"
                      rounded="lg"
                      gap="2"
                      _hover={{ bg: "bg.subtle" }}
                      transition="all 0.2s"
                    >
                      <Box
                        w="7" h="7"
                        rounded="full"
                        overflow="hidden"
                        flexShrink={0}
                        borderWidth="2px"
                        borderColor="border.muted"
                      >
                        <Box
                          as="img"
                          src={member.avatar}
                          alt={member.name}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      </Box>
                      <VStack align="start" gap="0" flex="1" minW="0">
                        <Text fontSize="xs" fontWeight="semibold" color="fg" noOfLines={1}>
                          {member.name}
                        </Text>
                        <Text fontSize="2xs" color="fg.muted" noOfLines={1}>
                          {member.role}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                  {teamMembers.length > 5 && (
                    <Text fontSize="xs" color="fg.muted" textAlign="center" pt="2">
                      +{teamMembers.length - 5} more
                    </Text>
                  )}
                </VStack>
              )}
            </VStack>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  )
}
