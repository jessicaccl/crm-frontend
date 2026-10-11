import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi, reportsApi } from '../services/api';
import type { Deal, DealInput, DealStage } from '../types/deal';

const DEALS = ['deals'];
const SUMMARY = ['reports', 'summary'];

export function useDeals() {
  return useQuery({ queryKey: DEALS, queryFn: dealsApi.list });
}

export function useSummary() {
  return useQuery({ queryKey: SUMMARY, queryFn: reportsApi.summary });
}

/** Invalida o que depende dos negócios: o quadro e os indicadores. */
function useRefreshAfterChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: DEALS }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
    ]);
}

/**
 * Move o card de etapa com atualização otimista: o card muda de coluna na hora
 * e volta para o lugar se a API recusar.
 */
export function useMoveDeal() {
  const queryClient = useQueryClient();
  const refresh = useRefreshAfterChange();

  return useMutation({
    mutationFn: ({ id, stage, lostReason }: { id: number; stage: DealStage; lostReason?: string }) =>
      dealsApi.changeStage(id, stage, lostReason),
    onMutate: async ({ id, stage, lostReason }) => {
      await queryClient.cancelQueries({ queryKey: DEALS });
      const previous = queryClient.getQueryData<Deal[]>(DEALS);
      const now = new Date().toISOString();
      queryClient.setQueryData<Deal[]>(DEALS, (deals) =>
        deals?.map((deal) =>
          deal.id === id
            ? {
                ...deal,
                stage,
                stageChangedAt: now,
                closedAt: stage === 'WON' || stage === 'LOST' ? now : null,
                lostReason: stage === 'LOST' ? (lostReason ?? null) : null,
              }
            : deal,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(DEALS, context.previous);
    },
    onSettled: refresh,
  });
}

export function useSaveDeal() {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: DealInput }) =>
      id ? dealsApi.update(id, data) : dealsApi.create(data),
    // Sem await: o modal fecha na hora e o quadro atualiza logo em seguida
    onSuccess: () => void refresh(),
  });
}

export function useDeleteDeal() {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: (id: number) => dealsApi.remove(id),
    onSuccess: () => void refresh(),
  });
}
