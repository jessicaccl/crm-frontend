import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './styles.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'md' | 'icon';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
