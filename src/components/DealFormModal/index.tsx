import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { useDeleteDeal, useSaveDeal } from '../../hooks/useDeals';
import { customersApi, getErrorMessage, getProblem } from '../../services/api';
import { sourceLabels, stageLabels, stageOrder, type Deal, type DealSource, type DealStage } from '../../types/deal';
import '../CustomerFormModal/styles.css';

// Mesmas regras do DealRequestDTO no backend
const schema = z
  .object({
    title: z.string().trim().min(1, 'Informe o título').max(150, 'Use no máximo 150 caracteres'),
    customerId: z.number({ error: 'Escolha o cliente' }).int().positive('Escolha o cliente'),
    value: z.number({ error: 'Informe o valor' }).min(0, 'O valor não pode ser negativo'),
    stage: z.enum(['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']),
    source: z.union([z.literal(''), z.enum(['REFERRAL', 'INSTAGRAM', 'WEBSITE', 'WHATSAPP', 'OTHER'])]),
    expectedCloseDate: z.string(),
    lostReason: z.string().trim().max(255, 'Use no máximo 255 caracteres'),
    notes: z.string().trim().max(2000, 'Use no máximo 2000 caracteres'),
  })
  .refine((data) => data.stage !== 'LOST' || data.lostReason.length > 0, {
    path: ['lostReason'],
    message: 'Informe o motivo da perda',
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  deal?: Deal;
  initialStage?: DealStage;
  /** Cliente já escolhido ao criar a partir da ficha dele. */
  initialCustomerId?: number;
  onClose: () => void;
}

export const DealFormModal = ({ deal, initialStage = 'PROSPECT', initialCustomerId, onClose }: Props) => {
  const formId = useId();
  const save = useSaveDeal();
  const remove = useDeleteDeal();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = Boolean(deal);

  const customers = useQuery({
    queryKey: ['customers', 'options'],
    queryFn: () => customersApi.list({ size: 200, sort: 'name,asc' }),
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: deal?.title ?? '',
      customerId: deal?.customer.id ?? initialCustomerId ?? Number.NaN,
      value: deal?.value ?? Number.NaN,
      stage: deal?.stage ?? initialStage,
      source: deal?.source ?? '',
      expectedCloseDate: deal?.expectedCloseDate ?? '',
      lostReason: deal?.lostReason ?? '',
      notes: deal?.notes ?? '',
    },
  });

  const stage = useWatch({ control, name: 'stage' });

  // Garante que o cliente do negócio aparece na lista mesmo se estiver fora dos primeiros 200
  const customerOptions = customers.data
    ? deal && !customers.data.content.some((customer) => customer.id === deal.customer.id)
      ? [...customers.data.content, deal.customer]
      : customers.data.content
    : null;

  const onSubmit = handleSubmit((values) =>
    save.mutate(
      {
        id: deal?.id,
        data: {
          title: values.title,
          customerId: values.customerId,
          value: values.value,
          stage: values.stage,
          source: values.source === '' ? null : (values.source as DealSource),
          expectedCloseDate: values.expectedCloseDate || null,
          lostReason: values.stage === 'LOST' ? values.lostReason : null,
          notes: values.notes || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(isEditing ? 'Negócio atualizado' : 'Negócio criado');
          onClose();
        },
        onError: (error) => {
          const problem = getProblem(error);
          if (problem?.errors) {
            Object.entries(problem.errors).forEach(([field, message]) =>
              setError(field as keyof FormValues, { message }),
            );
          } else {
            toast.error(getErrorMessage(error));
          }
        },
      },
    ),
  );

  const handleDelete = () => {
    if (!deal) return;
    remove.mutate(deal.id, {
      onSuccess: () => {
        toast.success('Negócio excluído');
        onClose();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const field = (name: keyof FormValues) => ({
    id: `${formId}-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${formId}-${name}-error` : undefined,
  });

  const errorText = (name: keyof FormValues) =>
    errors[name] && (
      <span className="fieldError" id={`${formId}-${name}-error`}>
        {errors[name]?.message}
      </span>
    );

  if (confirmDelete && deal) {
    return (
      <ConfirmDialog
        title="Excluir negócio?"
        confirmLabel="Excluir"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <strong style={{ color: 'var(--text-main)' }}>{deal.title}</strong> e o histórico de etapas dele serão
        removidos. Essa ação não pode ser desfeita.
      </ConfirmDialog>
    );
  }

  return (
    <Modal
      title={isEditing ? 'Editar negócio' : 'Novo negócio'}
      onClose={onClose}
      footer={
        <>
          {isEditing && (
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} />
              Excluir
            </Button>
          )}
          {deal && !initialCustomerId && (
            <Link to={`/clientes/${deal.customer.id}`} className="dealCustomerLink" onClick={onClose}>
              Ver ficha do cliente
            </Link>
          )}
          <span style={{ marginRight: 'auto' }} />
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={save.isPending}>
            {save.isPending && <LoaderCircle size={16} className="spin" />}
            {isEditing ? 'Salvar alterações' : 'Criar negócio'}
          </Button>
        </>
      }
    >
      <form id={formId} className="customerForm" onSubmit={onSubmit} noValidate>
        <div className="formField formField--full">
          <label htmlFor={`${formId}-title`}>Título *</label>
          <input {...register('title')} {...field('title')} placeholder="Ex.: App de pedidos" autoFocus />
          {errorText('title')}
        </div>

        <div className="formField formField--full">
          <label htmlFor={`${formId}-customerId`}>Cliente *</label>
          {/* Só monta o campo depois que a lista chega; assim o cliente atual já vem selecionado */}
          {customerOptions ? (
            <select {...register('customerId', { valueAsNumber: true })} {...field('customerId')}>
              <option value="">Escolha um cliente</option>
              {customerOptions.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company ? `${customer.company} · ${customer.name}` : customer.name}
                </option>
              ))}
            </select>
          ) : (
            <select id={`${formId}-customerId`} disabled>
              <option>{customers.isError ? 'Não foi possível carregar os clientes' : 'Carregando clientes…'}</option>
            </select>
          )}
          {errorText('customerId')}
        </div>

        <div className="formField">
          <label htmlFor={`${formId}-value`}>Valor (R$) *</label>
          <input
            {...register('value', { valueAsNumber: true })}
            {...field('value')}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="38000"
          />
          {errorText('value')}
        </div>

        <div className="formField">
          <label htmlFor={`${formId}-expectedCloseDate`}>Previsão de fechamento</label>
          <input {...register('expectedCloseDate')} {...field('expectedCloseDate')} type="date" />
        </div>

        <div className="formField">
          <label htmlFor={`${formId}-stage`}>Etapa</label>
          <select {...register('stage')} {...field('stage')}>
            {stageOrder.map((option) => (
              <option key={option} value={option}>
                {stageLabels[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="formField">
          <label htmlFor={`${formId}-source`}>Origem</label>
          <select {...register('source')} {...field('source')}>
            <option value="">Não informada</option>
            {(Object.keys(sourceLabels) as DealSource[]).map((option) => (
              <option key={option} value={option}>
                {sourceLabels[option]}
              </option>
            ))}
          </select>
        </div>

        {stage === 'LOST' && (
          <div className="formField formField--full">
            <label htmlFor={`${formId}-lostReason`}>Motivo da perda *</label>
            <input {...register('lostReason')} {...field('lostReason')} placeholder="Ex.: Preço acima do orçamento" />
            {errorText('lostReason')}
          </div>
        )}

        <div className="formField formField--full">
          <label htmlFor={`${formId}-notes`}>Observações</label>
          <textarea
            {...register('notes')}
            {...field('notes')}
            rows={4}
            placeholder="Contexto da negociação, próximos passos…"
          />
          {errorText('notes')}
        </div>
      </form>
    </Modal>
  );
};
