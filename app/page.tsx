'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';
import { v4 as uuid } from 'uuid';
import { distanceMeters } from '../lib/haversine';
import { seedCheckpoints } from '../lib/checkpoints';
import JoinForm from '../components/JoinForm';
import StatusInfo from '../components/StatusInfo';
import Cookies from 'js-cookie';
import TopNav from '../components/TopNav';

type Pos = { lat: number; lng: number; acc?: number };
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [team, setTeam] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [teamCode, setTeamCode] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [pos, setPos] = useState<Pos | null>(null);
  const [consent, setConsent] = useState(false);
  const [activeCp, setActiveCp] = useState(seedCheckpoints[0]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = uuid();
      localStorage.setItem('playerId', id);
    }
    setPlayerId(id);
    const code = Cookies.get('teamCode') || '';
    setTeamCode(code);
    setMode(code ? 'join' : 'create');
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

  function handleModeChange(newMode: 'create' | 'join') {
    setMode(newMode);
    if (newMode === 'create') {
      setTeamCode('');
      setTeam('');
    }
    if (newMode === 'join') {
      setTeam(''); // Teamname wird nicht benötigt
    }
  }

  async function handleJoin(mode: 'create' | 'join', team: string, name: string, code: string) {
    if (!name || (mode === 'create' && !team) || (mode === 'join' && !code)) {
      alert('Bitte alle Felder ausfüllen!');
      return;
    }
    await supabase.from('players').upsert({ id: playerId, team, name, team_code: code });
    setConsent(true);
    setTeamCode(code);
    Cookies.set('teamCode', code);
  }

  function handleLogout() {
    setConsent(false);
    setTeam('');
    setName('');
    setTeamCode('');
    Cookies.remove('teamCode');
    localStorage.removeItem('playerId');
  }

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {consent && (
        <TopNav team={team} name={name} teamCode={teamCode} onLogout={handleLogout} />
      )}
      {!consent ? (
        <JoinForm
          team={team}
          name={name}
          teamCode={teamCode}
          mode={mode}
          onTeamChange={setTeam}
          onNameChange={setName}
          onTeamCodeChange={setTeamCode}
          onModeChange={handleModeChange}
          onJoin={handleJoin}
        />
      ) : (
        <>
          <Map pos={pos} checkpoints={[activeCp]} />
          <div className="fixed bottom-0 left-0 w-full z-20 p-4 pointer-events-none">
            <StatusInfo status={status} />
          </div>
        </>
      )}
    </main>
  );
}
