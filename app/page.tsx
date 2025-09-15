'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';
import { v4 as uuid } from 'uuid';
import { distanceMeters } from '../lib/haversine';
import { seedCheckpoints } from '../lib/checkpoints';
import JoinForm from '../components/JoinForm';
import StatusInfo from '../components/StatusInfo';
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
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | number | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);
  const [teamPositions, setTeamPositions] = useState<any[]>([]);

  // Hole Einstellung für Standortanzeige
  const [showAllPositions, setShowAllPositions] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('showallpositions').single();
      if (data && typeof data.showallpositions === 'boolean') setShowAllPositions(data.showallpositions);
    })();
  }, []);

  useEffect(() => {
    setIsClient(true);
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = uuid();
      localStorage.setItem('playerId', id);
    }
    setPlayerId(id);
    // TeamCode, Teamname und Spielername aus Local Storage auslesen
    const storedCode = localStorage.getItem('teamCode') || '';
    const storedTeam = localStorage.getItem('teamName') || '';
    const storedName = localStorage.getItem('playerName') || '';
    setTeamCode(storedCode);
    setTeam(storedTeam);
    setName(storedName);
    setMode(storedCode ? 'join' : 'create');
    // Validierung: Existieren Team und Spieler?
    if (storedCode && storedName) {
      (async () => {
        const { data: teamData } = await supabase.from('teams').select('*').eq('code', storedCode);
        if (teamData && teamData.length > 0) {
          const teamId = teamData[0].id;
          const { data: memberData } = await supabase.from('team_members').select('*').eq('team_id', teamId).eq('name', storedName);
          if (memberData && memberData.length > 0) {
            setConsent(true); // Map direkt anzeigen
            setTeam(teamData[0].name);
            setTeamCode(teamData[0].code);
            setName(storedName);
            return;
          }
        }
        setConsent(false); // Formular anzeigen
      })();
    }
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

  useEffect(() => {
    if (!consent) return;
    setLoadingTasks(true);
    supabase.from('tasks').select('*').order('title').then(({ data, error }) => {
      if (error) setErrorTasks(error.message);
      else setTasks(data || []);
      setLoadingTasks(false);
    });
  }, [consent]);

  useEffect(() => {
    if (!consent || !pos || !teamCode || !playerId) return;
    (async () => {
      // Hole Einstellung für Standortanzeige
      const { data: settingsData } = await supabase.from('settings').select('showallpositions').single();
      const showAll = !!(settingsData && settingsData.showallpositions);
      let positionsData = [];
      let membersData = [];
      if (showAll) {
        // Alle Positionen und Mitglieder
        const { data: posAll } = await supabase.from('positions').select('*');
        const { data: memAll } = await supabase.from('team_members').select('*');
        positionsData = posAll || [];
        membersData = memAll || [];
      } else {
        // Nur Team-Positionen und Mitglieder
        const { data: teamData } = await supabase.from('teams').select('id').eq('code', teamCode);
        if (!teamData || teamData.length === 0) return;
        const teamId = teamData[0].id;
        await supabase.from('positions').upsert({
          player_id: playerId,
          team_id: teamId,
          lat: pos.lat,
          lng: pos.lng,
          acc: pos.acc ?? null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'player_id' });
        const { data: posTeam } = await supabase.from('positions').select('*').eq('team_id', teamId);
        const { data: memTeam } = await supabase.from('team_members').select('*').eq('team_id', teamId);
        positionsData = posTeam || [];
        membersData = memTeam || [];
      }
      // Mergen: Name zu Position
      const merged = (positionsData || []).map(pos => {
        const member = (membersData || []).find(m => m.player_id === pos.player_id);
        return { ...pos, name: member ? member.name : undefined };
      });
      setTeamPositions(merged);
    })();
  }, [pos, consent, teamCode, playerId]);

  useEffect(() => {
    if (!consent || !teamCode) return;
    let interval: NodeJS.Timeout | null = null;
    (async () => {
      // Hole Einstellung für Standortanzeige
      const { data: settingsData } = await supabase.from('settings').select('showallpositions').single();
      const showAll = !!(settingsData && settingsData.showallpositions);
      let positionsData = [];
      let membersData = [];
      if (showAll) {
        // Alle Positionen und Mitglieder
        const { data: posAll } = await supabase.from('positions').select('*');
        const { data: memAll } = await supabase.from('team_members').select('*');
        positionsData = posAll || [];
        membersData = memAll || [];
      } else {
        // Nur Team-Positionen und Mitglieder
        const { data: teamData } = await supabase.from('teams').select('id').eq('code', teamCode);
        if (!teamData || teamData.length === 0) return;
        const teamId = teamData[0].id;
        const { data: posTeam } = await supabase.from('positions').select('*').eq('team_id', teamId);
        const { data: memTeam } = await supabase.from('team_members').select('*').eq('team_id', teamId);
        positionsData = posTeam || [];
        membersData = memTeam || [];
      }
      const merged = (positionsData || []).map(pos => {
        const member = (membersData || []).find(m => m.player_id === pos.player_id);
        return { ...pos, name: member ? member.name : undefined };
      });
      setTeamPositions(merged);
      // Intervall für Live-Update
      interval = setInterval(async () => {
        const { data: settingsData } = await supabase.from('settings').select('showallpositions').single();
        const showAll = !!(settingsData && settingsData.showallpositions);
        let positionsData = [];
        let membersData = [];
        if (showAll) {
          const { data: posAll } = await supabase.from('positions').select('*');
          const { data: memAll } = await supabase.from('team_members').select('*');
          positionsData = posAll || [];
          membersData = memAll || [];
        } else {
          const { data: teamData } = await supabase.from('teams').select('id').eq('code', teamCode);
          if (!teamData || teamData.length === 0) return;
          const teamId = teamData[0].id;
          const { data: posTeam } = await supabase.from('positions').select('*').eq('team_id', teamId);
          const { data: memTeam } = await supabase.from('team_members').select('*').eq('team_id', teamId);
          positionsData = posTeam || [];
          membersData = memTeam || [];
        }
        const merged = (positionsData || []).map(pos => {
          const member = (membersData || []).find(m => m.player_id === pos.player_id);
          return { ...pos, name: member ? member.name : undefined };
        });
        setTeamPositions(merged);
      }, 3000);
    })();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [consent, teamCode]);

  // Status-Flag für einmaliges Speichern der Position nach Beitritt
  const [positionSaved, setPositionSaved] = useState(false);

  useEffect(() => {
    if (consent && pos && teamCode && playerId && !positionSaved) {
      (async () => {
        // Hole TeamId
        const { data: teamData } = await supabase.from('teams').select('id').eq('code', teamCode);
        if (teamData && teamData.length > 0) {
          const teamId = teamData[0].id;
          await supabase.from('positions').upsert({
            player_id: playerId,
            team_id: teamId,
            lat: pos.lat,
            lng: pos.lng,
            acc: pos.acc ?? null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'player_id' });
          setPositionSaved(true);
        }
      })();
    }
  }, [consent, pos, teamCode, playerId, positionSaved]);

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
    let teamId = '';
    if (mode === 'create') {
      // Team erstellen
      const { data: teamData, error: teamError } = await supabase.from('teams').insert({ name: team, code: code }).select();
      if (teamError || !teamData || teamData.length === 0) {
        alert('Fehler beim Erstellen des Teams!');
        return;
      }
      teamId = teamData[0].id;
      // TeamCode, Name und Spielername im Local Storage speichern
      localStorage.setItem('teamCode', code);
      localStorage.setItem('teamName', team);
      localStorage.setItem('playerName', name);
      // Team-Mitglied speichern
      await supabase.from('team_members').insert({ team_id: teamId, player_id: playerId, name });
      // Position direkt speichern, falls vorhanden
      if (pos) {
        await supabase.from('positions').upsert({
          player_id: playerId,
          team_id: teamId,
          lat: pos.lat,
          lng: pos.lng,
          acc: pos.acc ?? null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'player_id' });
      }
      setConsent(true);
      setTeamCode(code);
      setTeam(team);
      setName(name);
      return;
    } else {
      // Team suchen
      const { data: teamData, error: teamError } = await supabase.from('teams').select('*').eq('code', code);
      if (teamError || !teamData || teamData.length === 0) {
        alert('Team nicht gefunden!');
        return;
      }
      teamId = teamData[0].id;
      // Prüfen ob Name schon vergeben ist
      const { data: memberData, error: memberError } = await supabase.from('team_members').select('*').eq('team_id', teamId).eq('name', name);
      if (memberError) {
        alert('Fehler bei der Spielerprüfung!');
        return;
      }
      if (memberData && memberData.length > 0) {
        alert('Der Name ist in diesem Team bereits vergeben!');
        return;
      }
      // TeamCode, Name und Spielername im Local Storage speichern
      localStorage.setItem('teamCode', code);
      localStorage.setItem('teamName', teamData[0].name);
      localStorage.setItem('playerName', name);
      // Team-Mitglied speichern
      await supabase.from('team_members').insert({ team_id: teamId, player_id: playerId, name });
      // Position direkt speichern, falls vorhanden
      if (pos) {
        await supabase.from('positions').upsert({
          player_id: playerId,
          team_id: teamId,
          lat: pos.lat,
          lng: pos.lng,
          acc: pos.acc ?? null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'player_id' });
      }
      setConsent(true);
      setTeamCode(code);
      setTeam(teamData[0].name);
      setName(name);
      return;
    }
  }

  function handleLogout() {
    setConsent(false);
    setTeam('');
    setName('');
    setTeamCode('');
    localStorage.removeItem('teamCode');
    localStorage.removeItem('teamName');
    localStorage.removeItem('playerName');
    localStorage.removeItem('playerId');
  }

  function handleSelectCheckpoint(id: string | number) {
    setSelectedCheckpointId(id);
    setShowTasksModal(false);
  }

  if (!isClient) return null;

  // Hilfsfunktion für zufällige Farben
  function getRandomColor(seed: string) {
    // Einfache Hash-Funktion für den Seed (TeamId)
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generiere Farbwert
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
  }

  // Teamfarben zuweisen (nur einmal pro Team, randomisiert nach TeamId)
  const teamColorMap: Record<string, string> = {};
  const uniqueTeamIds = Array.from(new Set(teamPositions.map(p => p.team_id)));
  uniqueTeamIds.forEach((teamId) => {
    teamColorMap[teamId] = getRandomColor(teamId);
  });
  const teamPositionsWithColor = teamPositions.map(p => ({
    ...p,
    color: teamColorMap[p.team_id] || "#888"
  }));

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {consent && (
        <TopNav
          team={team}
          name={name}
          teamCode={teamCode}
          onLogout={handleLogout}
          showTasksModal={showTasksModal}
          setShowTasksModal={setShowTasksModal}
          onSelectCheckpoint={handleSelectCheckpoint}
        />
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
          <Map
            pos={pos}
            checkpoints={tasks}
            selectedCheckpointId={selectedCheckpointId}
            setSelectedCheckpointId={setSelectedCheckpointId}
            teamPositions={teamPositionsWithColor}
          />
          <div className="fixed bottom-0 left-0 w-full z-20 p-4 pointer-events-none">
            <StatusInfo status={status} />
          </div>
        </>
      )}
    </main>
  );
}
