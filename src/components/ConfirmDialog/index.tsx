import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';

interface Props {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({ title, children, confirmLabel, isLoading, onConfirm, onClose }: Props) => (
  <Modal
    title={title}
    onClose={onClose}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading && <LoaderCircle size={16} className="spin" />}
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55 }}>{children}</div>
  </Modal>
);
