import { LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css'; 

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
  return (    
    <aside className={`sidebar ${isOpen ? 'sidebarOpen' : 'sidebarClosed'}`}>
      
      <button className="toggleBtn" onClick={toggle}>
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="logo">
        <LayoutDashboard size={24} color="#3b82f6" style={{ minWidth: '24px' }} />
        <span className="logoText">CRM Pro</span>
      </div>

      <nav className="nav">
        <div className="navItem">
          <LayoutDashboard size={20} style={{ minWidth: '20px' }} />
          <span className="navText">Dashboard</span>
        </div>
        
        <div className="navItem navItemActive">
          <Users size={20} style={{ minWidth: '20px' }} />
          <span className="navText">Clientes</span>
        </div>
        
        <div className="navItem">
          <Settings size={20} style={{ minWidth: '20px' }} />
          <span className="navText">Configurações</span>
        </div>
      </nav>
    </aside>
  );
};