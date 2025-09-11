import React, { useState } from 'react';
import styles from './JoinForm.module.scss';
import Cookies from 'js-cookie';
import Button from './Button';

function generateTeamCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

interface JoinFormProps {
  team: string;
  name: string;
  teamCode: string;
  mode: 'create' | 'join';
  onTeamChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onTeamCodeChange: (v: string) => void;
  onModeChange: (mode: 'create' | 'join') => void;
  onJoin: (mode: 'create' | 'join', team: string, name: string, code: string) => void;
}

export default function JoinForm({ team, name, teamCode, mode, onTeamChange, onNameChange, onTeamCodeChange, onModeChange, onJoin }: JoinFormProps) {
  const [createdCode, setCreatedCode] = useState('');

  function handleCreate() {
    const code = generateTeamCode();
    setCreatedCode(code);
    Cookies.set('teamCode', code);
    onJoin('create', team, name, code);
  }

  function handleJoin() {
    Cookies.set('teamCode', teamCode);
    onJoin('join', team, name, teamCode);
  }

  return (
    <div className={styles.joinForm}>
      <div className={styles.modeSwitch}>
        <Button variant={mode === 'create' ? 'primary' : 'secondary'} onClick={() => onModeChange('create')}>
          Team erstellen
        </Button>
        <Button variant={mode === 'join' ? 'primary' : 'secondary'} onClick={() => onModeChange('join')}>
          Team beitreten
        </Button>
      </div>
      {mode === 'create' ? (
        <>
          <input
            className={styles.input}
            placeholder="Teamname (z.B. Rot/Blau/Grün)"
            value={team}
            onChange={e => onTeamChange(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Dein Name"
            value={name}
            onChange={e => onNameChange(e.target.value)}
          />
          <Button variant="primary" className={styles.button} onClick={handleCreate}>
            Team erstellen
          </Button>
          {createdCode && (
            <div className={styles.codeBox}>
              <div className={styles.title}>Team-Code:</div>
              <div className={styles.code}>{createdCode}</div>
              <div className={styles.hint}>Diesen Code an alle Teammitglieder weitergeben!</div>
            </div>
          )}
        </>
      ) : (
        <>
          <input
            className={styles.input}
            placeholder="Team-Code eingeben"
            value={teamCode}
            onChange={e => onTeamCodeChange(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Dein Name"
            value={name}
            onChange={e => onNameChange(e.target.value)}
          />
          <Button variant="primary" className={styles.button} onClick={handleJoin}>
            Beitreten
          </Button>
        </>
      )}
    </div>
  );
}
