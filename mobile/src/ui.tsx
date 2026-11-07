import { File, Paths } from 'expo-file-system'
import type { ReactNode } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { displayDate, type Catch } from './store'

export const ink = '#102d2e'
export const muted = '#36534e'
export const dark = '#082d30'
export const lime = '#dcf4ae'
export const paper = '#f3f6ee'
export const line = '#aec0b5'
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: paper },
  padded: { padding: 16, gap: 12 },
  title: { fontSize: 30, fontWeight: '900', color: ink },
  subtitle: { fontSize: 22, fontWeight: '800', color: ink },
  text: { fontSize: 18, color: ink },
  muted: { fontSize: 18, color: muted },
  error: { fontSize: 18, color: '#852a15', fontWeight: '700' },
  card: { minHeight: 56, padding: 14, borderRadius: 15, borderWidth: 1, borderColor: line, backgroundColor: 'white', gap: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  image: { width: '100%', aspectRatio: 1.8, borderRadius: 10, backgroundColor: paper },
})

export function Button({ label, accessibilityLabel, role = 'button', onPress, kind = 'plain', active, disabled, grow }: {
  label: string; accessibilityLabel?: string; role?: 'button' | 'tab'; onPress: () => void; kind?: 'plain' | 'primary' | 'dark'; active?: boolean; disabled?: boolean; grow?: boolean
}) {
  return <Pressable accessibilityRole={role} accessibilityLabel={accessibilityLabel} accessibilityState={{ selected: active, disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [
      local.button, grow && local.grow, (kind === 'primary' || active) && local.primary,
      kind === 'dark' && local.dark, (pressed || disabled) && local.dim,
    ]}>
    <Text style={[local.buttonText, kind === 'dark' && local.white]}>{label}</Text>
  </Pressable>
}

export function CatchCard({ entry, fish, children }: { entry: Catch; fish: string; children?: ReactNode }) {
  const [label, icon] = [entry.example ? 'Örnek av' : '', '🐟']
  return <View style={styles.card}>
    {entry.photo && <Image source={{ uri: new File(Paths.document, entry.photo).uri }} style={styles.image} accessibilityLabel={`${fish} avı`} />}
    <Text style={styles.subtitle}>{icon}  {fish}</Text>
    {children}
    <Text style={styles.muted}>{displayDate(entry.date)}{label ? ` · ${label}` : ''}</Text>
  </View>
}

const local = StyleSheet.create({
  button: { minHeight: 56, minWidth: 56, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: line, borderRadius: 13, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '800', color: ink, textAlign: 'center' },
  grow: { flex: 1 },
  primary: { backgroundColor: lime, borderColor: '#466735' },
  dark: { backgroundColor: dark, borderColor: dark },
  white: { color: '#fff' },
  dim: { opacity: .7 },
})
