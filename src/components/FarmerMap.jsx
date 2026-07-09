import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getCoordsForLocation } from '../lib/locationCoords'

// Fix default marker icon issue with bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FarmerMap({ listings }) {
  const center = [7.5833, -1.9333] // Techiman as default center

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
      <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => {
          const coords = getCoordsForLocation(listing.location)
          return (
            <Marker key={listing.id} position={[coords.lat, coords.lng]}>
              <Popup>
                <strong>{listing.crop_type}</strong>
                <br />
                {listing.location}
                <br />
                GH₵{listing.price_per_unit}/kg · {listing.quantity}kg available
                <br />
                {listing.users?.name && <span>Farmer: {listing.users.name}</span>}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default FarmerMap