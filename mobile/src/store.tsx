import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import catalog from './data/species.json'
import examples from './data/examples.json'

export type Point = { latitude: number; longitude: number }
export type Spot = Point & { id: string; name: string; district: string }
export type Catch = { id: string; spotId: string; speciesId: string; date: string; photo?: string; example?: boolean }
type Records = { spots: Spot[]; catches: Catch[]; species: typeof catalog }
type NewCatch = Pick<Catch, 'speciesId' | 'date' | 'photo'>
export type Draft = { point?: Point; spot?: Spot; intent: 'spot' | 'catch' }
const key = 'balikci-meram:native:v1'
const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
export const displayDate = (date: string) => dateFormat.format(new Date(date))

function seed(): Records {
  return {
    species: catalog,
    spots: examples.spots.map(({ lat, lng, ...spot }) => ({ ...spot, latitude: lat, longitude: lng })),
    catches: examples.catches.map(({ daysAgo, hour, minute, ...entry }) => {
      const date = new Date()
      date.setHours(hour, minute, 0, 0)
      date.setDate(date.getDate() - daysAgo)
      if (date > new Date()) date.setDate(date.getDate() - 1)
      return { ...entry, date: date.toISOString(), example: true }
    }),
  }
}

function useJournalState() {
  const [records, setRecords] = useState<Records | null>(null)
  const [storageError, setStorageError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [selected, setSelected] = useState<Spot>()
  const [draft, setDraft] = useState<Draft>()
  const [picking, setPicking] = useState<Draft['intent']>()
  const current = useRef<Records | null>(null)
  const queue = useRef(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const saved = await AsyncStorage.getItem(key)
        const value: Records = saved ? JSON.parse(saved) : seed()
        if (!Array.isArray(value.spots) || !Array.isArray(value.catches) || !Array.isArray(value.species)) {
          throw new Error('Geçersiz kayıt')
        }
        if (!saved) await AsyncStorage.setItem(key, JSON.stringify(value))
        if (!cancelled) {
          current.current = value
          setRecords(value)
          setStorageError(false)
        }
      } catch {
        if (!cancelled) setStorageError(true)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [loadAttempt])

  function save(location: Draft, name: string, caught?: NewCatch) {
    const operation = queue.current.then(async () => {
      const previous = current.current
      if (!previous || (!location.spot && !location.point)) throw new Error('Mera seç')
      const id = `yerel-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const spot: Spot = location.spot ?? { ...location.point!, id, name: name.trim() || 'Yeni mera', district: 'Kendi meram' }
      const next = {
        ...previous,
        spots: location.spot ? previous.spots : [...previous.spots, spot],
        catches: caught ? [{ ...caught, spotId: spot.id, id }, ...previous.catches] : previous.catches,
      }
      await AsyncStorage.setItem(key, JSON.stringify(next))
      current.current = next
      setRecords(next)
      setSelected(spot)
      setDraft(undefined)
    })
    queue.current = operation.catch(() => {})
    return operation
  }

  return {
    records, storageError, retry: () => { setStorageError(false); setLoadAttempt(value => value + 1) },
    selected, setSelected, draft, setDraft, picking, setPicking, save,
  }
}

const Journal = createContext<ReturnType<typeof useJournalState> | null>(null)
export function JournalProvider({ children }: { children: ReactNode }) {
  const value = useJournalState()
  return <Journal.Provider value={value}>{children}</Journal.Provider>
}
export function useJournal() {
  const value = useContext(Journal)
  if (!value) throw new Error('Av günlüğü açılamadı')
  return value
}
