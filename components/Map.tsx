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

interface TeamPosition {
  player_id: string;
  lat: number;
  lng: number;
  name?: string;
}

const playerColors = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
  '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];
function getColorForPlayer(playerId: string, idx: number) {
  // Nutze Index oder Hash für Farbe
  return playerColors[idx % playerColors.length];
}
function createColoredIcon(color: string) {
  // SVG mit Kreis in Wunschfarbe
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='14' fill='${color}' stroke='black' stroke-width='2'/></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function Map({pos, checkpoints, selectedCheckpointId, setSelectedCheckpointId, teamPositions = []}: {
  pos: Position | null;
  checkpoints: Checkpoint[];
  selectedCheckpointId?: string | number | null;
  setSelectedCheckpointId?: (id: string | number | null) => void;
  teamPositions?: TeamPosition[];
}) {
  const center: [number, number] = pos ? [pos.lat, pos.lng] : [49.4286974, 1.3733666];
  const selectedCheckpoint = checkpoints.find(cp => cp.id === selectedCheckpointId) || null;
  // Eigene playerId aus LocalStorage holen
  const myPlayerId = typeof window !== 'undefined' ? window.localStorage.getItem('playerId') : '';
  // Nur andere Spieler anzeigen
  const otherPlayers = teamPositions.filter(tp => tp.player_id !== myPlayerId);
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
        {/* Teammitglieder anzeigen */}
        {otherPlayers.map((tp, idx) => (
          <Marker key={tp.player_id} position={[tp.lat, tp.lng]} icon={createColoredIcon(getColorForPlayer(tp.player_id, idx))}>
            <Popup>{tp.name || tp.player_id}</Popup>
          </Marker>
        ))}
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
