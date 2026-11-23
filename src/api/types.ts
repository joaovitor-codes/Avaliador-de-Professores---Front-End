export type Uuid = string
export type IsoDate = string

export type TipoUsuario = 'COMUM' | 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR'

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