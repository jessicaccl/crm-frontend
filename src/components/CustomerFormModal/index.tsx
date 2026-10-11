import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { useSaveCustomer } from '../../hooks/useCustomers';
import { getErrorMessage, getProblem } from '../../services/api';
import { statusLabels, type Customer, type CustomerStatus } from '../../types/customer';
import './styles.css';

// Mesmas regras do CustomerRequestDTO no backend
const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome').max(120, 'Use no máximo 120 caracteres'),
  company: z.string().trim().max(120, 'Use no máximo 120 caracteres'),
  email: z
    .string()
    .trim()
    .max(160, 'Use no máximo 160 caracteres')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'E-mail inválido'),
  phone: z.string().trim().max(30, 'Use no máximo 30 caracteres'),
  status: z.enum(['LEAD', 'CUSTOMER', 'INACTIVE']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  customer?: Customer;
  onClose: () => void;
}

export const CustomerFormModal = ({ customer, onClose }: Props) => {
  const formId = useId();
  const save = useSaveCustomer();
  const isEditing = Boolean(customer);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? '',
      company: customer?.company ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      status: customer?.status ?? 'LEAD',
    },
  });

  const onSubmit = handleSubmit((values) =>
    save.mutate(
      { id: customer?.id, data: values },
      {
        onSuccess: () => {
          toast.success(isEditing ? 'Cliente atualizado' : 'Cliente cadastrado');
          onClose();
        },
        onError: (error) => {
          const problem = getProblem(error);
          if (problem?.errors) {
            Object.entries(problem.errors).forEach(([field, message]) =>
              setError(field as keyof FormValues, { message }),
            );
          } else if (problem?.status === 409) {
            setError('email', { message: problem.detail });
          } else {
            toast.error(getErrorMessage(error));
          }
        },
      },
    ),
  );

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

  return (
    <Modal
      title={isEditing ? 'Editar cliente' : 'Novo cliente'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={save.isPending}>
            {save.isPending && <LoaderCircle size={16} className="spin" />}
            {isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </>
      }
    >
      <form id={formId} className="customerForm" onSubmit={onSubmit} noValidate>
        <div className="formField formField--full">
          <label htmlFor={`${formId}-name`}>Nome do contato *</label>
          <input {...register('name')} {...field('name')} placeholder="Ex.: Carla Mendes" autoFocus />
          {errorText('name')}
        </div>

        <div className="formField formField--full">
          <label htmlFor={`${formId}-company`}>Empresa</label>
          <input {...register('company')} {...field('company')} placeholder="Ex.: Rede Mercadinho Bom Preço" />
          {errorText('company')}
        </div>

        <div className="formField">
          <label htmlFor={`${formId}-email`}>E-mail</label>
          <input {...register('email')} {...field('email')} type="email" placeholder="contato@empresa.com.br" />
          {errorText('email')}
        </div>

        <div className="formField">
          <label htmlFor={`${formId}-phone`}>Telefone</label>
          <input {...register('phone')} {...field('phone')} type="tel" placeholder="(11) 98877-1020" />
          {errorText('phone')}
        </div>

        <div className="formField formField--full">
          <label htmlFor={`${formId}-status`}>Status</label>
          <select {...register('status')} {...field('status')}>
            {(Object.keys(statusLabels) as CustomerStatus[]).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
};
