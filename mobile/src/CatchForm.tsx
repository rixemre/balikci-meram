import { File, Paths } from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { useRef, useState } from 'react'
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type Draft, useJournal } from './store'
import { Button, ink, line, paper, styles } from './ui'

const presets = [['now', 'Şu An'], ['morning', 'Sabah Suyu'], ['evening', 'Akşam Suyu']] as const
type Preset = typeof presets[number][0]

function catchDate(time: Preset) {
  const date = new Date()
  if (time !== 'now') {
    date.setHours(time === 'morning' ? 6 : 18, 0, 0, 0)
    if (date > new Date()) date.setDate(date.getDate() - 1)
  }
  return date.toISOString()
}

export default function CatchForm({ draft, onChangeLocation }: { draft: Draft; onChangeLocation: () => void }) {
  const { records, setDraft, save } = useJournal()
  const [name, setName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [time, setTime] = useState<Preset>('now')
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const lock = useRef(false)
  const marking = draft.intent === 'spot'
  const catalog = records?.species ?? []

  function close() {
    if (!lock.current) setDraft(undefined)
  }

  async function choosePhoto(camera: boolean) {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
        setError('Kamera izni verilmedi. Galeriden bir fotoğraf seçebilirsin.')
        return
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: .65, allowsMultipleSelection: false }
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options)
      if (!result.canceled && result.assets[0]) setPhoto(result.assets[0])
    } catch {
      setError('Fotoğraf açılamadı. Yeniden dene veya fotoğrafsız kaydet.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function submit() {
    if (lock.current || (!marking && !speciesId)) return
    lock.current = true
    setBusy(true)
    setError('')
    let copy: File | undefined
    try {
      if (!marking && photo) {
        const ext = photo.uri.match(/\.(jpg|jpeg|png|webp|heic|heif|gif)(?:$|\?)/i)?.[1] ?? 'jpg'
        copy = new File(Paths.document, `av-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`)
        new File(photo.uri).copy(copy)
      }
      await save(draft, name, marking ? undefined : { speciesId, date: catchDate(time), photo: copy?.name })
    } catch {
      try { if (copy?.exists) copy.delete() } catch { /* Kayıt hatasını göster. */ }
      setError('Kayıt tamamlanamadı. Fotoğrafı kaldırıp tekrar deneyebilirsin.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  return <Modal visible animationType="slide" onRequestClose={close}>
    <SafeAreaView style={styles.screen} accessibilityViewIsModal>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={local.heading}>
          <Text accessibilityRole="header" style={[styles.title, local.grow]}>{marking ? 'Mera İşaretle' : 'Balık Kaydet'}</Text>
          <Button label="Kapat" onPress={close} disabled={busy} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.padded}>
          <View style={styles.card}>
            <Text style={styles.subtitle}>{draft.spot?.name ?? 'Yeni mera'}</Text>
            <Text style={styles.muted}>{draft.spot?.district ?? (draft.point ? `${draft.point.latitude.toFixed(5)}, ${draft.point.longitude.toFixed(5)}` : '')}</Text>
            <Button label="Konumu değiştir" onPress={onChangeLocation} disabled={busy} />
            {!draft.spot && <TextInput accessibilityLabel="Mera adı, isteğe bağlı" value={name} onChangeText={setName}
              style={local.input} placeholder="Mera adı (isteğe bağlı)" placeholderTextColor="#45635a" maxLength={80} />}
          </View>
          {!marking && <>
            <Text accessibilityRole="header" style={styles.subtitle}>Hangi balığı tuttun?</Text>
            <View style={styles.row}>
              {catalog.slice(0, expanded ? catalog.length : 10).map(fish =>
                <View key={fish.id} style={local.choice}><Button label={`🐟  ${fish.name}`} active={speciesId === fish.id}
                  onPress={() => setSpeciesId(fish.id)} disabled={busy} /></View>)}
            </View>
            <Button label={expanded ? 'Daha az tür göster' : 'Diğer balık türleri'} onPress={() => setExpanded(value => !value)} disabled={busy} />
            <Text accessibilityRole="header" style={styles.subtitle}>Ne zaman?</Text>
            <View style={styles.row}>
              {presets.map(([value, label]) => <Button key={value} grow label={label} active={time === value}
                onPress={() => setTime(value)} disabled={busy} />)}
            </View>
            <Text style={styles.subtitle}>Fotoğraf (isteğe bağlı)</Text>
            <View style={styles.row}>
              <Button grow label="Fotoğraf Çek" onPress={() => void choosePhoto(true)} disabled={busy} />
              <Button grow label="Galeriden Seç" onPress={() => void choosePhoto(false)} disabled={busy} />
            </View>
            {photo && <>
              <Image source={{ uri: photo.uri }} accessibilityLabel="Av fotoğrafı önizlemesi" style={styles.image} />
              <Button label="Fotoğrafı kaldır" onPress={() => setPhoto(undefined)} disabled={busy} />
            </>}
          </>}
        </ScrollView>
        <View style={local.footer}>
          {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Button kind="primary" label={marking ? 'Merayı Kaydet' : 'Balığı Kaydet'} onPress={() => void submit()}
            disabled={busy || (!marking && !speciesId)} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>
}

const local = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomColor: line, borderBottomWidth: 1 },
  grow: { flex: 1 },
  input: { minHeight: 56, borderWidth: 1, borderColor: line, backgroundColor: paper, borderRadius: 10, color: ink, fontSize: 18, paddingHorizontal: 10 },
  choice: { flexBasis: '47%', flexGrow: 1 },
  footer: { borderTopColor: line, borderTopWidth: 1, padding: 12, gap: 8, backgroundColor: 'white' },
})
