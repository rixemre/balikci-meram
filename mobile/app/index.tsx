import * as Location from 'expo-location'
import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, type Region } from 'react-native-maps'
import { type Point, type Spot, useJournal } from '../src/store'
import { Button, CatchCard, dark, styles } from '../src/ui'

const coast: Region = { latitude: 41.048, longitude: 29.023, latitudeDelta: .115, longitudeDelta: .085 }

export default function MapScreen() {
  const { records, selected, draft, setSelected, setDraft, picking, setPicking } = useJournal()
  const map = useRef<MapView>(null)
  const center = useRef<Region>(coast)
  const request = useRef(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useFocusEffect(useCallback(() => () => { request.current += 1; setLoading(false) }, []))

  function pick(point: Point) {
    request.current += 1
    setLoading(false)
    setError('')
    setDraft({ point, intent: picking ?? 'spot' })
    setPicking(undefined)
  }

  function select(spot: Spot) {
    request.current += 1
    setLoading(false)
    setError('')
    setSelected(spot)
    if (picking === 'catch') setDraft({ spot, intent: 'catch' })
    setPicking(undefined)
  }

  async function locate() {
    const id = ++request.current
    setLoading(true)
    setError('')
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (id !== request.current) return
      if (!permission.granted) {
        setError('Konum izni verilmedi. Haritadan bir yer seçebilirsin.')
        return
      }
      const { coords } = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error()), 12000) }),
      ])
      if (id !== request.current) return
      const point = { latitude: coords.latitude, longitude: coords.longitude }
      map.current?.animateToRegion({ ...point, latitudeDelta: .035, longitudeDelta: .035 })
      pick(point)
    } catch {
      if (id === request.current) setError('Konum alınamadı. Haritadan bir yer seçebilirsin.')
    } finally {
      clearTimeout(timer)
      if (id === request.current) setLoading(false)
    }
  }

  function zoom(factor: number) {
    const region = center.current
    map.current?.animateToRegion({
      ...region,
      latitudeDelta: Math.min(90, Math.max(.002, region.latitudeDelta * factor)),
      longitudeDelta: Math.min(120, Math.max(.002, region.longitudeDelta * factor)),
    }, 200)
  }

  const catches = records?.catches.filter(entry => entry.spotId === selected?.id)
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  return <View style={styles.screen}>
    <View style={local.controls}>
      {picking && <Text accessibilityRole="alert" style={styles.text}>Haritada bir yere veya mevcut bir meraya dokun.</Text>}
      <Button kind="dark" label={loading ? 'Konum aranıyor…' : '⌖  Bulunduğum Yeri İşaretle (GPS)'} onPress={() => void locate()} disabled={loading} />
      {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
    <View style={local.map}>
      <MapView ref={map} style={local.map} initialRegion={coast} rotateEnabled={false} pitchEnabled={false}
        onRegionChangeComplete={region => { center.current = region }}
        onPress={event => { if (event.nativeEvent.action !== 'marker-press') pick(event.nativeEvent.coordinate) }}>
        {records?.spots.map(spot => <Marker key={spot.id} coordinate={spot} title={spot.name}
          accessibilityLabel={spot.name} stopPropagation onPress={() => select(spot)}
          zIndex={selected?.id === spot.id ? 2 : 1}>
          <View collapsable={false} style={[local.pin, selected?.id === spot.id && local.pinSelected]}>
            <Text style={local.anchor}>{selected?.id === spot.id ? '★' : '⚓'}</Text>
          </View>
        </Marker>)}
        {draft?.point && <Marker coordinate={draft.point} title="Yeni mera" />}
      </MapView>
      <View style={local.zoom}>
        <Button label="+" accessibilityLabel="Yakınlaştır" onPress={() => zoom(.55)} />
        <Button label="−" accessibilityLabel="Uzaklaştır" onPress={() => zoom(1.8)} />
      </View>
    </View>
    {picking && <View style={local.controls}><Button label="Harita merkezini seç" onPress={() => pick(center.current)} /></View>}
    {selected && !picking && <ScrollView style={local.summary} contentContainerStyle={local.summaryContent}>
      <Text style={styles.subtitle}>{selected.name}</Text>
      <Text style={styles.muted}>{selected.district}</Text>
      {catches?.length ? catches.map(entry => <CatchCard key={entry.id} entry={entry}
        fish={records?.species.find(fish => fish.id === entry.speciesId)?.name ?? 'Balık'} />)
        : <Text style={styles.text}>Bu merada henüz av kaydı yok.</Text>}
    </ScrollView>}
  </View>
}

const local = StyleSheet.create({
  controls: { padding: 10, gap: 8 },
  map: { flex: 1, minHeight: 140 },
  zoom: { position: 'absolute', top: 10, right: 10, gap: 7 },
  summary: { flexGrow: 0, maxHeight: '32%', backgroundColor: '#fff' },
  summaryContent: { padding: 12, gap: 8 },
  pin: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: 'white', backgroundColor: dark, alignItems: 'center', justifyContent: 'center' },
  pinSelected: { backgroundColor: '#467238' },
  anchor: { fontSize: 26, color: 'white', fontWeight: '900' },
})
