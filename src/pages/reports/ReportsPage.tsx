import {
  Box, VStack, HStack, Text, Heading, Icon, Badge, Button, SimpleGrid
} from "@chakra-ui/react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts"
import { LuTrendingUp, LuUsers, LuCircleCheck, LuClock } from "react-icons/lu"
import { useStore } from "../../store"
import { STATUS_LABELS, PRIORITY_LABELS } from "../../utils"
import type { TaskStatus, TaskPriority } from "../../types"

export default function ReportsPage() {
  const { store } = useStore()

  const tasks = store.tasks
  const users = store.users

  // Tasks per status
  const statusData = (Object.keys(STATUS_LABELS) as TaskStatus[]).map(s => ({
    name: STATUS_LABELS[s],
    value: tasks.filter(t => t.status === s).length,
  })).filter(d => d.value > 0)

  // Tasks per priority
  const priorityData = (Object.keys(PRIORITY_LABELS) as TaskPriority[]).map(p => ({
    name: p,
    value: tasks.filter(t => t.priority === p).length,
  })).filter(d => d.value > 0)

  // Team performance
  const teamData = users.map(u => ({
    name: u.name.split(" ")[0],
    assigned: tasks.filter(t => t.assignees.some(a => a.userId === u.id)).length,
    completed: tasks.filter(t => t.assignees.some(a => a.userId === u.id) && t.status === "completed").length,
  }))

  // Productivity over 7 days (mock data)
  const productivityData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    created: Math.floor(Math.random() * 5) + 1,
    completed: Math.floor(Math.random() * 4),
  }))

  const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#a855f7", "#3b82f6"]

  const totalCompleted = tasks.filter(t => t.status === "completed").length
  const totalPending = tasks.filter(t => t.status === "pending").length
  const totalWorking = tasks.filter(t => t.status === "working_on").length
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0

  return (
    <Box p={{ base: "4", md: "6" }}>
      <VStack align="stretch" gap="6">
        <VStack align="start" gap="0">
          <Heading size="xl" color="fg">Reports & Analytics</Heading>
          <Text color="fg.muted" fontSize="sm">Project performance overview</Text>
        </VStack>

        {/* Summary stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
          {[
            { label: "Completion Rate", value: `${completionRate}%`, icon: LuCircleCheck, color: "green" },
            { label: "Total Completed", value: totalCompleted, icon: LuTrendingUp, color: "blue" },
            { label: "Active Tasks", value: totalWorking, icon: LuClock, color: "orange" },
            { label: "Pending Tasks", value: totalPending, icon: LuUsers, color: "purple" },
          ].map(s => (
            <Box key={s.label} bg="bg.panel" rounded="xl" p="4" borderWidth="1px" borderColor="border.muted" shadow="sm">
              <HStack justify="space-between" mb="2">
                <Text fontSize="sm" color="fg.muted">{s.label}</Text>
                <Icon as={s.icon} boxSize={4} color={`${s.color}.500`} />
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="fg">{s.value}</Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Charts row */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
          {/* Tasks by status */}
          <Box bg="bg.panel" rounded="xl" p="5" borderWidth="1px" borderColor="border.muted" shadow="sm">
            <Text fontWeight="semibold" color="fg" mb="4">Tasks by Status</Text>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTooltip contentStyle={{ background: "var(--chakra-colors-bg-panel)", border: "1px solid var(--chakra-colors-border-muted)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Tasks by priority */}
          <Box bg="bg.panel" rounded="xl" p="5" borderWidth="1px" borderColor="border.muted" shadow="sm">
            <Text fontWeight="semibold" color="fg" mb="4">Tasks by Priority</Text>
            <HStack justify="center" gap="8">
              <PieChart width={200} height={200}>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false}>
                  {priorityData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: "var(--chakra-colors-bg-panel)", border: "1px solid var(--chakra-colors-border-muted)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* Team performance */}
        <Box bg="bg.panel" rounded="xl" p="5" borderWidth="1px" borderColor="border.muted" shadow="sm">
          <Text fontWeight="semibold" color="fg" mb="4">Team Performance</Text>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={teamData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <RechartsTooltip contentStyle={{ background: "var(--chakra-colors-bg-panel)", border: "1px solid var(--chakra-colors-border-muted)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend />
              <Bar dataKey="assigned" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned" />
              <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Productivity */}
        <Box bg="bg.panel" rounded="xl" p="5" borderWidth="1px" borderColor="border.muted" shadow="sm">
          <Text fontWeight="semibold" color="fg" mb="4">Productivity This Week</Text>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <RechartsTooltip contentStyle={{ background: "var(--chakra-colors-bg-panel)", border: "1px solid var(--chakra-colors-border-muted)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend />
              <Area type="monotone" dataKey="created" stroke="#6366f1" fill="url(#grad1)" strokeWidth={2} name="Created" />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#grad2)" strokeWidth={2} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Project breakdown table */}
        <Box bg="bg.panel" rounded="xl" borderWidth="1px" borderColor="border.muted" overflow="hidden">
          <Box px="5" py="4" borderBottomWidth="1px" borderColor="border.muted">
            <Text fontWeight="semibold" color="fg">Project Breakdown</Text>
          </Box>
          <VStack gap="0" align="stretch" divideY="1px">
            {store.projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id)
              const done = projectTasks.filter(t => t.status === "completed").length
              const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0
              return (
                <HStack key={project.id} gap="4" px="5" py="3" _hover={{ bg: "bg.subtle" }}>
                  <Box w="7" h="7" rounded-lg bg={project.color} display="flex" alignItems="center" justifyContent="center" fontSize="sm">
                    {project.icon}
                  </Box>
                  <Text fontSize="sm" fontWeight="medium" color="fg" flex="1">{project.name}</Text>
                  <Text fontSize="sm" color="fg.muted">{projectTasks.length} tasks</Text>
                  <HStack gap="2" w="32">
                    <Box h="1.5" flex="1" bg="bg.emphasized" rounded="full">
                      <Box h="1.5" bg={pct === 100 ? "green.500" : project.color} rounded="full" w={`${pct}%`} />
                    </Box>
                    <Text fontSize="xs" color="fg.muted" w="8" textAlign="right">{pct}%</Text>
                  </HStack>
                  <Badge colorPalette={project.status === "active" ? "green" : "gray"} size="sm" variant="subtle">
                    {project.status}
                  </Badge>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
