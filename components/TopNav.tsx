import React from 'react';
import styles from './TopNav.module.scss';
import Button from './Button';

interface TopNavProps {
  team: string;
  name: string;
  teamCode: string;
  onLogout: () => void;
}

export default function TopNav({ team, name, teamCode, onLogout }: TopNavProps) {
  return (
    <nav className={styles.topnav}>
      <div className={styles.leftIcon}>
        {/* Fortschritt-Icon, z.B. Pokal */}
        <span title="Fortschritt" className={styles.icon}>🏆</span>
      </div>
      <div className={styles.centerInfo}>
        <div className={styles.teamName}>{team || '-'}</div>
        <div className={styles.teamCode}>{teamCode || '-'}</div>
      </div>
      <div className={styles.rightIcon}>
        {/* Logout-Icon */}
        <button className={styles.iconBtn} title="Abmelden" onClick={onLogout}>
          <span className={styles.icon}>🚪</span>
        </button>
      </div>
    </nav>
  );
}
