import { useState, type KeyboardEvent } from 'react'
import { useLargura } from './useLargura'

export interface PontoLinha {
  rotulo: string
  valor: number | null
  valorTexto: string
  detalhe: string
}

export function Linha({ pontos, min = 1, max = 5, altura = 240 }: { pontos: PontoLinha[]; min?: number; max?: number; altura?: number }) {
  const [medidor, largura] = useLargura<HTMLDivElement>()
  const [ativo, setAtivo] = useState<number | null>(null)
  const m = { esq: 30, dir: 44, topo: 16, base: 30 }
  const larguraPlot = Math.max(0, largura - m.esq - m.dir)
  const alturaPlot = altura - m.topo - m.base
  const n = pontos.length

  const x = (i: number) => m.esq + (n === 1 ? larguraPlot / 2 : (i * larguraPlot) / (n - 1))
  const y = (v: number) => m.topo + ((max - v) / (max - min)) * alturaPlot
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  // mês sem avaliação quebra a linha
  const trechos: { i: number; v: number }[][] = []
  pontos.forEach((p, i) => {
    if (p.valor === null) return
    const anterior = trechos[trechos.length - 1]
    if (anterior && anterior[anterior.length - 1].i === i - 1) anterior.push({ i, v: p.valor })
    else trechos.push([{ i, v: p.valor }])
  })

  // pula alguns rótulos do eixo X pra não ficarem um em cima do outro
  const passo = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(larguraPlot / 56))))
  const ultimoComValor = [...pontos.keys()].reverse().find((i) => pontos[i].valor !== null)

  function apontar(clientX: number, alvo: SVGRectElement) {
    const r = alvo.getBoundingClientRect()
    const rel = clientX - r.left
    const i = n === 1 ? 0 : Math.round((rel / r.width) * (n - 1))
    setAtivo(Math.min(n - 1, Math.max(0, i)))
  }

  function teclado(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') setAtivo((a) => Math.min(n - 1, (a ?? -1) + 1))
    else if (e.key === 'ArrowLeft') setAtivo((a) => Math.max(0, (a ?? n) - 1))
    else return
    e.preventDefault()
  }

  const pontoAtivo = ativo !== null ? pontos[ativo] : null

  return (
    <div className="linha" ref={medidor}>
      {largura > 0 && (
        <svg width={largura} height={altura} role="img" aria-label="Média mensal das notas">
          {ticks.map((t) => (
            <g key={t}>
              <line className="linha__grade" x1={m.esq} x2={largura - m.dir} y1={y(t)} y2={y(t)} />
              <text className="linha__tick" x={m.esq - 10} y={y(t)} dy="0.32em" textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {pontos.map((p, i) =>
            i % passo === 0 || i === n - 1 ? (
              <text key={p.rotulo} className="linha__tick" x={x(i)} y={altura - 8} textAnchor="middle">
                {p.rotulo}
              </text>
            ) : null,
          )}

          {ativo !== null && <line className="linha__mira" x1={x(ativo)} x2={x(ativo)} y1={m.topo} y2={m.topo + alturaPlot} />}

          {trechos.map((t, k) => (
            <polyline key={k} className="linha__traco" points={t.map((p) => `${x(p.i)},${y(p.v)}`).join(' ')} />
          ))}
          {pontos.map((p, i) =>
            p.valor === null ? null : (
              <circle key={i} className="linha__ponto" cx={x(i)} cy={y(p.valor)} r={ativo === i ? 6 : 4.5} />
            ),
          )}
          {ultimoComValor !== undefined && (
            <text
              className="linha__fim"
              x={x(ultimoComValor) + 10}
              y={y(pontos[ultimoComValor].valor ?? min)}
              dy="0.32em"
            >
              {pontos[ultimoComValor].valorTexto}
            </text>
          )}

          <rect
            className="linha__alvo"
            x={m.esq - 12}
            y={m.topo}
            width={larguraPlot + 24}
            height={alturaPlot}
            tabIndex={0}
            aria-label="Use as setas para percorrer os meses"
            onPointerMove={(e) => apontar(e.clientX, e.currentTarget)}
            onPointerLeave={() => setAtivo(null)}
            onFocus={() => setAtivo((a) => a ?? (ultimoComValor ?? 0))}
            onBlur={() => setAtivo(null)}
            onKeyDown={teclado}
          />
        </svg>
      )}
      {pontoAtivo && ativo !== null && (
        <div
          className="dica"
          style={{ left: x(ativo), top: pontoAtivo.valor !== null ? y(pontoAtivo.valor) - 6 : m.topo }}
          role="status"
        >
          <strong>{pontoAtivo.valorTexto}</strong>
          <span>{pontoAtivo.rotulo}</span>
          <span className="dica__detalhe">{pontoAtivo.detalhe}</span>
        </div>
      )}
    </div>
  )
}
