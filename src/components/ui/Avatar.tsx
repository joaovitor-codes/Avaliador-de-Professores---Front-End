import { iniciais } from '../../utils/format'

export function Avatar({ nome, tamanho = 'md' }: { nome: string; tamanho?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`avatar avatar--${tamanho}`} aria-hidden="true">
      {iniciais(nome)}
    </span>
  )
}
