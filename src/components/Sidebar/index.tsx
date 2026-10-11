import { NavLink } from 'react-router';
import {
  Kanban,
  LayoutDashboard,
  Users,
  SquareCheckBig,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import './styles.css';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const mainItems: NavItem[] = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/funil', label: 'Funil', icon: Kanban },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/tarefas', label: 'Tarefas', icon: SquareCheckBig },
];

const secondaryItems: NavItem[] = [
  { to: '/integracoes', label: 'Integrações', icon: Plug },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
  const renderItem = ({ to, label, icon: Icon }: NavItem) => (
    <NavLink
      key={to}
      to={to}
      title={isOpen ? undefined : label}
      className={({ isActive }) => `navItem ${isActive ? 'navItemActive' : ''}`}
    >
      <Icon size={20} style={{ minWidth: '20px' }} />
      <span className="navText">{label}</span>
    </NavLink>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'sidebarOpen' : 'sidebarClosed'}`}>
      <button
        className="toggleBtn"
        onClick={toggle}
        aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="logo">
        <img src="/favicon.svg" alt="" width={26} height={26} />
        <span className="logoText">CRM Pro</span>
      </div>

      <nav className="nav">
        {mainItems.map(renderItem)}
        <div className="navSeparator" />
        {secondaryItems.map(renderItem)}
      </nav>
    </aside>
  );
};
