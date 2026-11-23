import { http } from './client'
import type {
  Curso,
  Disciplina,
  DisciplinaInput,
  Grau,
  Instituicao,
  InstituicaoInput,
  PageQuery,
  Uuid,
} from './types'

/** Limite máximo aceito pela API em qualquer listagem. */
export const LIMITE_MAXIMO = 100

export const instituicoesApi = {
  listar: (q: PageQuery & { nome?: string } = {}) =>
    http.get<{ instituicoes: Instituicao[]; total: number }>('/api/instituicoes', { ...q }),
  obter: (id: Uuid) => http.get<Instituicao>(`/api/instituicoes/${id}`),
  criar: (body: InstituicaoInput) => http.post<Instituicao>('/api/instituicoes', body),
  atualizar: (id: Uuid, body: Partial<InstituicaoInput>) =>
    http.patch<Instituicao>(`/api/instituicoes/${id}`, body),
  /** Soft delete; remove também cursos e disciplinas. */
  remover: (id: Uuid) => http.delete(`/api/instituicoes/${id}`),
}

export const cursosApi = {
  listar: (q: PageQuery & { instituicaoId?: Uuid; grau?: Grau; nome?: string } = {}) =>
    http.get<{ cursos: Curso[]; total: number }>('/api/cursos', { ...q }),
  obter: (id: Uuid) => http.get<Curso>(`/api/cursos/${id}`),
  criar: (body: { instituicaoId: Uuid; nome: string; grau: Grau }) =>
    http.post<Curso>('/api/cursos', body),
  atualizar: (id: Uuid, body: { nome?: string; grau?: Grau }) =>
    http.patch<Curso>(`/api/cursos/${id}`, body),
  remover: (id: Uuid) => http.delete(`/api/cursos/${id}`),
}

export const disciplinasApi = {
  listar: (q: PageQuery & { instituicaoId?: Uuid; nome?: string } = {}) =>
    http.get<{ disciplinas: Disciplina[]; total: number }>('/api/disciplinas', { ...q }),
  obter: (id: Uuid) => http.get<Disciplina>(`/api/disciplinas/${id}`),
  criar: (body: DisciplinaInput & { instituicaoId: Uuid }) =>
    http.post<Disciplina>('/api/disciplinas', body),
  atualizar: (id: Uuid, body: Partial<DisciplinaInput>) =>
    http.patch<Disciplina>(`/api/disciplinas/${id}`, body),
  remover: (id: Uuid) => http.delete(`/api/disciplinas/${id}`),
}

/**
 * Busca todas as páginas de uma listagem (usado para preencher selects).
 * `buscar` recebe a página e devolve { itens, total }.
 */
export async function buscarTodos<T>(
  buscar: (page: number, limit: number) => Promise<{ itens: T[]; total: number }>,
): Promise<T[]> {
  const todos: T[] = []
  for (let page = 1; ; page++) {
    const { itens, total } = await buscar(page, LIMITE_MAXIMO)
    todos.push(...itens)
    if (itens.length === 0 || todos.length >= total) return todos
  }
}

export const todasInstituicoes = () =>
  buscarTodos((page, limit) =>
    instituicoesApi.listar({ page, limit }).then((r) => ({ itens: r.instituicoes, total: r.total })),
  )

export const todosCursos = (instituicaoId: Uuid) =>
  buscarTodos((page, limit) =>
    cursosApi.listar({ page, limit, instituicaoId }).then((r) => ({ itens: r.cursos, total: r.total })),
  )

export const todasDisciplinas = (instituicaoId: Uuid) =>
  buscarTodos((page, limit) =>
    disciplinasApi
      .listar({ page, limit, instituicaoId })
      .then((r) => ({ itens: r.disciplinas, total: r.total })),
  )
