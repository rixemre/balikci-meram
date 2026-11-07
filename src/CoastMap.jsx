import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { LocateFixed, Minus, Plus, MapPin, MapPinned, Crosshair } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const center = [41.048, 29.023]
const anchor = '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="2.5"/><path d="M12 8v13M8 12h8M3 15a9 6 0 0 0 18 0M3 15l3 2m15-2-3 2"/></svg>'
const icons = Object.fromEntries(['spot', 'active', 'draft'].map(kind => [kind, L.divIcon({
  className: `pin pin--${kind}`, html: `<span>${anchor}</span>`, iconSize: [52, 52], iconAnchor: [26, 44]
})]))

function MapTools({ onPick, onGps, gpsPending, target, picking }) {
  const map = useMap()
  useMapEvents({ click: ({ latlng }) => onPick({ lat: latlng.lat, lng: latlng.lng }) })

  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], Math.max(map.getZoom(), 13))
  }, [map, target])

  return <>
    <div className="map-tools" aria-label="Harita araçları">
      <button type="button" aria-label="Yakınlaştır" onClick={() => map.zoomIn()}><Plus /></button>
      <button type="button" aria-label="Uzaklaştır" onClick={() => map.zoomOut()}><Minus /></button>
      <button type="button" aria-label="Boğaz’a dön" onClick={() => map.setView(center, 13)}><MapPinned /></button>
    </div>
    <div className="map-actions">
      {picking && <button className="map-center" onClick={() => {
        const { lat, lng } = map.getCenter()
        onPick({ lat, lng })
      }}><Crosshair size={20} /> Harita merkezini seç</button>}
      <button className="gps" onClick={onGps} disabled={gpsPending}>
        <LocateFixed size={21} /> {gpsPending ? 'Konum aranıyor…' : 'Bulunduğum yeri işaretle (GPS)'}
      </button>
    </div>
  </>
}

export default function CoastMap({ spots, selected, draft, onSelect, onPick, onGps, gpsPending, target, picking }) {
  const [tileFailed, setTileFailed] = useState(false)
  return <section className="map-wrap" aria-label="Kıyı ve mera haritası">
    <MapContainer center={center} zoom={13} minZoom={4} maxZoom={19} zoomControl={false} attributionControl={false} doubleClickZoom={false} className="coast-map">
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        eventHandlers={{ tileerror: () => setTileFailed(true), load: ({ target }) => {
          if (Object.values(target._tiles).some(tile => tile.el.naturalWidth > 0)) setTileFailed(false)
        } }} />
      <MapTools {...{ onPick, onGps, gpsPending, target, picking }} />
      {spots.map(spot => <Marker key={spot.id} position={[spot.lat, spot.lng]}
        icon={icons[selected?.id === spot.id ? 'active' : 'spot']}
        zIndexOffset={selected?.id === spot.id ? 400 : 0}
        title={spot.name} alt={spot.name} eventHandlers={{ click: () => onSelect(spot) }} />)}
      {draft && <Marker position={[draft.lat, draft.lng]} icon={icons.draft} zIndexOffset={500} interactive={false} keyboard={false} />}
    </MapContainer>
    <div className="map-label"><MapPin size={18} /><span>{picking ? 'Haritadan bir konum seç' : 'Mera haritası'}</span></div>
    {picking && <div className="crosshair" aria-hidden="true"><Crosshair size={30} /></div>}
    {tileFailed && <p className="tile-error" role="status">Harita yüklenemedi. Bağlantını kontrol et.</p>}
    <a className="map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap katkıcıları</a>
  </section>
}
