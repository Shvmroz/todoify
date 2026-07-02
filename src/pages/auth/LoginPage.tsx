import {
  Box, VStack, HStack, Text, Input, Button, Heading, Icon,
  Separator, Link as ChakraLink
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LuArrowRight, LuMoon, LuSun } from "react-icons/lu"
import { useStore } from "../../store"
import { Field } from "../../components/ui/field"
import { PasswordInput } from "../../components/ui/password-input"

export default function LoginPage() {
  const { login } = useStore()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const [email, setEmail] = useState("admin@todoify.com")
  const [password, setPassword] = useState("admin@todoify.com")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem("chakra-ui-color-mode") === "dark"
    setIsDark(darkMode)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    if (newMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("chakra-ui-color-mode", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("chakra-ui-color-mode", "light")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = login(email, password)
    if (ok) {
      navigate("/dashboard")
    } else {
      setError("Invalid email or password")
    }
    setLoading(false)
  }

  return (
    <Box
      minH="100vh"
      background="linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)"
      _dark={{
        background: "linear-gradient(135deg, #000000 0%, #111111 100%)"
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="4"
      position="relative"
    >
      {/* Dark Mode Toggle */}
      <Box
        position="absolute"
        top="4"
        right="4"
        zIndex={10}
      >
        <Button
          variant="ghost"
          size="lg"
          rounded="full"
          onClick={toggleDarkMode}
          color="white"
          _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
        >
          <Icon as={isDark ? LuSun : LuMoon} boxSize={5} />
        </Button>
      </Box>
      <Box
        w="full" maxW="sm"
        bg="gray.100"
        _dark={{ bg: "#0f0f0f" }}
        rounded="2xl"
        shadow="xl"
        borderWidth="1px"
        borderColor="gray.200"
        _dark={{ borderColor: "#1a1a1a" }}
        overflow="hidden"
      >

        <VStack gap="6" p="8">
          {/* Logo */}
          <VStack gap="3">
            <Box
              w="12" h="12"
              rounded="xl"
              bgGradient="to-br"
              gradientFrom="purple.500"
              gradientTo="blue.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                as="img"
                src="/logo.png"
                w="9" h="9"
              />
            </Box>
            <VStack gap="1">
              <Heading size="lg" color="fg">Welcome back</Heading>
              <Text fontSize="sm" color="fg.muted">Sign in to your Todoify account</Text>
            </VStack>
          </VStack>

          <Box as="form" w="full" onSubmit={handleSubmit}>
            <VStack gap="4">
              <Field label="Email address" w="full">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  size="md"
                  bg="white"
                  _dark={{ bg: "#1a1a1a", color: "white", borderColor: "#2a2a2a" }}
                  color="black"
                  borderColor="gray.200"
                  borderWidth="1px"
                  _placeholder={{ color: "gray.400", _dark: { color: "#555555" } }}
                />
              </Field>

              <Field label="Password" w="full">
                <PasswordInput
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  bg="white"
                  _dark={{ bg: "#1a1a1a", color: "white", borderColor: "#2a2a2a" }}
                  color="black"
                  borderColor="gray.200"
                  borderWidth="1px"
                  _placeholder={{ color: "gray.400", _dark: { color: "#555555" } }}
                />
              </Field>

              {error && (
                <Box w="full" p="3" rounded="lg" bg="red.50" _dark={{ bg: "#7f1d1d" }}>
                  <Text fontSize="sm" color="red.600" _dark={{ color: "#fca5a5" }}>{error}</Text>
                </Box>
              )}

              <Button
                type="submit"
                w="full"
                colorPalette="purple"
                loading={loading}
                loadingText="Signing in..."
                size="md"
              >
                Sign in
                <Icon as={LuArrowRight} />
              </Button>
            </VStack>
          </Box>

          <Separator />

          <Text fontSize="sm" color="fg.muted">
            Don't have an account?{" "}
            <ChakraLink as={Link} to="/register" color="purple.500" fontWeight="medium">
              Sign up
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
