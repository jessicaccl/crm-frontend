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
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { useTasks } from '../../hooks/useTasks';
import { taskBucket } from '../../types/task';
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
  const { user, logout } = useAuth();
  const pendingTasks = useTasks({ done: false });
  // Atrasadas + de hoje: o que pede atenção agora
  const dueNow = (pendingTasks.data ?? []).filter((task) => taskBucket(task) !== 'upcoming').length;

  const renderItem = ({ to, label, icon: Icon }: NavItem) => (
    <NavLink
      key={to}
      to={to}
      title={isOpen ? undefined : label}
      className={({ isActive }) => `navItem ${isActive ? 'navItemActive' : ''}`}
    >
      <Icon size={20} style={{ minWidth: '20px' }} />
      <span className="navText">{label}</span>
      {to === '/tarefas' && dueNow > 0 && (
        <span className="navBadge" aria-label={`${dueNow} tarefas para agora`}>
          {dueNow}
        </span>
      )}
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

      {user && (
        <div className="sidebarUser">
          <span className="userAvatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="userInfo">
            <span className="userName">{user.name}</span>
            <span className="userEmail">{user.organization?.name ?? user.email}</span>
          </div>
          <button className="logoutBtn" onClick={logout} aria-label="Sair" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};
