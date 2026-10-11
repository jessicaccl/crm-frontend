/** Resposta paginada do Spring Data (modo VIA_DTO). */
export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/** Corpo de erro padrão da API (RFC 9457). */
export interface ProblemDetail {
  status: number;
  title: string;
  detail?: string;
  errors?: Record<string, string>;
}
