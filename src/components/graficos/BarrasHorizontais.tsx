import { Dica } from './Dica'
import { useDica } from './useDica'

export interface ItemBarra {
  id: string
  rotulo: string
  sub?: string
  valor: number | null
  valorTexto: string
  detalhe: string
}

export function BarrasHorizontais({ itens, max = 5 }: { itens: ItemBarra[]; max?: number }) {
  const { ref, dica, mostrar, esconder } = useDica()
  const ticks = Array.from({ length: max + 1 }, (_, i) => i)

  return (
    <div className="barras" ref={ref} onMouseLeave={esconder}>
      {itens.map((item) => {
        const pct = ((item.valor ?? 0) / max) * 100
        const abrir = (el: Element) =>
          mostrar(el.querySelector('.barras__barra') ?? el, {
            valor: item.valorTexto,
            titulo: item.rotulo,
            detalhe: item.detalhe,
          })
        return (
          <div
            key={item.id}
            className="barras__linha"
            tabIndex={0}
            aria-label={`${item.rotulo}: ${item.valorTexto}. ${item.detalhe}`}
            onMouseEnter={(e) => abrir(e.currentTarget)}
            onFocus={(e) => abrir(e.currentTarget)}
            onBlur={esconder}
          >
            <span className="barras__rotulo">
              {item.rotulo}
              {item.sub && <small>{item.sub}</small>}
            </span>
            <span className="barras__trilho">
              <span className="barras__barra" style={{ width: `${pct}%` }} />
              <span className="barras__valor" style={{ left: `calc(${pct}% + 8px)` }}>
                {item.valorTexto}
              </span>
            </span>
          </div>
        )
      })}
      <div className="barras__eixo" aria-hidden="true">
        <span />
        <span className="barras__ticks">
          {ticks.map((t) => (
            <span key={t} style={{ left: `${(t / max) * 100}%` }}>
              {t}
            </span>
          ))}
        </span>
      </div>
      <Dica dica={dica} />
    </div>
  )
}
