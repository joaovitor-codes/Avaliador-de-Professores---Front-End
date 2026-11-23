import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { onSessaoExpirada } from '../api/client'
import type { Usuario } from '../api/types'
import { AuthContext } from './contexto'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  const recarregar = useCallback(async () => {
    try {
      const me = await authApi.me()
      setUsuario(me)
      return me
    } catch {
      setUsuario(null)
      return null
    }
  }, [])

  useEffect(() => {
    onSessaoExpirada(() => setUsuario(null))
    authApi
      .me()
      .then(setUsuario, () => setUsuario(null))
      .finally(() => setCarregando(false))
    return () => onSessaoExpirada(null)
  }, [])

  const entrar = useCallback(async (email: string, senha: string) => {
    await authApi.signIn({ email, password: senha })
    const me = await authApi.me()
    setUsuario(me)
    return me
  }, [])

  const sair = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUsuario(null)
    }
  }, [])

  const value = useMemo(
    () => ({ usuario, carregando, entrar, sair, recarregar }),
    [usuario, carregando, entrar, sair, recarregar],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
