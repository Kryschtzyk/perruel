'use client';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ pos, checkpoints }: { pos: any; checkpoints: any[] }) {
  const center = pos ? [pos.lat, pos.lng] : [49.38945, 1.32024];
  return (
    <div className="h-[60vh] w-full rounded overflow-hidden">
      <MapContainer center={center as any} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pos && (
          <Marker position={[pos.lat, pos.lng] as any}>
            <Popup>Du bist hier</Popup>
          </Marker>
        )}
        {checkpoints.map((c) => (
          <div key={c.id}>
            <Marker position={[c.lat, c.lng] as any}>
              <Popup>{c.name}</Popup>
            </Marker>
            <Circle center={[c.lat, c.lng] as any} radius={c.radius} />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}

