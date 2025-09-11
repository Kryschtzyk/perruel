import React from 'react';
import styles from '../app/page.module.css';

interface JoinFormProps {
  team: string;
  name: string;
  onTeamChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onJoin: () => void;
}

export default function JoinForm({ team, name, onTeamChange, onNameChange, onJoin }: JoinFormProps) {
  return (
    <div className={styles.joinForm + ' grid gap-2 sm:grid-cols-3'}>
      <input
        className={styles.input + ' border p-2 rounded'}
        placeholder="Team (Rot/Blau/Grün)"
        value={team}
        onChange={e => onTeamChange(e.target.value)}
      />
      <input
        className={styles.input + ' border p-2 rounded'}
        placeholder="Dein Name"
        value={name}
        onChange={e => onNameChange(e.target.value)}
      />
      <button className={styles.button + ' bg-black text-white rounded p-2'} onClick={onJoin}>
        Beitreten
      </button>
    </div>
  );
}

