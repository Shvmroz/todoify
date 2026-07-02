import { Box, Flex } from "@chakra-ui/react"
import { Outlet, Navigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { useStore } from "../../store"

export default function AppLayout() {
  const { store } = useStore()

  if (!store.currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <Flex h="100vh" overflow="hidden" bg="bg">
      <Sidebar />
      <Flex flex="1" flexDir="column" overflow="hidden">
        <Topbar />
        <Box flex="1" overflow="auto" bg="bg">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
