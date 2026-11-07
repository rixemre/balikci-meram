import { useEffect, useRef, useState } from 'react'
import { Camera, Check, Clock3, Fish, MapPin, Moon, Sunrise, X } from 'lucide-react'
import { encodePhoto, species } from './records'

export default function CatchForm({ location, mode, onClose, onSave, onChangeLocation }) {
  const dialog = useRef(null)
  const [selected, setSelected] = useState('')
  const [name, setName] = useState('')
  const [time, setTime] = useState('now')
  const [photo, setPhoto] = useState('')
  const [loadingPhoto, setLoadingPhoto] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const marking = mode === 'spot'

  useEffect(() => { dialog.current.showModal() }, [])

  async function upload(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setLoadingPhoto(true)
    try {
      setPhoto(await encodePhoto(file))
    } catch (failure) {
      setError(failure.message.startsWith('25 MB') ? failure.message : 'Fotoğraf açılamadı. Başka bir görsel seç.')
    } finally {
      setLoadingPhoto(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    if (!marking && !selected) return
    const date = new Date()
    if (time !== 'now') {
      date.setHours(time === 'morning' ? 6 : 18, 0, 0, 0)
      if (date > new Date()) date.setDate(date.getDate() - 1)
    }
    try {
      onSave({ location, name: name.trim(), speciesId: marking ? '' : selected, date: date.toISOString(), photo })
    } catch {
      setError('Tarayıcıya kaydedilemedi. Fotoğrafı kaldırıp yeniden dene.')
    }
  }

  return <dialog ref={dialog} className="catch-dialog" aria-labelledby="form-title"
    onCancel={event => { event.preventDefault(); onClose() }}>
    <form onSubmit={submit}>
      <div className="form-head">
        <div><p className="eyebrow">KIYI GÜNLÜĞÜ</p><h2 id="form-title">{marking ? 'Mera işaretle' : 'Balık ekle'}</h2></div>
        <button type="button" className="icon-button" aria-label="Kapat" onClick={onClose}><X /></button>
      </div>
      <div className="form-body">
        <div className="location-row"><MapPin size={22} /><div><strong>{location.name ?? 'Yeni mera'}</strong>
          <p>{location.district ?? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}</p></div>
          <button type="button" className="quiet" onClick={onChangeLocation}>Değiştir</button>
        </div>
        {!location.id && <label className="field">Mera adı <span>· İsteğe bağlı</span>
          <input value={name} onChange={event => setName(event.target.value)} maxLength={80} placeholder="Örn. Fenerin yanı" />
        </label>}
        {!marking && <>
          <fieldset><legend>Hangi balığı tuttun?</legend>
            <div className="species-grid">
              {species.slice(0, expanded ? species.length : 10).map(fish =>
                <button key={fish.id} type="button" className="species-choice" aria-pressed={selected === fish.id}
                  onClick={() => setSelected(fish.id)}>
                  <Fish className={`fish-color ${fish.tone}`} size={20} />{fish.name}
                </button>
              )}
            </div>
            <button type="button" className="quiet" aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}>{expanded ? 'Daha az tür göster' : 'Diğer balık türleri'}</button>
          </fieldset>
          <fieldset><legend>Ne zaman?</legend><div className="time-grid">
            {[['now', 'Şu an', Clock3], ['morning', 'Sabah suyu', Sunrise], ['evening', 'Akşam suyu', Moon]].map(([value, label, Icon]) =>
              <button type="button" key={value} aria-pressed={time === value} onClick={() => setTime(value)}><Icon size={18} />{label}</button>
            )}
          </div></fieldset>
          <label className="upload"><Camera size={23} /> <span>{loadingPhoto ? 'Fotoğraf hazırlanıyor…' : 'Fotoğraf çek / yükle'} <small>İsteğe bağlı</small></span>
            <input type="file" accept="image/*" onChange={upload} disabled={loadingPhoto} />
          </label>
          {photo && <div className="photo-preview"><img src={photo} alt="Av fotoğrafı önizlemesi" />
            <button type="button" className="icon-button" aria-label="Fotoğrafı kaldır" onClick={() => setPhoto('')}><X /></button></div>}
        </>}
        {error && <p role="alert" className="error">{error}</p>}
      </div>
      <div className="form-foot"><button className="primary" disabled={(!marking && !selected) || loadingPhoto}>
        <Check size={22} /> {marking ? 'Merayı kaydet' : 'Balığı kaydet'}
      </button></div>
    </form>
  </dialog>
}
