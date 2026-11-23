import { useRef, useState } from 'react'

export interface DicaDados {
  x: number
  y: number
  valor: string
  titulo: string
  detalhe?: string
}

export function useDica() {
  const ref = useRef<HTMLDivElement>(null)
  const [dica, setDica] = useState<DicaDados | null>(null)

  function mostrar(alvo: Element | { x: number; y: number }, conteudo: Omit<DicaDados, 'x' | 'y'>) {
    const caixa = ref.current?.getBoundingClientRect()
    if (!caixa) return
    if (alvo instanceof Element) {
      const r = alvo.getBoundingClientRect()
      setDica({ ...conteudo, x: r.left - caixa.left + r.width / 2, y: r.top - caixa.top })
    } else setDica({ ...conteudo, ...alvo })
  }

  return { ref, dica, mostrar, esconder: () => setDica(null) }
}
