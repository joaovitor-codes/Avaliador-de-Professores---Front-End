import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { todasDisciplinas, todasInstituicoes, todosCursos } from '../api/catalogo'
import { mensagemDeErro } from '../api/client'
import { professoresApi } from '../api/professores'
import type { Professor } from '../api/types'
import { IconBusca } from '../components/icons'
import { Alerta, Avatar, Campo, Carregando, Nota, Paginacao } from '../components/ui'
import { formatarNota, GRAUS, plural, TITULACOES } from '../utils/format'
import { useCarregar } from '../utils/useCarregar'

const POR_PAGINA = 20

function CartaoProfessor({ p }: { p: Professor }) {
  const local = p.instituicoes
    .map((v) => [v.instituicao.sigla ?? v.instituicao.nome, v.departamento].filter(Boolean).join(' · '))
    .join(' / ')

  return (
    <Link to={`/professores/${p.id}`} className="prof-card">
      <Avatar nome={p.usuario.nome} />
      <span className="prof-card__body">
        <span className="prof-card__name">
          {p.usuario.nome}
          {p.titulacao && <span className="badge">{TITULACOES[p.titulacao]}</span>}
        </span>
        {local && <span className="muted" style={{ fontSize: 14 }}>{local}</span>}
        {p.disciplinas.length > 0 && (
          <span className="tags" style={{ marginTop: 2 }}>
            {p.disciplinas.map(({ disciplina }) => (
              <span key={disciplina.id} className="tag">
                {disciplina.nome}
              </span>
            ))}
          </span>
        )}
      </span>
      {p.media && (
        <span className="prof-card__nota">
          {p.media.geral !== null ? (
            <>
              <Nota valor={formatarNota(p.media.geral)} />
              <span className="muted small" style={{ display: 'block' }}>
                {plural(p.media.totalAvaliacoes, 'avaliação', 'avaliações')}
              </span>
            </>
          ) : (
            <span className="muted" style={{ fontSize: 14 }}>
              Sem avaliações
            </span>
          )}
        </span>
      )}
    </Link>
  )
}

export function Professores() {
  const [params, setParams] = useSearchParams()
  const nome = params.get('nome') ?? ''
  const instituicaoId = params.get('instituicao') ?? ''
  const cursoId = params.get('curso') ?? ''
  const disciplinaId = params.get('disciplina') ?? ''
  const pagina = Math.max(1, Number(params.get('pagina')) || 1)

  const [busca, setBusca] = useState(nome)

  function atualizar(mudancas: Record<string, string>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    if (!('pagina' in mudancas)) p.delete('pagina')
    setParams(p, { replace: true })
  }

  // espera parar de digitar pra não chamar a api a cada tecla
  useEffect(() => {
    if (busca.trim() === nome) return
    const t = setTimeout(() => atualizar({ nome: busca.trim() }), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  const instituicoes = useCarregar(() => todasInstituicoes(), [])
  const cursos = useCarregar(
    () => (instituicaoId ? todosCursos(instituicaoId) : Promise.resolve([])),
    [instituicaoId],
  )
  const disciplinas = useCarregar(
    () => (instituicaoId ? todasDisciplinas(instituicaoId) : Promise.resolve([])),
    [instituicaoId],
  )

  const resultado = useCarregar(
    () =>
      professoresApi.listar({
        page: pagina,
        limit: POR_PAGINA,
        nome: nome || undefined,
        instituicaoId: instituicaoId || undefined,
        cursoId: cursoId || undefined,
        disciplinaId: disciplinaId || undefined,
      }),
    [pagina, nome, instituicaoId, cursoId, disciplinaId],
  )

  const total = resultado.dados?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const temFiltro = Boolean(nome || instituicaoId || cursoId || disciplinaId)

  return (
    <main className="container">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Professores</h1>
          <p className="page-subtitle">Encontre um professor por nome, instituição, curso ou disciplina.</p>
        </div>
        <div className="search" style={{ flex: '0 1 440px', minWidth: 260 }}>
          <label htmlFor="busca" className="sr-only">
            Buscar por nome
          </label>
          <IconBusca />
          <input
            id="busca"
            type="search"
            className="input input--lg"
            placeholder="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="layout-filtros">
        <aside aria-label="Filtros" className="card filtros">
          <div className="card__head">
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Filtros</h2>
            <button
              type="button"
              className="btn--text"
              style={{ padding: '8px 0' }}
              disabled={!temFiltro}
              onClick={() => {
                setBusca('')
                setParams(new URLSearchParams(), { replace: true })
              }}
            >
              Limpar
            </button>
          </div>

          <Campo label="Instituição">
            {(id) => (
              <select
                id={id}
                className="select"
                value={instituicaoId}
                onChange={(e) => atualizar({ instituicao: e.target.value, curso: '', disciplina: '' })}
              >
                <option value="">Todas</option>
                {instituicoes.dados?.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.sigla ? `${i.sigla} — ${i.nome}` : i.nome}
                  </option>
                ))}
              </select>
            )}
          </Campo>

          <Campo label="Curso">
            {(id) => (
              <select
                id={id}
                className="select"
                value={cursoId}
                disabled={!instituicaoId}
                onChange={(e) => atualizar({ curso: e.target.value })}
              >
                <option value="">Todos</option>
                {cursos.dados?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({GRAUS[c.grau]})
                  </option>
                ))}
              </select>
            )}
          </Campo>

          <Campo label="Disciplina">
            {(id) => (
              <select
                id={id}
                className="select"
                value={disciplinaId}
                disabled={!instituicaoId}
                onChange={(e) => atualizar({ disciplina: e.target.value })}
              >
                <option value="">Todas</option>
                {disciplinas.dados?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.codigo ? `${d.nome} — ${d.codigo}` : d.nome}
                  </option>
                ))}
              </select>
            )}
          </Campo>

          <p className="muted small" style={{ lineHeight: 1.5 }}>
            Cursos e disciplinas listados são os da instituição selecionada.
          </p>
        </aside>

        <section aria-label="Resultados" className="resultados">
          {resultado.erro ? (
            <Alerta>{mensagemDeErro(resultado.erro, 'Não foi possível carregar os professores.')}</Alerta>
          ) : resultado.carregando && !resultado.dados ? (
            <Carregando />
          ) : (
            <>
              <div className="resultados__resumo" aria-live="polite">
                <span>
                  <strong>{plural(total, 'professor', 'professores')}</strong>{' '}
                  {total === 1 ? 'encontrado' : 'encontrados'}
                </span>
                {total > 0 && (
                  <span>
                    Página {pagina} de {totalPaginas}
                  </span>
                )}
              </div>

              {resultado.dados?.professores.length === 0 ? (
                <div className="card empty">Nenhum professor encontrado com esses filtros.</div>
              ) : (
                resultado.dados?.professores.map((p) => <CartaoProfessor key={p.id} p={p} />)
              )}

              <Paginacao
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={(p) => {
                  atualizar({ pagina: String(p) })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
