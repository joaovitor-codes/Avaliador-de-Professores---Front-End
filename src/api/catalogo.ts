import { http } from './client'
import type { Instituicao, InstituicaoInput, PageQuery, Uuid } from './types'

export const instituicoesApi = {
  listar: (q: PageQuery & { nome?: string } = {}) =>
    http.get<{ instituicoes: Instituicao[]; total: number }>('/api/instituicoes', { ...q }),
  obter: (id: Uuid) => http.get<Instituicao>(`/api/instituicoes/${id}`),
  criar: (body: InstituicaoInput) => http.post<Instituicao>('/api/instituicoes', body),
  atualizar: (id: Uuid, body: Partial<InstituicaoInput>) =>
    http.patch<Instituicao>(`/api/instituicoes/${id}`, body),
  remover: (id: Uuid) => http.delete(`/api/instituicoes/${id}`),
}