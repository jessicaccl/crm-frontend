import { useId, useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import type { Deal } from '../../types/deal';
import './styles.css';

const COMMON_REASONS = [
  'Preço acima do orçamento',
  'Escolheu um concorrente',
  'Sem resposta do cliente',
  'Projeto adiado',
  'Não era o perfil',
];

interface Props {
  deal: Deal;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Aberto ao soltar um card em "Perdido": o motivo alimenta a análise de perdas. */
export const LostReasonModal = ({ deal, onConfirm, onClose }: Props) => {
  const inputId = useId();
  const [reason, setReason] = useState('');
  const [showError, setShowError] = useState(false);

  const confirm = () => {
    if (!reason.trim()) {
      setShowError(true);
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      title="Por que este negócio foi perdido?"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirm}>
            Marcar como perdido
          </Button>
        </>
      }
    >
      <div className="lostReason">
        <p className="lostReasonDeal">{deal.title}</p>
        <div className="reasonChips" role="group" aria-label="Motivos comuns">
          {COMMON_REASONS.map((option) => (
            <button
              key={option}
              type="button"
              className={reason === option ? 'active' : ''}
              aria-pressed={reason === option}
              onClick={() => {
                setReason(option);
                setShowError(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <label htmlFor={inputId}>Ou escreva o motivo</label>
        <input
          id={inputId}
          value={reason}
          maxLength={255}
          aria-invalid={showError || undefined}
          onChange={(event) => {
            setReason(event.target.value);
            setShowError(false);
          }}
          onKeyDown={(event) => event.key === 'Enter' && confirm()}
          placeholder="Ex.: Cliente fechou com a agência atual"
        />
        {showError && <span className="fieldError">Escolha ou escreva um motivo</span>}
      </div>
    </Modal>
  );
};
