import {
  Box, VStack, HStack, Text, Input, Button, Heading, Textarea,
  Icon, SimpleGrid, Badge
} from "@chakra-ui/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LuX, LuCheck } from "react-icons/lu"
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogCloseTrigger } from "../../components/ui/dialog"
import { Field } from "../../components/ui/field"
import { useStore } from "../../store"
import { PROJECT_COLORS, PROJECT_ICONS } from "../../store/storage"

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateProjectModal({ open, onClose }: Props) {
  const { createProject, createSection } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: PROJECT_COLORS[0],
    icon: PROJECT_ICONS[0],
    tags: "",
  })

  function handleCreate() {
    if (!form.name.trim()) return
    const project = createProject({
      name: form.name,
      description: form.description,
      color: form.color,
      icon: form.icon,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    })
    // Create default sections
    createSection(project.id, "Todo")
    createSection(project.id, "In Progress")
    createSection(project.id, "Completed")
    onClose()
    navigate(`/projects/${project.id}`)
  }

  return (
    <DialogRoot open={open} onOpenChange={d => !d.open && onClose()} size="md">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap="4">
            {/* Preview */}
            <Box
              w="full" p="4" rounded="xl"
              bg="bg.subtle"
              borderWidth="1px" borderColor="border.muted"
              display="flex" alignItems="center" gap="3"
            >
              <Box
                w="10" h="10" rounded="lg"
                bg={form.color}
                display="flex" alignItems="center" justifyContent="center"
                fontSize="lg"
              >
                {form.icon}
              </Box>
              <VStack align="start" gap="0">
                <Text fontWeight="semibold" color="fg">{form.name || "Project Name"}</Text>
                <Text fontSize="xs" color="fg.muted">{form.description || "Project description"}</Text>
              </VStack>
            </Box>

            <Field label="Project name" required w="full">
              <Input
                placeholder="e.g. E-Commerce Platform"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </Field>

            <Field label="Description" w="full">
              <Textarea
                placeholder="What is this project about?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </Field>

            {/* Color picker */}
            <Field label="Color" w="full">
              <HStack gap="2" flexWrap="wrap">
                {PROJECT_COLORS.map(color => (
                  <Box
                    key={color}
                    w="7" h="7" rounded="lg"
                    bg={color}
                    cursor="pointer"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    display="flex" alignItems="center" justifyContent="center"
                    borderWidth="2px"
                    borderColor={form.color === color ? "white" : "transparent"}
                    boxShadow={form.color === color ? `0 0 0 2px ${color}` : "none"}
                    transition="all 0.1s"
                  >
                    {form.color === color && <Icon as={LuCheck} boxSize={3} color="white" />}
                  </Box>
                ))}
              </HStack>
            </Field>

            {/* Icon picker */}
            <Field label="Icon" w="full">
              <SimpleGrid columns={10} gap="1">
                {PROJECT_ICONS.map(icon => (
                  <Box
                    key={icon}
                    w="8" h="8" rounded="lg"
                    bg={form.icon === icon ? "bg.emphasized" : "bg.subtle"}
                    display="flex" alignItems="center" justifyContent="center"
                    cursor="pointer"
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    borderWidth="1px"
                    borderColor={form.icon === icon ? "border" : "transparent"}
                    fontSize="lg"
                    _hover={{ bg: "bg.emphasized" }}
                  >
                    {icon}
                  </Box>
                ))}
              </SimpleGrid>
            </Field>

            <Field label="Tags (comma separated)" w="full">
              <Input
                placeholder="frontend, backend, design"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorPalette="purple" onClick={handleCreate} disabled={!form.name.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
