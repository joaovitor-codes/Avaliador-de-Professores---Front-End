// Tipos espelhando as respostas documentadas em "Rotas da API — Sistema de Avaliação de Professores".

export type Uuid = string
export type IsoDate = string

export type TipoUsuario = 'COMUM' | 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR'

export type Grau =
  | 'TECNICO'
  | 'TECNOLOGO'
  | 'LICENCIATURA'
  | 'BACHARELADO'
  | 'POS_GRADUACAO'
  | 'MESTRADO'
  | 'DOUTORADO'

export type Titulacao = 'GRADUADO' | 'ESPECIALISTA' | 'MESTRE' | 'DOUTOR' | 'POS_DOUTOR'

interface Timestamps {
  createdAt: IsoDate
  updatedAt: IsoDate
  deletedAt: IsoDate | null
}

// ---------- Auth ----------

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface MessageResponse {
  message: string
}

export interface Conta extends Timestamps {
  id: Uuid
  email: string
  emailVerificado: boolean
  emailVerificadoEm: IsoDate | null
  ativo: boolean
}

export interface Usuario extends Timestamps {
  id: Uuid
  contaId: Uuid
  nome: string
  tipoUsuario: TipoUsuario
  dataNascimento: IsoDate | null
  fotoPerfilUrl: string | null
  conta: Conta
}

// ---------- Catálogo ----------

export interface Instituicao extends Timestamps {
  id: Uuid
  nome: string
  sigla: string | null
  cidade: string | null
  estado: string | null
  logoUrl: string | null
}

export interface InstituicaoInput {
  nome: string
  sigla?: string
  cidade?: string
  estado?: string
  logoUrl?: string
}

export interface Curso extends Timestamps {
  id: Uuid
  instituicaoId: Uuid
  nome: string
  grau: Grau
}

export interface Disciplina extends Timestamps {
  id: Uuid
  instituicaoId: Uuid
  nome: string
  codigo: string | null
  cargaHoraria: number | null
}

export interface DisciplinaInput {
  nome: string
  codigo?: string
  cargaHoraria?: number
}

// ---------- Professores ----------

export interface CriterioMedia {
  criterioId: Uuid
  nome: string
  media: number | null
  avaliacoes: number
}

export interface MediaProfessor {
  /** null enquanto o professor não tem avaliação. */
  geral: number | null
  totalAvaliacoes: number
  porCriterio: CriterioMedia[]
}

export interface Professor {
  id: Uuid
  usuarioId: Uuid
  titulacao: Titulacao | null
  biografia: string | null
  usuario: {
    id: Uuid
    nome: string
    /** Só vem para ADMINISTRADOR. */
    conta?: { email: string }
  }
  instituicoes: {
    departamento: string | null
    instituicao: { id: Uuid; nome: string; sigla: string | null }
  }[]
  disciplinas: {
    disciplina: { id: Uuid; nome: string; codigo: string | null }
  }[]
  /** Na lista a documentação não traz médias; no detalhe (GET /:id) sempre vem. */
  media?: MediaProfessor
}

export interface ProfessorDetalhe extends Professor {
  media: MediaProfessor
}

export interface ProfessorCriado {
  /** ID do usuário criado (não do professor). */
  id: Uuid
  email: string
}

export interface VinculoInstituicao {
  id: Uuid
  professorId: Uuid
  instituicaoId: Uuid
  departamento: string | null
  createdAt: IsoDate
  instituicao: Instituicao
}

export interface VinculoDisciplina {
  id: Uuid
  professorId: Uuid
  disciplinaId: Uuid
  createdAt: IsoDate
  disciplina: Disciplina
}

// ---------- Avaliações ----------

export interface NotaInput {
  criterioId: Uuid
  /** 1 a 5 */
  nota: number
}

export interface AvaliacaoInput {
  professorId: Uuid
  disciplinaId: Uuid
  notas: NotaInput[]
  anonima?: boolean
  comentario?: string
  recomendaria?: boolean
}

export interface AvaliacaoListItem {
  id: Uuid
  anonima: boolean
  comentario: string | null
  recomendaria: boolean | null
  createdAt: IsoDate
  updatedAt: IsoDate
  /** null em avaliação anônima. */
  aluno: { id: Uuid; nome: string } | null
  disciplina: { id: Uuid; nome: string; codigo: string | null }
  notas: { nota: number; criterio: { id: Uuid; nome: string } }[]
  /** true quando a avaliação é do usuário logado. */
  propria: boolean
}

// ---------- Paginação ----------

export interface PageQuery {
  page?: number
  limit?: number
}
