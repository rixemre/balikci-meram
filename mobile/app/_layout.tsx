import { Tabs, useRouter } from 'expo-router'
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CatchForm from '../src/CatchForm'
import { JournalProvider, useJournal } from '../src/store'
import { Button, dark, line, styles } from '../src/ui'

function Navigation() {
  const router = useRouter()
  const { records, storageError, retry, selected, draft, setDraft, setPicking } = useJournal()

  function pick(intent: 'spot' | 'catch') {
    setDraft(undefined)
    setPicking(intent)
    router.navigate('/')
  }

  if (!records) return <SafeAreaView style={[styles.screen, local.loading]}>
    {storageError ? <>
      <Text accessibilityRole="alert" style={styles.error}>Av günlüğü açılamadı.</Text>
      <Button label="Yeniden dene" onPress={retry} />
    </> : <><ActivityIndicator color={dark} /><Text style={styles.text}>Av günlüğü açılıyor…</Text></>}
  </SafeAreaView>

  return <SafeAreaView style={local.frame}>
    <StatusBar barStyle="light-content" />
    <View style={local.brand}><Text accessibilityRole="header" style={local.brandText}>⚓  Balıkçı Meram</Text></View>
    <Tabs screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => <View style={local.dock}>
        <View style={local.buttons}>
          <Button grow kind="primary" label="+ Balık Kaydet" onPress={() => {
            if (selected) { setPicking(undefined); setDraft({ spot: selected, intent: 'catch' }) }
            else pick('catch')
          }} />
          <Button grow label="Mera İşaretle" onPress={() => pick('spot')} />
        </View>
        <View style={local.buttons} accessibilityRole="tablist">
          {state.routes.filter(route => route.name === 'index' || route.name === 'catches').map(route => <Button grow role="tab" key={route.key}
            label={route.name === 'index' ? 'Harita' : 'Tutulan Balıklar'}
            active={route.key === state.routes[state.index]?.key} kind={route.key === state.routes[state.index]?.key ? 'dark' : 'plain'}
            onPress={() => { if (route.name !== 'index') setPicking(undefined); navigation.navigate(route.name) }} />)}
        </View>
      </View>}>
      <Tabs.Screen name="index" options={{ title: 'Harita' }} />
      <Tabs.Screen name="catches" options={{ title: 'Tutulan Balıklar' }} />
    </Tabs>
    {draft && <CatchForm draft={draft} onChangeLocation={() => pick(draft.intent)} />}
  </SafeAreaView>
}

export default function Layout() {
  return <JournalProvider><Navigation /></JournalProvider>
}

const local = StyleSheet.create({
  frame: { flex: 1, backgroundColor: dark },
  brand: { paddingHorizontal: 14, paddingVertical: 9, backgroundColor: dark },
  brandText: { fontSize: 24, fontWeight: '900', color: 'white' },
  loading: { justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
  dock: { borderTopWidth: 1, borderTopColor: line, padding: 8, gap: 7, backgroundColor: 'white' },
  buttons: { flexDirection: 'row', gap: 7 },
})
