import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activitiesApi, tasksApi } from '../services/api';
import type { ActivityInput } from '../types/activity';
import type { TaskFilters, TaskInput } from '../types/task';

export function useTasks(filters: TaskFilters) {
  return useQuery({ queryKey: ['tasks', filters], queryFn: () => tasksApi.list(filters) });
}

export function useTimeline(customerId: number) {
  return useQuery({ queryKey: ['timeline', customerId], queryFn: () => activitiesApi.timeline(customerId) });
}

/** Tarefas e linha do tempo mudam juntas (concluir uma tarefa entra na linha do tempo). */
function useRefreshTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });
  };
}

export function useSaveTask() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: TaskInput }) => (id ? tasksApi.update(id, data) : tasksApi.create(data)),
    onSuccess: refresh,
  });
}

export function useToggleTask() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) => tasksApi.setDone(id, done),
    onSuccess: refresh,
  });
}

export function useDeleteTask() {
  const refresh = useRefreshTasks();
  return useMutation({ mutationFn: (id: number) => tasksApi.remove(id), onSuccess: refresh });
}

export function useAddActivity(customerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityInput) => activitiesApi.create(customerId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline', customerId] }),
  });
}

export function useDeleteActivity(customerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activitiesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline', customerId] }),
  });
}
