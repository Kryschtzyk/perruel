import React, { useEffect, useState } from 'react';
import styles from './TopNav.module.scss';
import Button from './Button';
import Modal from './Modal';
import { supabase } from '../lib/supabase';

interface TopNavProps {
  team: string;
  name: string;
  teamCode: string;
  onLogout: () => void;
  showTasksModal: boolean;
  setShowTasksModal: (v: boolean) => void;
  onSelectCheckpoint: (id: string | number) => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  solution: string;
  radius: number;
}

interface TeamOverviewTeam {
  id: string;
  name: string;
  code: string;
  color: string;
  members: { name: string }[];
}

export default function TopNav({ team, name, teamCode, onLogout, showTasksModal, setShowTasksModal, onSelectCheckpoint }: TopNavProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState<string | null>(null);
  const [solutionInput, setSolutionInput] = useState<{[id: string]: string}>({});
  const [showTeamOverview, setShowTeamOverview] = useState(false);
  const [teamsOverview, setTeamsOverview] = useState<TeamOverviewTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errorTeams, setErrorTeams] = useState<string | null>(null);

  // Farb-Hash wie auf der Map
  function getRandomColor(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
  }

  useEffect(() => {
    if (!showTasksModal) return;
    setLoading(true);
    supabase.from('tasks').select('*').order('title').then(({ data, error }) => {
      if (error) setError(error.message);
      else setTasks(data || []);
      setLoading(false);
    });
  }, [showTasksModal]);

  useEffect(() => {
    if (!showTeamOverview) return;
    setLoadingTeams(true);
    Promise.all([
      supabase.from('teams').select('id, name, code'),
      supabase.from('team_members').select('team_id, name')
    ]).then(([teamsRes, membersRes]) => {
      if (teamsRes.error || membersRes.error) {
        setErrorTeams(teamsRes.error?.message || membersRes.error?.message || 'Fehler beim Laden');
        setLoadingTeams(false);
        return;
      }
      const teams = teamsRes.data || [];
      const members = membersRes.data || [];
      const overview: TeamOverviewTeam[] = teams.map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        color: getRandomColor(t.id),
        members: members.filter((m: any) => m.team_id === t.id).map((m: any) => ({ name: m.name }))
      }));
      setTeamsOverview(overview);
      setLoadingTeams(false);
    });
  }, [showTeamOverview]);

  return (
    <nav className={styles.topnav}>
      <div className={styles.leftIcon}>
        <button className={styles.iconBtn} title="Fortschritt" onClick={() => setShowTasksModal(true)}>
          <span className={styles.icon}>🏆</span>
        </button>
        <button className={styles.iconBtn} title="Teamübersicht" onClick={() => setShowTeamOverview(true)}>
          <span className={styles.icon}>🧑‍🤝‍🧑</span>
        </button>
      </div>
      <div className={styles.centerInfo}>
        <div className={styles.teamName}>{team || '-'}</div>
        <div className={styles.teamCode}>{teamCode || '-'}</div>
      </div>
      <div className={styles.rightIcon}>
        <button className={styles.iconBtn} title="Abmelden" onClick={onLogout}>
          <span className={styles.icon}>🚪</span>
        </button>
      </div>
      {showTasksModal && (
        <Modal isOpen={showTasksModal} onClose={() => setShowTasksModal(false)} title="Schnitzeljagd Aufgaben">
          {loading ? <div>Aufgaben werden geladen...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
            <ul className={styles.tasksList}>
              {tasks.map(task => (
                <li key={task.id} className={styles.taskCard}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.taskActions}>
                    <button className={styles.pinBtn} title="Ort auf Karte markieren" onClick={() => onSelectCheckpoint(task.id)}>
                      📍
                    </button>
                    <button className={styles.pinBtn} title="Details anzeigen" onClick={() => setOpenDetails(openDetails === task.id ? null : task.id)}>
                      {openDetails === task.id ? '−' : '+'}
                    </button>
                  </div>
                  {openDetails === task.id && (
                    <div className={styles.detailsDropdown}>
                      <div><b>Beschreibung:</b> {task.description || 'Keine Beschreibung'}</div>
                      <div><b>Koordinaten:</b> {task.lat}, {task.lng}</div>
                      <div><b>Radius:</b> {task.radius} m</div>
                      <div><b>Lösung:</b></div>
                      <input
                        className={styles.solutionInput}
                        type="text"
                        placeholder="Lösung eintragen..."
                        value={solutionInput[task.id] || ''}
                        onChange={e => setSolutionInput(s => ({ ...s, [task.id]: e.target.value }))}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
      {showTeamOverview && (
        <Modal isOpen={showTeamOverview} onClose={() => setShowTeamOverview(false)} title="Teamübersicht">
          {loadingTeams ? <div>Teams werden geladen...</div> : errorTeams ? <div style={{color:'red'}}>{errorTeams}</div> : (
            <ul className={styles.teamsList}>
              {teamsOverview.map(team => (
                <li key={team.id} className={styles.teamCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: team.color, border: '2px solid #fff', marginRight: 6 }} />
                    <b>{team.name}</b> <span style={{fontSize:12, color:'#888'}}>({team.code})</span>
                  </div>
                  <div style={{marginLeft:24}}>
                    Mitglieder:
                    <ul style={{margin:0, paddingLeft:16}}>
                      {team.members.map(m => <li key={m.name}>{m.name}</li>)}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </nav>
  );
}
