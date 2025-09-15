"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  solution: string;
  radius: number;
}

export default function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Task>>({});
  const [editId, setEditId] = useState<string | null>(null);

  // Einstellung für Standortanzeige
  const [showAllPositions, setShowAllPositions] = useState<boolean>(false);
  useEffect(() => {
    // Hole Einstellung aus DB (z.B. settings-Tabelle)
    (async () => {
      const { data } = await supabase.from('settings').select('showallpositions').single();
      if (data && typeof data.showallpositions === 'boolean') setShowAllPositions(data.showallpositions);
    })();
  }, []);
  async function handleTogglePositions() {
    const newValue = !showAllPositions;
    setShowAllPositions(newValue);
    // Prüfe, ob Eintrag existiert
    const { data: existing, error: selectError } = await supabase.from('settings').select('id').eq('id', 1).single();
    if (selectError) {
      console.error('Fehler beim Auslesen des Settings-Eintrags:', selectError);
    }
    if (!existing) {
      // Eintrag anlegen
      const { error: insertError } = await supabase.from('settings').insert({ id: 1, showallpositions: newValue });
      if (insertError) {
        alert('Fehler beim Anlegen des Settings-Eintrags!');
        console.error(insertError);
      }
    } else {
      // Eintrag aktualisieren
      const { error: updateError } = await supabase.from('settings').update({ showallpositions: newValue }).eq('id', 1);
      if (updateError) {
        alert('Fehler beim Speichern der Einstellung!');
        console.error(updateError);
      }
    }
    // Einstellung erneut auslesen
    const { data, error: reloadError } = await supabase.from('settings').select('showallpositions').eq('id', 1).single();
    if (reloadError) {
      console.error('Fehler beim erneuten Auslesen:', reloadError);
    }
    if (data && typeof data.showallpositions === 'boolean') setShowAllPositions(data.showallpositions);
  }

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').order('title');
    if (!error && data) setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleSave() {
    if (!form.title || !form.lat || !form.lng || !form.radius) return;
    if (editId) {
      await supabase.from('tasks').update(form).eq('id', editId);
    } else {
      await supabase.from('tasks').insert([{ ...form }]);
    }
    setForm({});
    setEditId(null);
    fetchTasks();
  }

  async function handleDelete(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  }

  function handleEdit(task: Task) {
    setForm(task);
    setEditId(task.id);
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(30,41,59,0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Schnitzeljagd Aufgaben verwalten</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: 8 }}>Standortanzeige:</label>
        <button onClick={handleTogglePositions} style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #0070f3', background: showAllPositions ? '#e1f5fe' : '#fff', color: '#0070f3' }}>
          {showAllPositions ? 'Teamunabhängig (alle sehen sich)' : 'Teamintern (nur Teammitglieder sichtbar)'}
        </button>
      </div>
      {loading ? <div>Lade Aufgaben...</div> : (
        <ul style={{ marginBottom: '2rem' }}>
          {tasks.map(task => (
            <li key={task.id} style={{ marginBottom: 12, padding: 8, borderBottom: '1px solid #eee' }}>
              <b>{task.title}</b> <span style={{ color: '#888' }}>({task.lat}, {task.lng})</span><br/>
              <span>{task.description}</span><br/>
              <span>Lösung: <b>{task.solution}</b></span><br/>
              <span>Radius: {task.radius}m</span><br/>
              <button onClick={() => handleEdit(task)} style={{ marginRight: 8 }}>Bearbeiten</button>
              <button onClick={() => handleDelete(task.id)} style={{ color: 'red' }}>Löschen</button>
            </li>
          ))}
        </ul>
      )}
      <h3>{editId ? 'Aufgabe bearbeiten' : 'Neue Aufgabe hinzufügen'}</h3>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input placeholder="Titel" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <textarea placeholder="Beschreibung" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <input type="number" placeholder="Latitude" value={form.lat || ''} onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))} required />
        <input type="number" placeholder="Longitude" value={form.lng || ''} onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))} required />
        <input placeholder="Lösung" value={form.solution || ''} onChange={e => setForm(f => ({ ...f, solution: e.target.value }))} />
        <input type="number" placeholder="Radius (Meter)" value={form.radius || ''} onChange={e => setForm(f => ({ ...f, radius: Number(e.target.value) }))} required />
        <button type="submit" style={{ marginTop: 12 }}>{editId ? 'Speichern' : 'Hinzufügen'}</button>
        {editId && <button type="button" onClick={() => { setForm({}); setEditId(null); }}>Abbrechen</button>}
      </form>
    </div>
  );
}
