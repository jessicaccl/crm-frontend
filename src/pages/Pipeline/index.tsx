import { useMemo, useState, type PointerEventHandler } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/Button';
import { DealCard } from '../../components/DealCard';
import { DealFormModal } from '../../components/DealFormModal';
import { KpiStrip } from '../../components/KpiStrip';
import { LostReasonModal } from '../../components/LostReasonModal';
import { useDeals, useMoveDeal } from '../../hooks/useDeals';
import { getErrorMessage } from '../../services/api';
import { stageLabels, stageOrder, type Deal, type DealStage } from '../../types/deal';
import { formatCompactCurrency } from '../../utils/format';
import '../Customers/styles.css';
import './styles.css';

type FormTarget = { deal?: Deal; stage?: DealStage } | null;

const DraggableDeal = ({ deal, onOpen }: { deal: Deal; onOpen: (deal: Deal) => void }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id, data: { deal } });

  return (
    <DealCard
      ref={setNodeRef}
      deal={deal}
      isDragging={isDragging}
      onClick={() => onOpen(deal)}
      onKeyDown={(event) => {
        // Enter abre o negócio; Espaço fica para o arrastar pelo teclado
        if (event.key === 'Enter') onOpen(deal);
        else listeners?.onKeyDown?.(event);
      }}
      onPointerDown={listeners?.onPointerDown as PointerEventHandler<HTMLDivElement> | undefined}
      {...attributes}
      aria-roledescription="Negócio arrastável"
      aria-label={`${deal.title}, ${deal.customer.company ?? deal.customer.name}. Enter para abrir, espaço para mover.`}
    />
  );
};

const StageColumn = ({
  stage,
  deals,
  onOpen,
  onAdd,
}: {
  stage: DealStage;
  deals: Deal[];
  onOpen: (deal: Deal) => void;
  onAdd: (stage: DealStage) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <section ref={setNodeRef} className={`stageColumn stageColumn--${stage} ${isOver ? 'isOver' : ''}`} aria-label={stageLabels[stage]}>
      <header className="stageHeader">
        <h2>{stageLabels[stage]}</h2>
        <span>
          {deals.length}
          {deals.length > 0 && stage !== 'LOST' && ` · ${formatCompactCurrency(total)}`}
        </span>
      </header>
      <div className="stageBar" />
      <div className="stageCards">
        {deals.map((deal) => (
          <DraggableDeal key={deal.id} deal={deal} onOpen={onOpen} />
        ))}
        {deals.length === 0 && <p className="stageEmpty">Arraste negócios para cá</p>}
      </div>
      {stage !== 'WON' && stage !== 'LOST' && (
        <button type="button" className="stageAdd" onClick={() => onAdd(stage)}>
          <Plus size={14} /> Adicionar
        </button>
      )}
    </section>
  );
};

export const Pipeline = () => {
  const { data: deals, isPending, isError, error, refetch, isFetching } = useDeals();
  const moveDeal = useMoveDeal();
  const [search, setSearch] = useState('');
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [pendingLost, setPendingLost] = useState<Deal | null>(null);
  const [formTarget, setFormTarget] = useState<FormTarget>(null);

  const sensors = useSensors(
    // Pequena distância mínima para que um clique simples abra o negócio em vez de arrastar
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const columns = useMemo(() => {
    const text = search.trim().toLowerCase();
    const visible = (deals ?? []).filter(
      (deal) =>
        !text ||
        deal.title.toLowerCase().includes(text) ||
        deal.customer.name.toLowerCase().includes(text) ||
        (deal.customer.company ?? '').toLowerCase().includes(text),
    );
    return Object.fromEntries(
      stageOrder.map((stage) => [stage, visible.filter((deal) => deal.stage === stage)]),
    ) as Record<DealStage, Deal[]>;
  }, [deals, search]);

  const move = (deal: Deal, stage: DealStage, lostReason?: string) =>
    moveDeal.mutate(
      { id: deal.id, stage, lostReason },
      {
        onSuccess: () => {
          if (stage === 'WON') toast.success(`Negócio ganho: ${deal.title}`);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDeal((event.active.data.current?.deal as Deal) ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    const deal = active.data.current?.deal as Deal | undefined;
    const target = over?.id as DealStage | undefined;
    if (!deal || !target || target === deal.stage) return;

    if (target === 'LOST') setPendingLost(deal);
    else move(deal, target);
  };

  return (
    <main className="container pipelinePage">
      <header className="pageHeader">
        <div>
          <h1>Funil de vendas</h1>
          <p className="pageSubtitle">Arraste os negócios entre as etapas. Clique em um card para editar.</p>
        </div>
        <div className="pipelineActions">
          <label className="searchBox">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Buscar negócios</span>
            <input
              id="deal-search"
              type="search"
              placeholder="Buscar negócio ou cliente…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Button onClick={() => setFormTarget({})}>
            <Plus size={18} />
            Novo negócio
          </Button>
        </div>
      </header>

      <KpiStrip />

      {isPending ? (
        <div className="board" aria-busy="true" aria-label="Carregando funil">
          {stageOrder.map((stage) => (
            <div key={stage} className="stageColumn stageColumn--loading" />
          ))}
        </div>
      ) : isError ? (
        <div className="stateBox stateBox--error" role="alert">
          <TriangleAlert size={28} />
          <h2>Não foi possível carregar o funil</h2>
          <p>{getErrorMessage(error)}</p>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
            Tentar novamente
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDeal(null)}
          accessibility={{
            announcements: {
              onDragStart: ({ active }) => `Movendo ${(active.data.current?.deal as Deal)?.title}.`,
              onDragOver: ({ over }) => (over ? `Sobre a etapa ${stageLabels[over.id as DealStage]}.` : 'Fora das etapas.'),
              onDragEnd: ({ over }) => (over ? `Solto em ${stageLabels[over.id as DealStage]}.` : 'Movimento cancelado.'),
              onDragCancel: () => 'Movimento cancelado.',
            },
          }}
        >
          <div className="board">
            {stageOrder.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                deals={columns[stage]}
                onOpen={(deal) => setFormTarget({ deal })}
                onAdd={(initial) => setFormTarget({ stage: initial })}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>{activeDeal && <DealCard deal={activeDeal} isOverlay />}</DragOverlay>
        </DndContext>
      )}

      {pendingLost && (
        <LostReasonModal
          deal={pendingLost}
          onClose={() => setPendingLost(null)}
          onConfirm={(reason) => {
            move(pendingLost, 'LOST', reason);
            setPendingLost(null);
          }}
        />
      )}

      {formTarget && (
        <DealFormModal deal={formTarget.deal} initialStage={formTarget.stage} onClose={() => setFormTarget(null)} />
      )}
    </main>
  );
};
