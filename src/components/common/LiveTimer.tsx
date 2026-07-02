import { Text, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { LuClock } from "react-icons/lu"
import { formatLiveTimer } from "../../utils"

export default function LiveTimer({ startedAt }: { startedAt?: string }) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    const interval = setInterval(() => forceUpdate(n => n + 1), 30000)
    return () => clearInterval(interval)
  }, [startedAt])

  if (!startedAt) return null

  return (
    <Text fontSize="xs" color="blue.500" fontWeight="medium">
      Working for {formatLiveTimer(startedAt)}
    </Text>
  )
}
