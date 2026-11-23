import { useEffect, useState, type SubmitEvent } from 'react'
import { instituicoesApi } from '../../api/catalogo'
import { ApiError, mensagemDeErro } from '../../api/client'
import type { Instituicao, InstituicaoInput } from '../../api/types'
import { IconBusca, IconFechar, IconMais } from '../../components/icons'
import { Alerta, Campo, Carregando, RodapeTabela } from '../../components/ui'
import { opcional, plural, UFS } from '../../utils/format'
import { useCarregar } from '../../utils/useCarregar'

const POR_PAGINA = 20

interface PainelProps {
  instituicao: Instituicao | null
  onFechar: () => void
  onSalvo: () => void
}

function PainelInstituicao({ instituicao, onFechar, onSalvo }: PainelProps) {
  const [form, setForm] = useState({
    nome: instituicao?.nome ?? '',
    sigla: instituicao?.sigla ?? '',
    estado: instituicao?.estado ?? '',
    cidade: instituicao?.cidade ?? '',
    logoUrl: instituicao?.logoUrl ?? '',
  })
  const [erro, setErro] = useState<{ msg: string; detalhes?: string[] } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const set = (campo: keyof typeof form) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }))

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const corpo: InstituicaoInput = {
      nome: form.nome.trim(),
      sigla: opcional(form.sigla),
      cidade: opcional(form.cidade),
      estado: opcional(form.estado),
      logoUrl: opcional(form.logoUrl),
    }
    try {
      if (instituicao) await instituicoesApi.atualizar(instituicao.id, corpo)
      else await instituicoesApi.criar(corpo)
      onSalvo()
    } catch (err) {
      setErro({ msg: mensagemDeErro(err), detalhes: err instanceof ApiError ? err.details : undefined })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section aria-label={instituicao ? 'Editar instituição' : 'Nova instituição'} className="card painel">
      <div className="card__head">
        <h2 className="card__title">{instituicao ? 'Editar instituição' : 'Nova instituição'}</h2>
        <button type="button" className="btn--icon" aria-label="Fechar" onClick={onFechar}>
          <IconFechar />
        </button>
      </div>
      <form className="form" style={{ gap: 16 }} onSubmit={onSubmit}>
        <Campo label="Nome" obrigatorio>
          {(id) => (
            <input id={id} className="input" value={form.nome} onChange={(e) => set('nome')(e.target.value)} required />
          )}
        </Campo>
        <div className="row">
          <Campo label="Sigla" className="grow">
            {(id) => <input id={id} className="input" value={form.sigla} onChange={(e) => set('sigla')(e.target.value)} />}
          </Campo>
          <Campo label="Estado (UF)" className="grow">
            {(id) => (
              <select id={id} className="select" value={form.estado} onChange={(e) => set('estado')(e.target.value)}>
                <option value="">—</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>
        <Campo label="Cidade">
          {(id) => <input id={id} className="input" value={form.cidade} onChange={(e) => set('cidade')(e.target.value)} />}
        </Campo>
        <Campo label="URL do logo">
          {(id) => (
            <input
              id={id}
              type="url"
              className="input"
              placeholder="https://"
              value={form.logoUrl}
              onChange={(e) => set('logoUrl')(e.target.value)}
            />
          )}
        </Campo>
        {erro && <Alerta detalhes={erro.detalhes}>{erro.msg}</Alerta>}
        <div className="row">
          <button type="submit" className="btn btn--primary grow" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar'}
          </button>
          <button type="button" className="btn btn--secondary grow" onClick={onFechar}>
            Cancelar
          </button>
        </div>
      </form>
      {instituicao && (
        <div className="alert">
          <span>
            <strong style={{ display: 'block', fontWeight: 600 }}>Excluir instituição</strong>
            Os cursos e disciplinas dela também serão removidos.
          </span>
        </div>
      )}
    </section>
  )
}

export function AdminInstituicoes() {
  const [busca, setBusca] = useState('')
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(1)
  const [versao, setVersao] = useState(0)
  const [painel, setPainel] = useState<{ instituicao: Instituicao | null } | null>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setNome(busca.trim())
      setPagina(1)
    }, 350)
    return () => clearTimeout(t)
  }, [busca])

  const lista = useCarregar(
    () => instituicoesApi.listar({ page: pagina, limit: POR_PAGINA, nome: nome || undefined }),
    [pagina, nome, versao],
  )

  async function excluir(i: Instituicao) {
    if (!window.confirm(`Excluir "${i.nome}"? Os cursos e disciplinas dela também serão removidos.`)) return
    setErroAcao(null)
    try {
      await instituicoesApi.remover(i.id)
      if (painel?.instituicao?.id === i.id) setPainel(null)
      setVersao((v) => v + 1)
    } catch (err) {
      setErroAcao(mensagemDeErro(err))
    }
  }

  const total = lista.dados?.total ?? 0

  return (
    <div className="admin-grid">
      <section className="principal">
        <div className="page-header">
          <div>
            <h1 className="page-title">Instituições</h1>
            <p className="page-subtitle">{lista.dados ? `${plural(total, 'cadastrada', 'cadastradas')}` : ' '}</p>
          </div>
          <div className="toolbar" style={{ flex: '0 1 460px' }}>
            <div className="search">
              <label htmlFor="busca-inst" className="sr-only">
                Filtrar por nome
              </label>
              <IconBusca />
              <input
                id="busca-inst"
                type="search"
                className="input"
                placeholder="Filtrar por nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn--primary" onClick={() => setPainel({ instituicao: null })}>
              <IconMais /> Nova instituição
            </button>
          </div>
        </div>

        {erroAcao && <Alerta>{erroAcao}</Alerta>}

        <div className="card card--flush">
          {lista.erro ? (
            <div style={{ padding: 20 }}>
              <Alerta>{mensagemDeErro(lista.erro)}</Alerta>
            </div>
          ) : !lista.dados ? (
            <Carregando />
          ) : lista.dados.instituicoes.length === 0 ? (
            <p className="empty">Nenhuma instituição encontrada.</p>
          ) : (
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Sigla</th>
                    <th>Cidade / UF</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.dados.instituicoes.map((i) => (
                    <tr key={i.id} className={painel?.instituicao?.id === i.id ? 'selecionada' : undefined}>
                      <td style={{ fontWeight: 500 }}>{i.nome}</td>
                      <td>{i.sigla ?? '—'}</td>
                      <td style={{ color: 'var(--text-2)' }}>{[i.cidade, i.estado].filter(Boolean).join(' / ') || '—'}</td>
                      <td className="acoes">
                        <button type="button" className="btn--text" onClick={() => setPainel({ instituicao: i })}>
                          Editar
                        </button>
                        <button type="button" className="btn--text" onClick={() => excluir(i)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <RodapeTabela pagina={pagina} porPagina={POR_PAGINA} total={total} onChange={setPagina} />
        </div>
      </section>

      {painel && (
        <PainelInstituicao
          key={painel.instituicao?.id ?? 'nova'}
          instituicao={painel.instituicao}
          onFechar={() => setPainel(null)}
          onSalvo={() => {
            setPainel(null)
            setVersao((v) => v + 1)
          }}
        />
      )}
    </div>
  )
}
