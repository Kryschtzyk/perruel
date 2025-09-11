import React from 'react';
import styles from '../app/page.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  onClick,
}: ButtonProps) {
  let variantClass = styles.button;
  if (variant === 'secondary') variantClass += ' ' + styles.buttonSecondary;
  if (variant === 'danger') variantClass += ' ' + styles.buttonDanger;

  return (
    <button
      type={type}
      className={variantClass + ' ' + className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

