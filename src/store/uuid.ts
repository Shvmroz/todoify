let counter = 0

export function uuidv4(): string {
  counter++
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 9)
  return `${timestamp}_${random}_${counter}`
}
