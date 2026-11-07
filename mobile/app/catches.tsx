import { useState } from 'react'
import { FlatList, ScrollView, Text, View } from 'react-native'
import { useJournal } from '../src/store'
import { Button, CatchCard, styles } from '../src/ui'

export default function CatchesScreen() {
  const { records } = useJournal()
  const [filter, setFilter] = useState('')
  const catches = records?.catches.filter(entry => !filter || entry.speciesId === filter)
    .sort((a, b) => b.date.localeCompare(a.date)) ?? []
  const filters = records?.species.filter(fish => records.catches.some(entry => entry.speciesId === fish.id))

  return <FlatList style={styles.screen} contentContainerStyle={styles.padded} data={catches} keyExtractor={entry => entry.id}
    ListHeaderComponent={<View style={{ gap: 12 }}>
      <Text accessibilityRole="header" style={styles.title}>Tutulan Balıklar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.row}>
        <Button label="Tümü" active={!filter} onPress={() => setFilter('')} />
        {filters?.map(fish => <Button key={fish.id} label={fish.name} active={filter === fish.id} onPress={() => setFilter(fish.id)} />)}
      </ScrollView>
      <Text accessibilityLiveRegion="polite" style={styles.muted}>{catches.length} av kaydı</Text>
    </View>}
    ListEmptyComponent={<Text style={styles.text}>Henüz av kaydı yok.</Text>}
    renderItem={({ item }) => <CatchCard entry={item} fish={records?.species.find(fish => fish.id === item.speciesId)?.name ?? 'Balık'}>
      <Text style={styles.text}>{records?.spots.find(spot => spot.id === item.spotId)?.name ?? 'Mera'}</Text>
    </CatchCard>}
  />
}
