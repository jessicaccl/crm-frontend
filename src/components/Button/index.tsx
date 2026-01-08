import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './styles.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ children, variant = 'primary', ...rest }: ButtonProps) => {
  return (
    <button
      className={`button ${variant}`}
      {...rest}
    >
      {children}
    </button>
  );
};