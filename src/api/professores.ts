import { buscarTodos } from './catalogo'
import { http } from './client'
import type {
  AvaliacaoInput,
  AvaliacaoListItem,
  PageQuery,
  Professor,
  ProfessorCriado,
  ProfessorDetalhe,
  Titulacao,
  Uuid,
  VinculoDisciplina,
  VinculoInstituicao,
} from './types'

export interface FiltroProfessores extends PageQuery {
  nome?: string
  instituicaoId?: Uuid
  cursoId?: Uuid
  disciplinaId?: Uuid
}

export const professoresApi = {
  listar: (q: FiltroProfessores = {}) =>
    http.get<{ professores: Professor[]; total: number }>('/api/professores', { ...q }),
  /** Perfil com médias. */
  obter: (id: Uuid) => http.get<ProfessorDetalhe>(`/api/professores/${id}`),
  /** Admin. Retorna o ID do usuário criado. E-mail repetido: 409. */
  criar: (body: { name: string; email: string; password: string }) =>
    http.post<ProfessorCriado>('/api/professores', body),
  /** Admin ou o próprio professor. */
  atualizar: (id: Uuid, body: { biografia?: string; titulacao?: Titulacao }) =>
    http.patch<Omit<Professor, 'usuario' | 'instituicoes' | 'disciplinas'>>(
      `/api/professores/${id}`,
      body,
    ),
  /** Admin. Desativa o professor e o usuário vira COMUM. */
  desativar: (id: Uuid) => http.delete(`/api/professores/${id}`),

  // ----- Vínculos -----
  instituicoes: (professorId: Uuid) =>
    http.get<VinculoInstituicao[]>(`/api/professores/${professorId}/instituicoes`),
  vincularInstituicao: (professorId: Uuid, body: { instituicaoId: Uuid; departamento?: string }) =>
    http.post<VinculoInstituicao>(`/api/professores/${professorId}/instituicoes`, body),
  atualizarVinculoInstituicao: (professorId: Uuid, instituicaoId: Uuid, departamento: string) =>
    http.patch<VinculoInstituicao>(
      `/api/professores/${professorId}/instituicoes/${instituicaoId}`,
      { departamento },
    ),
  /** Remove também as disciplinas do professor nessa instituição. */
  desvincularInstituicao: (professorId: Uuid, instituicaoId: Uuid) =>
    http.delete(`/api/professores/${professorId}/instituicoes/${instituicaoId}`),

  disciplinas: (professorId: Uuid) =>
    http.get<VinculoDisciplina[]>(`/api/professores/${professorId}/disciplinas`),
  /** 400 se o professor não atua na instituição da disciplina. */
  vincularDisciplina: (professorId: Uuid, disciplinaId: Uuid) =>
    http.post<VinculoDisciplina>(`/api/professores/${professorId}/disciplinas`, { disciplinaId }),
  desvincularDisciplina: (professorId: Uuid, disciplinaId: Uuid) =>
    http.delete(`/api/professores/${professorId}/disciplinas/${disciplinaId}`),

  // ----- Avaliações recebidas -----
  avaliacoes: (professorId: Uuid, q: PageQuery & { disciplinaId?: Uuid } = {}) =>
    http.get<{ avaliacoes: AvaliacaoListItem[]; total: number }>(
      `/api/professores/${professorId}/avaliacoes`,
      { ...q },
    ),
}

/**
 * A API não tem rota "meu professor": percorre a listagem até achar o registro do usuário.
 * Se o back-end ganhar algo como GET /api/professores/me, troque por ela.
 */
export async function buscarProfessorDoUsuario(usuarioId: Uuid): Promise<Professor | null> {
  const todos = await buscarTodos((page, limit) =>
    professoresApi.listar({ page, limit }).then((r) => ({ itens: r.professores, total: r.total })),
  )
  return todos.find((p) => p.usuarioId === usuarioId) ?? null
}

/** Todas as avaliações recebidas por um professor (percorre as páginas). */
export const todasAvaliacoes = (professorId: Uuid) =>
  buscarTodos((page, limit) =>
    professoresApi.avaliacoes(professorId, { page, limit }).then((r) => ({ itens: r.avaliacoes, total: r.total })),
  )

let criteriosCache: Promise<{ id: Uuid; nome: string }[]> | null = null

/**
 * Critérios ativos de avaliação.
 * A API não tem rota que liste critérios e `media.porCriterio` vem vazio para quem nunca foi
 * avaliado; então pega os critérios do primeiro professor que já tenha avaliações.
 * Se o back-end ganhar algo como GET /api/criterios, troque por ela.
 */
export function buscarCriteriosAtivos(): Promise<{ id: Uuid; nome: string }[]> {
  criteriosCache ??= (async () => {
    const todos = await buscarTodos((page, limit) =>
      professoresApi.listar({ page, limit }).then((r) => ({ itens: r.professores, total: r.total })),
    )
    for (const p of todos) {
      const { media } = await professoresApi.obter(p.id)
      if (media.porCriterio.length > 0) return media.porCriterio.map((c) => ({ id: c.criterioId, nome: c.nome }))
    }
    return []
  })().catch((err: unknown) => {
    criteriosCache = null
    throw err
  })
  return criteriosCache
}

export const avaliacoesApi = {
  /** Só ALUNO. 409 se já avaliou esse professor nessa disciplina. */
  criar: (body: AvaliacaoInput) => http.post<unknown>('/api/avaliacoes', body),
  /** Só o dono, até 24h depois de criar. */
  atualizar: (id: Uuid, body: Partial<Omit<AvaliacaoInput, 'professorId' | 'disciplinaId'>>) =>
    http.patch<unknown>(`/api/avaliacoes/${id}`, body),
  remover: (id: Uuid) => http.delete(`/api/avaliacoes/${id}`),
}
