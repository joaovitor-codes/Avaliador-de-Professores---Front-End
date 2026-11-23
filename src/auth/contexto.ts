import { createContext } from 'react'
import type { Usuario } from '../api/types'

export interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<Usuario>
  sair: () => Promise<void>
  recarregar: () => Promise<Usuario | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
