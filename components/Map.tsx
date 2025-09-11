'use client';
import {MapContainer, TileLayer, Marker, Circle, Popup, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.scss';
import L from 'leaflet';
import {useEffect} from 'react';

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
const checkpointIcon = L.icon({
  iconUrl: '/file.svg', // Beispiel-Icon für ausgewählten Checkpoint
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
const defaultCheckpointIcon = L.icon({
  iconUrl: '/globe.svg', // Standard-Icon für Checkpoints
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function CenterMapOnCheckpoint({ selectedCheckpoint, zoom = 16 }: { selectedCheckpoint: Checkpoint | null, zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCheckpoint) {
      map.setView([selectedCheckpoint.lat, selectedCheckpoint.lng], zoom, { animate: true });
    }
  }, [selectedCheckpoint, zoom, map]);
  return null;
}

export default function Map({pos, checkpoints, selectedCheckpointId, setSelectedCheckpointId}: {
  pos: Position | null;
  checkpoints: Checkpoint[];
  selectedCheckpointId?: string | number | null;
  setSelectedCheckpointId?: (id: string | number | null) => void;
}) {
  const center: [number, number] = pos ? [pos.lat, pos.lng] : [49.4286974, 1.3733666];
  const selectedCheckpoint = checkpoints.find(cp => cp.id === selectedCheckpointId) || null;
  return (
    <div className={styles.mapContainer}>
      <MapContainer {...({center, zoom: 16, style: {height: '100%', width: '100%'}} as MyMapContainerProps)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <CenterMapOnCheckpoint selectedCheckpoint={selectedCheckpoint} zoom={16} />
        {pos && (
          <Marker position={center} icon={playerIcon}>
            <Popup>Du bist hier</Popup>
          </Marker>
        )}
        {checkpoints.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={selectedCheckpointId === c.id ? checkpointIcon : defaultCheckpointIcon}
            eventHandlers={{ click: () => setSelectedCheckpointId && setSelectedCheckpointId(c.id) }}
          >
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
