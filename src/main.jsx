import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Anchor, ArrowUpRight, CalendarDays, Fish, Map as MapIcon, MapPin, Plus, Waves, X } from 'lucide-react'
import CoastMap from './CoastMap'
import CatchForm from './CatchForm'
import { exampleCatches, exampleSpots, fishById, formatDate, readRecords, saveRecords, species } from './records'
import './styles.css'

function CatchCard({ entry, spot, compact = false }) {
  const fish = fishById[entry.speciesId]
  return <article className={`catch-card ${compact ? 'compact' : ''}`}>
    {entry.photo && !compact && <img className="catch-photo" src={entry.photo} alt={`${fish.name} avı`} loading="lazy" />}
    <div className="catch-content">
      <div className={`fish-icon ${fish.tone}`}>{entry.photo && compact
        ? <img src={entry.photo} alt={`${fish.name} avı`} loading="lazy" /> : <Fish size={25} />}</div>
      <div className="catch-text"><h3>{fish.name}</h3>
        {!compact && <p><MapPin size={17} />{spot.name}</p>}
        <p><CalendarDays size={16} /><time dateTime={entry.date}>{formatDate(entry.date)}</time></p>
      </div>
      {!compact && entry.example && <span className="sample">Örnek</span>}
    </div>
  </article>
}

function App() {
  const [records, setRecords] = useState(readRecords)
  const latest = useRef(records)
  const [tab, setTab] = useState('map')
  const [selected, setSelected] = useState(exampleSpots[0])
  const [draft, setDraft] = useState(null)
  const [target, setTarget] = useState(null)
  const [mode, setMode] = useState(null)
  const [picking, setPicking] = useState(null)
  const [gpsPending, setGpsPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('')
  const gpsRequest = useRef(0)
  const spots = [...exampleSpots, ...records.spots]
  const catches = [...exampleCatches, ...records.catches].sort((a, b) => new Date(b.date) - new Date(a.date))
  const spotCatches = catches.filter(entry => entry.spotId === selected?.id)
  const recent = catches.filter(entry => !filter || entry.speciesId === filter)
  const location = draft ?? selected

  function cancelGps() {
    gpsRequest.current += 1
    setGpsPending(false)
  }

  function pick(point) {
    cancelGps()
    setDraft(point)
    setSelected(null)
    setMode(picking ?? 'spot')
    setPicking(null)
    setNotice('')
  }

  function select(spot) {
    cancelGps()
    setSelected(spot)
    setDraft(null)
    setNotice('')
    if (picking === 'catch') setMode('catch')
    setPicking(null)
  }

  function locate() {
    if (!navigator.geolocation) {
      setNotice('GPS kullanılamıyor. Haritadan bir konum seç.')
      return
    }
    const request = ++gpsRequest.current
    setGpsPending(true)
    setNotice('')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (gpsRequest.current !== request) return
      const point = { lat: coords.latitude, lng: coords.longitude }
      pick(point)
      setTarget(point)
    }, error => {
      if (gpsRequest.current !== request) return
      setGpsPending(false)
      setNotice(error.code === 1 ? 'Konum izni verilmedi. Haritadan bir konum seç.' : 'Konum alınamadı. Haritadan bir konum seç.')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 })
  }

  function startCatch() {
    setNotice('')
    if (location) setMode('catch')
    else {
      setTab('map')
      setPicking('catch')
    }
  }

  function changeTab(next) {
    cancelGps()
    setPicking(null)
    setNotice('')
    setTab(next)
  }

  function save({ location, name, speciesId, date, photo }) {
    const spot = location.id ? location : {
      ...location, id: crypto.randomUUID(), name: name || 'Yeni mera', district: 'Kendi meram'
    }
    const next = {
      spots: location.id ? latest.current.spots : [...latest.current.spots, spot],
      catches: speciesId ? [...latest.current.catches, {
        id: crypto.randomUUID(), spotId: spot.id, speciesId, date, photo
      }] : latest.current.catches
    }
    saveRecords(next)
    latest.current = next
    setRecords(next)
    setSelected(spot)
    setDraft(null)
    setMode(null)
    setNotice(speciesId ? 'Balık kaydedildi.' : 'Mera kaydedildi.')
    if (speciesId) setFilter('')
  }

  return <div className="app">
    <header className="site-head"><div className="head-inner">
      <div className="brand"><div className="brand-icon"><Anchor size={28} /></div>
        <div><div className="brand-name">Balıkçı Meram</div><div className="brand-sub">Kıyı balıkçısının günlüğü</div></div></div>
      <div className="head-note"><Waves size={20} /> <span>Kıyıdan sofraya</span></div>
    </div></header>
    <main className={`page ${tab === 'map' ? 'map-page' : ''}`}>
      <div className="page-intro">
        <p className="eyebrow"><span></span>{tab === 'map' ? 'KIYI GÜNLÜĞÜ' : 'AV GÜNLÜĞÜ'}</p>
        <h1>{tab === 'map' ? 'Mera Haritası' : 'Tutulan Balıklar'}</h1>
        <p>{tab === 'map' ? 'Bir meraya dokun veya kıyıda yeni bir yer işaretle.' : 'Kendi kayıtların ve kıyıdan örnek avlar.'}</p>
      </div>
      {tab === 'map' ? <div className="map-layout">
        <CoastMap {...{ spots, selected, draft, target, picking, gpsPending }} onPick={pick} onSelect={select} onGps={locate} />
        <aside className="spot-panel" aria-label="Mera özeti">
          <div className="panel-kicker"><div className="spot-icon"><MapPin size={22} /></div><span>{selected ? 'SEÇİLİ MERA' : 'MERA DETAYI'}</span></div>
          <h2>{selected?.name ?? 'Bir mera seç'}</h2>
          <p className="district">{selected?.district ?? 'Konum seçmek için haritaya veya GPS düğmesine dokun.'}</p>
          {selected && <>
            <div className="panel-divider" />
            <div className="panel-section"><h3>Son avlar</h3><span>{spotCatches.length} kayıt</span></div>
            {spotCatches.length ? spotCatches.slice(0, 3).map(entry => <CatchCard key={entry.id} entry={entry} spot={selected} compact />)
              : <p className="district">Bu merada henüz av kaydı yok.</p>}
            <button className="panel-link" onClick={() => changeTab('feed')}>Tüm av kayıtları <ArrowUpRight size={19} /></button>
          </>}
        </aside>
      </div> : <>
        <div className="filters" aria-label="Balık türüne göre filtrele">
          <button aria-pressed={!filter} onClick={() => setFilter('')}>Tümü</button>
          {species.filter(fish => catches.some(entry => entry.speciesId === fish.id)).map(fish =>
            <button key={fish.id} aria-pressed={filter === fish.id} onClick={() => setFilter(fish.id)}>{fish.name}</button>)}
        </div>
        <p className="feed-count" aria-live="polite">{recent.length} av kaydı</p>
        <div className="feed-grid">{recent.map(entry => <CatchCard key={entry.id} entry={entry}
          spot={spots.find(spot => spot.id === entry.spotId)} />)}</div>
      </>}
    </main>
    <footer className="dock"><div className="dock-inner">
      {notice && <div className="notice" role="status">{notice}<button className="icon-button" aria-label="Bildirimi kapat" onClick={() => setNotice('')}><X size={19} /></button></div>}
      <div className="dock-actions">
        <button className="primary quick-add" onClick={startCatch}><Plus size={23} /> Balık Ekle</button>
        <button className="mark-action" onClick={() => {
          changeTab('map')
          setPicking('spot')
          window.scrollTo(0, 0)
        }}><MapPin size={22} /> Mera İşaretle</button>
      </div>
      <nav className="nav" aria-label="Ana gezinme">
        <button aria-current={tab === 'map' ? 'page' : undefined} onClick={() => changeTab('map')}><MapIcon size={23} /> Harita</button>
        <button aria-current={tab === 'feed' ? 'page' : undefined} onClick={() => changeTab('feed')}><Fish size={23} /> Tutulan Balıklar</button>
      </nav>
    </div></footer>
    {mode && location && <CatchForm location={location} mode={mode} onSave={save}
      onClose={() => { setMode(null); setDraft(null) }}
      onChangeLocation={() => { setMode(null); setDraft(null); setPicking(mode); setTab('map') }} />}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)


