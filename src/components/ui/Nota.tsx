import { IconEstrela } from '../icons'

export function Nota({ valor, grande = false }: { valor: string; grande?: boolean }) {
  return (
    <span className={`nota${grande ? ' nota--xl' : ''}`}>
      <IconEstrela size={grande ? 28 : 20} />
      <span>{valor}</span>
    </span>
  )
}
