import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


// Fix default marker icons (needed when bundling)
const icon = new L.Icon({
iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41]
})


function ClickHandler({ onPick }){
useMapEvents({
click(e){ onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) }
})
return null
}


export default function MapPicker({ value, onChange }){
const center = value?.lat ? [value.lat, value.lng] : [23.8103, 90.4125] // Dhaka by default
return (
<div>
<MapContainer className="map" center={center} zoom={12} scrollWheelZoom>
<TileLayer
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
{value?.lat && <Marker position={center} icon={icon} />}
<ClickHandler onPick={onChange} />
</MapContainer>
<div className="mt-3 row">
<input className="input" placeholder="Latitude" value={value?.lat || ''} onChange={e=>onChange({ ...value, lat: parseFloat(e.target.value)||'' })} />
<input className="input" placeholder="Longitude" value={value?.lng || ''} onChange={e=>onChange({ ...value, lng: parseFloat(e.target.value)||'' })} />
</div>
<p className="mt-2" style={{color:'var(--muted)'}}>Click on the map to set the location. You can also manually edit coordinates.</p>
</div>
)
}