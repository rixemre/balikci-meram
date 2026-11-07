import { Tabs } from 'expo-router'

export default function Layout() {
  return <Tabs screenOptions={{ headerTitle: 'Balıkçı Meram' }}>
    <Tabs.Screen name="index" options={{ title: 'Harita' }} />
    <Tabs.Screen name="catches" options={{ title: 'Tutulan Balıklar' }} />
  </Tabs>
}
