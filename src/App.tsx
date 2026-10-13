import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { RequireAuth } from './components/RequireAuth';
import { Customers } from './pages/Customers';
import { Pipeline } from './pages/Pipeline';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Integrations } from './pages/Integrations';
import { CustomerDetail } from './pages/CustomerDetail';
import { Tasks } from './pages/Tasks';
import { Dashboard } from './pages/Dashboard';
import './App.css';

/** Estrutura das telas internas: menu lateral + conteúdo. */
const AppLayout = () => {
  // Em telas pequenas a sidebar começa recolhida
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 900);

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/funil" replace />} />
        <Route path="/funil" element={<Pipeline />} />
        <Route path="/clientes" element={<Customers />} />
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/clientes/:id" element={<CustomerDetail />} />
        <Route path="/tarefas" element={<Tasks />} />
        <Route path="/integracoes" element={<Integrations />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/funil" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
