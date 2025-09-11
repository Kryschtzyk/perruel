'use client';
import {MapContainer, TileLayer, Marker, Circle, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.scss';
import L from 'leaflet';

interface Position {
  lat: number;
  lng: number;
}

interface Checkpoint {
  id: string | number;
  lat: number;
  lng: number;
  name: string;
  radius: number;
}

interface MyMapContainerProps {
  center: [number, number];
  zoom: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
interface MyCircleProps {
  center: [number, number];
  radius: number;
  key: string;
}

const playerIcon = L.icon({
  iconUrl: '/player.svg', // Neues Spieler-Icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function Map({pos, checkpoints}: { pos: Position | null; checkpoints: Checkpoint[] }) {
  const center: [number, number] = pos ? [pos.lat, pos.lng] : [49.38945, 1.32024];
  return (
    <div className={styles.mapContainer}>
      <MapContainer {...({center, zoom: 16, style: {height: '100%', width: '100%'}} as MyMapContainerProps)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {pos && (
          <Marker position={center} icon={playerIcon}>
            <Popup>Du bist hier</Popup>
          </Marker>
        )}
        {checkpoints.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]}>
            <Popup>{c.name}</Popup>
          </Marker>
        ))}
        {checkpoints.map((c) => (
          <Circle {...({key: c.id + '-circle', center: [c.lat, c.lng], radius: c.radius} as MyCircleProps)}/>
        ))}
      </MapContainer>
    </div>
  );
}
