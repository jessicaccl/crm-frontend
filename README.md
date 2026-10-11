# CRM Pro · Frontend

Interface do CRM de vendas: clientes, funil Kanban, painel de resultados e integrações.
API em [crm-vendas-backend](https://github.com/jessicaccl/crm-vendas-backend).

**Stack:** React 19 · TypeScript · Vite · React Router · TanStack Query · dnd-kit · React Hook Form + Zod · Sonner · Lucide

## Como rodar

Com a API rodando em `http://localhost:8080`:

```bash
npm install
cp .env.example .env.local   # opcional: só se a API estiver em outro endereço
npm run dev
```

Abra http://localhost:5173.

## O que já funciona

- **Funil Kanban**: arrastar e soltar negócios entre Prospecto, Qualificado, Proposta, Ganho e Perdido (mouse, toque e teclado)
- Ao soltar em "Perdido", o sistema pede o motivo da perda
- Indicadores no topo: valor em aberto, ganho no mês vs mês anterior, taxa de conversão e negócios parados
- Cards sinalizam negócios parados há 7+ dias e previsões de fechamento vencendo
- Cadastro, edição e exclusão de negócios
- Lista de clientes com busca, filtro por status (Lead, Cliente, Inativo) e paginação
- Cadastro e edição em modal, com validação no navegador e mensagens de erro vindas da API
- Exclusão com confirmação
- Estados de carregando, erro e lista vazia
- Menu lateral recolhível e layout que funciona no celular

## Estrutura

```
src/
  components/   Button, Modal, Sidebar, KpiStrip, DealCard, DealFormModal, LostReasonModal, CustomerCard...
  pages/        Pipeline (funil), Customers e páginas das próximas fases
  hooks/        useDeals (com atualização otimista ao arrastar), useCustomers, useDebouncedValue
  utils/        formatação de moeda e datas
  services/     cliente HTTP (axios) e leitura de erros da API
  types/        tipos compartilhados com o contrato da API
```

## Roteiro

- [x] Fase 1: base (rotas, CRUD de clientes, validação, estados de tela)
- [x] Fase 2: funil Kanban com arrastar e soltar e indicadores
- [ ] Fase 3: login, testes e demo online
- [ ] Fase 4: painel de resultados com gráficos
- [ ] Fase 5: ficha do cliente com atividades, tarefas e integrações
