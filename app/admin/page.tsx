'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [ok, setOk] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    const key = prompt('Admin-Passwort?');
    setOk(key === process.env.NEXT_PUBLIC_ADMIN_PASS);
  }, []);

  useEffect(() => {
    if (!ok) return;
    supabase
      .from('players')
      .select('*')
      .then(({ data }) => setPlayers(data || []));

    const ch = supabase
      .channel('pos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'positions' }, (payload) => {
        setPositions((prev) => [payload.new, ...prev].slice(0, 200));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [ok]);

  if (!ok) return <main className="p-4">Kein Zugriff.</main>;

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <section>
        <h2 className="font-semibold">Teilnehmer</h2>
        <ul className="list-disc pl-5">
          {players.map((p) => (
            <li key={p.id}>
              {p.team} – {p.name}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-semibold">Letzte Positionen (Live)</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto h-64">
{JSON.stringify(positions.slice(0, 20), null, 2)}
        </pre>
      </section>
    </main>
  );
}

