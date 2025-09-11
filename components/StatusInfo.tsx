import React from 'react';
import styles from '../app/page.module.css';

interface StatusInfoProps {
  status: string;
}

export default function StatusInfo({ status }: StatusInfoProps) {
  return <p className={styles.status}>{status}</p>;
}

