import species from './data/species.json'
import examples from './data/examples.json'

export { species }
export const fishById = Object.fromEntries(species.map(fish => [fish.id, fish]))
const key = 'balikci-meram:1'
const dateFormat = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

export function formatDate(value) {
  return dateFormat.format(new Date(value))
}

export function readRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    return { spots: saved?.spots ?? [], catches: saved?.catches ?? [] }
  } catch {
    return { spots: [], catches: [] }
  }
}

export function saveRecords(next) {
  localStorage.setItem(key, JSON.stringify(next))
}

export const exampleSpots = examples.spots
export const exampleCatches = examples.catches.map(({ daysAgo, hour, minute, ...entry }) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  if (date > new Date()) date.setDate(date.getDate() - 1)
  return { ...entry, date: date.toISOString(), example: true }
})

export async function encodePhoto(file) {
  if (!file.type.startsWith('image/') || file.size > 25 * 1024 * 1024) {
    throw new Error('25 MB veya daha küçük bir fotoğraf seç.')
  }
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', .75)
  } finally {
    URL.revokeObjectURL(url)
  }
}
