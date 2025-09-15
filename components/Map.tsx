'use client';
import {MapContainer, TileLayer, Marker, Circle, Popup, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.scss';
import L from 'leaflet';
import {useEffect, useRef} from 'react';

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
  color?: string; // Teamfarbe
}

function PlayerMarker({ position, color, popup }: { position: [number, number]; color: string; popup?: string }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  useEffect(() => {
    if (!map) return;
    // Erstelle einen HTML-Div als Icon
    const icon = L.divIcon({
      className: styles.playerDot,
      html: `<div style='background:${color};width:50px;height:30px;border-radius:10%;border:2px solid #fff;box-shadow:0 0 4px #333;'></div>`
    });
    // Marker erzeugen
    const marker = L.marker(position, { icon });
    if (popup) marker.bindPopup(popup);
    marker.addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
    };
  }, [map, position[0], position[1], color, popup]);
  return null;
}

// Hilfsfunktion: Marker-Spread für gleiche Positionen
function spreadPositions(positions: TeamPosition[], spreadRadius = 0.00008) {
  // Gruppiere nach Position
  const grouped: Record<string, TeamPosition[]> = {};
  positions.forEach(p => {
    const key = `${p.lat.toFixed(5)}_${p.lng.toFixed(5)}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  // Versetze Marker
  let result: TeamPosition[] = [];
  Object.values(grouped).forEach(group => {
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      group.forEach((p, idx) => {
        const angle = (2 * Math.PI * idx) / group.length;
        const latOffset = Math.sin(angle) * spreadRadius;
        const lngOffset = Math.cos(angle) * spreadRadius;
        result.push({ ...p, lat: p.lat + latOffset, lng: p.lng + lngOffset });
      });
    }
  });
  return result;
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

  // Spread-Logik auf die bereits gefilterten teamPositions anwenden
  const spreadPlayers = spreadPositions(teamPositions);

  return (
    <div className={styles.mapContainer}>
      <MapContainer {...({center, zoom: 16, style: {height: '100%', width: '100%'}} as MyMapContainerProps)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <CenterMapOnCheckpoint selectedCheckpoint={selectedCheckpoint} zoom={16} />
        {/* Eigener Spieler als blauer Marker */}
        {pos && (
          <PlayerMarker position={center} color="#2563eb" popup="Du bist hier" />
        )}
        {/* Andere Spieler */}
        {spreadPlayers.map((tp, index) => (
          <PlayerMarker
            key={tp.player_id}
            position={[tp.lat, tp.lng]}
            color={tp.color || "#888"}
            popup={tp.name || tp.player_id}
          />
        ))}
        {/* Checkpoints weiterhin mit Standard-Marker */}
        {checkpoints.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
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
