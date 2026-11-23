export function Carregando({ tela = false }: { tela?: boolean }) {
  return (
    <div className={`loading${tela ? ' loading--tela' : ''}`} role="status">
      <span className="spinner" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
