import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import type { TipoUsuario } from '../api/types'
import { Carregando } from '../components/ui'
import { paginaInicial } from './paginaInicial'
import { useAuth } from './useAuth'

interface Props {
  children: ReactNode
  /** Perfis aceitos. Sem isso, basta estar logado. */
  perfis?: TipoUsuario[]
}

export function RequireAuth({ children, perfis }: Props) {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return <Carregando tela />
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />
  if (perfis && !perfis.includes(usuario.tipoUsuario)) return <Navigate to={paginaInicial(usuario)} replace />
  return <>{children}</>
}
