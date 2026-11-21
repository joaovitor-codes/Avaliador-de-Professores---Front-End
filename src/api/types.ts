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

interface Timestamps {
  createdAt: IsoDate
  updatedAt: IsoDate
  deletedAt: IsoDate | null
}

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

export interface PageQuery {
  page?: number
  limit?: number
}