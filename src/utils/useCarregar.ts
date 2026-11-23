import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { ApiError } from '../api/client'

interface Estado<T> {
  dados: T | undefined
  erro: ApiError | Error | null
  carregando: boolean
}

// descarta a resposta antiga se as deps mudarem no meio
export function useCarregar<T>(carregar: () => Promise<T>, deps: DependencyList) {
  const [estado, setEstado] = useState<Estado<T>>({ dados: undefined, erro: null, carregando: true })
  const versao = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = useCallback(carregar, deps)

  const executar = useCallback(async () => {
    const minha = ++versao.current
    setEstado((s) => ({ ...s, carregando: true, erro: null }))
    try {
      const dados = await fn()
      if (minha === versao.current) setEstado({ dados, erro: null, carregando: false })
    } catch (e) {
      if (minha === versao.current)
        setEstado((s) => ({ ...s, erro: e instanceof Error ? e : new Error(String(e)), carregando: false }))
    }
  }, [fn])

  useEffect(() => {
    void executar()
  }, [executar])

  return { ...estado, recarregar: executar, setDados: (d: T) => setEstado((s) => ({ ...s, dados: d })) }
}
