import { useLayoutEffect, useRef, useState } from 'react'

export function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [largura, setLargura] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // mede logo no início, o ResizeObserver só avisa depois
    setLargura(el.getBoundingClientRect().width)
    const obs = new ResizeObserver(([e]) => setLargura(e.contentRect.width))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, largura] as const
}
