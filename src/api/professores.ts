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
  obter: (id: Uuid) => http.get<ProfessorDetalhe>(`/api/professores/${id}`),
  // retorna o id do usuário criado. e-mail repetido dá 409
  criar: (body: { name: string; email: string; password: string }) =>
    http.post<ProfessorCriado>('/api/professores', body),
  atualizar: (id: Uuid, body: { biografia?: string; titulacao?: Titulacao }) =>
    http.patch<Omit<Professor, 'usuario' | 'instituicoes' | 'disciplinas'>>(
      `/api/professores/${id}`,
      body,
    ),
  // o usuário volta a ser COMUM
  desativar: (id: Uuid) => http.delete(`/api/professores/${id}`),

  instituicoes: (professorId: Uuid) =>
    http.get<VinculoInstituicao[]>(`/api/professores/${professorId}/instituicoes`),
  vincularInstituicao: (professorId: Uuid, body: { instituicaoId: Uuid; departamento?: string }) =>
    http.post<VinculoInstituicao>(`/api/professores/${professorId}/instituicoes`, body),
  atualizarVinculoInstituicao: (professorId: Uuid, instituicaoId: Uuid, departamento: string) =>
    http.patch<VinculoInstituicao>(
      `/api/professores/${professorId}/instituicoes/${instituicaoId}`,
      { departamento },
    ),
  // remove as disciplinas dessa instituição também
  desvincularInstituicao: (professorId: Uuid, instituicaoId: Uuid) =>
    http.delete(`/api/professores/${professorId}/instituicoes/${instituicaoId}`),

  disciplinas: (professorId: Uuid) =>
    http.get<VinculoDisciplina[]>(`/api/professores/${professorId}/disciplinas`),
  vincularDisciplina: (professorId: Uuid, disciplinaId: Uuid) =>
    http.post<VinculoDisciplina>(`/api/professores/${professorId}/disciplinas`, { disciplinaId }),
  desvincularDisciplina: (professorId: Uuid, disciplinaId: Uuid) =>
    http.delete(`/api/professores/${professorId}/disciplinas/${disciplinaId}`),

  avaliacoes: (professorId: Uuid, q: PageQuery & { disciplinaId?: Uuid } = {}) =>
    http.get<{ avaliacoes: AvaliacaoListItem[]; total: number }>(
      `/api/professores/${professorId}/avaliacoes`,
      { ...q },
    ),
}

// não tem rota de "meu professor" na api, então procura na listagem
export async function buscarProfessorDoUsuario(usuarioId: Uuid): Promise<Professor | null> {
  const todos = await buscarTodos((page, limit) =>
    professoresApi.listar({ page, limit }).then((r) => ({ itens: r.professores, total: r.total })),
  )
  return todos.find((p) => p.usuarioId === usuarioId) ?? null
}

export const todasAvaliacoes = (professorId: Uuid) =>
  buscarTodos((page, limit) =>
    professoresApi.avaliacoes(professorId, { page, limit }).then((r) => ({ itens: r.avaliacoes, total: r.total })),
  )

let criteriosCache: Promise<{ id: Uuid; nome: string }[]> | null = null

// a api não lista os critérios, então pega do primeiro professor que já foi avaliado
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
  // só aluno. 409 se já avaliou nessa disciplina
  criar: (body: AvaliacaoInput) => http.post<unknown>('/api/avaliacoes', body),
  // só quem criou, até 24h depois
  atualizar: (id: Uuid, body: Partial<Omit<AvaliacaoInput, 'professorId' | 'disciplinaId'>>) =>
    http.patch<unknown>(`/api/avaliacoes/${id}`, body),
  remover: (id: Uuid) => http.delete(`/api/avaliacoes/${id}`),
}
