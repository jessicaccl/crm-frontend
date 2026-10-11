import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';
import './styles.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
}

export const Modal = ({ title, onClose, children, footer, size = 'md' }: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modalOverlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modalHeader">
          <h2 id={titleId}>{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </Button>
        </header>
        <div className="modalBody">{children}</div>
        {footer && <footer className="modalFooter">{footer}</footer>}
      </div>
    </div>
  );
};
