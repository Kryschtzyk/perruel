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

export default function TopNav({ team, name, teamCode, onLogout, showTasksModal, setShowTasksModal, onSelectCheckpoint }: TopNavProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState<string | null>(null);
  const [solutionInput, setSolutionInput] = useState<{[id: string]: string}>({});

  useEffect(() => {
    if (!showTasksModal) return;
    setLoading(true);
    supabase.from('tasks').select('*').order('title').then(({ data, error }) => {
      if (error) setError(error.message);
      else setTasks(data || []);
      setLoading(false);
    });
  }, [showTasksModal]);

  return (
    <nav className={styles.topnav}>
      <div className={styles.leftIcon}>
        <button className={styles.iconBtn} title="Fortschritt" onClick={() => setShowTasksModal(true)}>
          <span className={styles.icon}>🏆</span>
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
    </nav>
  );
}
