'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';
import { v4 as uuid } from 'uuid';
import { distanceMeters } from '../lib/haversine';
import { seedCheckpoints } from '../lib/checkpoints';
import JoinForm from '../components/JoinForm';
import StatusInfo from '../components/StatusInfo';

type Pos = { lat: number; lng: number; acc?: number };
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [playerId, setPlayerId] = useState<string>('');
  const [team, setTeam] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [pos, setPos] = useState<Pos | null>(null);
  const [consent, setConsent] = useState(false);
  const [activeCp, setActiveCp] = useState(seedCheckpoints[0]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = uuid();
      localStorage.setItem('playerId', id);
    }
    setPlayerId(id);
  }, []);

  useEffect(() => {
    if (!consent) return;
    const watch = navigator.geolocation.watchPosition(
      (p) => {
        const np = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
        setPos(np);
      },
      (err) => setStatus('⚠️ Standortfehler: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [consent]);

  useEffect(() => {
    if (!pos) return;
    const d = distanceMeters([pos.lat, pos.lng], [activeCp.lat, activeCp.lng]);
    if (d <= activeCp.radius + (pos.acc ?? 12)) {
      setStatus(`✅ Checkpoint erreicht: ${activeCp.name}`);
    } else {
      setStatus(`➡️ Nächster Punkt: ${activeCp.name} – ${Math.round(d)} m entfernt`);
    }
  }, [pos, activeCp]);

  async function join() {
    if (!team || !name) return alert('Team & Name eingeben');
    await supabase.from('players').upsert({ id: playerId, team, name });
    setConsent(true);
  }

  return (
    <main className="p-4 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Perruel Schnitzeljagd</h1>
      <p className="text-sm opacity-80">
        Mit Teilnahme stimmst du der Standortfreigabe zu (nur für das Event, wird danach gelöscht).
      </p>

      <JoinForm
        team={team}
        name={name}
        onTeamChange={setTeam}
        onNameChange={setName}
        onJoin={join}
      />

      <StatusInfo status={status} />
      <Map pos={pos} checkpoints={[activeCp]} />
    </main>
  );
}
