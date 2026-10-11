import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { Customers } from './pages/Customers';
import { Pipeline } from './pages/Pipeline';
import { ComingSoon } from './pages/ComingSoon';
import './App.css';

function App() {
  // Em telas pequenas a sidebar começa recolhida
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 900);

  return (
    <div className="layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/funil" replace />} />
        <Route path="/funil" element={<Pipeline />} />
        <Route path="/clientes" element={<Customers />} />
        <Route
          path="/painel"
          element={
            <ComingSoon
              title="Painel de resultados"
              phase={4}
              items={[
                'Receita ganha por mês',
                'Conversão por etapa e origem dos negócios',
                'Previsão de receita ponderada por etapa',
              ]}
            />
          }
        />
        <Route
          path="/tarefas"
          element={
            <ComingSoon
              title="Tarefas"
              phase={5}
              items={['Follow-ups com data e responsável', 'Lembretes de negócios parados']}
            />
          }
        />
        <Route
          path="/integracoes"
          element={
            <ComingSoon
              title="Integrações"
              phase={5}
              items={[
                'Webhooks quando um negócio muda de etapa ou é ganho',
                'Entrada de leads por API com chave de acesso',
                'Exemplos com n8n, WhatsApp e Telegram',
              ]}
            />
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ComingSoon
              title="Configurações"
              phase={3}
              items={['Login e usuários', 'Preferências da conta']}
            />
          }
        />
        <Route path="*" element={<Navigate to="/funil" replace />} />
      </Routes>
    </div>
  );
}

export default App;
