import { statusLabels, type CustomerStatus } from '../../types/customer';
import './styles.css';

export const StatusBadge = ({ status }: { status: CustomerStatus }) => (
  <span className={`statusBadge statusBadge--${status}`}>{statusLabels[status]}</span>
);
