import { useEffect, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { todasInstituicoes } from '../../api/catalogo'
import { ApiError, mensagemDeErro } from '../../api/client'
import { professoresApi } from '../../api/professores'
import type { Professor } from '../../api/types'
import { IconBusca } from '../../components/icons'
import { Alerta, Campo, Carregando, RodapeTabela } from '../../components/ui'
import { TITULACOES } from '../../utils/format'
import { useCarregar } from '../../utils/useCarregar'

const POR_PAGINA = 20

function CadastrarProfessor({ onCriado }: { onCriado: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroEmail, setErroEmail] = useState<string | null>(null)
  const [erro, setErro] = useState<{ msg: string; detalhes?: string[] } | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setErro(null)
    setErroEmail(null)
    setSucesso(null)
    setEnviando(true)
    try {
      const criado = await professoresApi.criar({ name: nome.trim(), email: email.trim(), password: senha })
      setSucesso(`Conta criada para ${criado.email}.`)
      setNome('')
      setEmail('')
      setSenha('')
      onCriado()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setErroEmail('Este e-mail já está cadastrado.')
      else setErro({ msg: mensagemDeErro(err), detalhes: err instanceof ApiError ? err.details : undefined })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section aria-label="Cadastrar professor" className="card painel">
      <h2 className="card__title">Cadastrar professor</h2>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
        Cria a conta de acesso. Titulação, biografia e vínculos podem ser preenchidos depois, pelo próprio professor.
      </p>
      <form className="form" style={{ gap: 16 }} onSubmit={onSubmit}>
        <Campo label="Nome completo" obrigatorio>
          {(id) => <input id={id} className="input" value={nome} onChange={(e) => setNome(e.target.value)} required />}
        </Campo>
        <Campo label="E-mail" obrigatorio erro={erroEmail}>
          {(id, describedBy) => (
            <input
              id={id}
              type="email"
              className="input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErroEmail(null)
              }}
              aria-invalid={erroEmail ? true : undefined}
              aria-describedby={describedBy}
              required
            />
          )}
        </Campo>
        <Campo label="Senha provisória" obrigatorio>
          {(id) => (
            <input
              id={id}
              type="password"
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
            />
          )}
        </Campo>
        {erro && <Alerta detalhes={erro.detalhes}>{erro.msg}</Alerta>}
        {sucesso && <Alerta tipo="ok">{sucesso}</Alerta>}
        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? 'Cadastrando…' : 'Cadastrar'}
        </button>
      </form>
    </section>
  )
}

export function AdminProfessores() {
  const [busca, setBusca] = useState('')
  const [nome, setNome] = useState('')
  const [instituicaoId, setInstituicaoId] = useState('')
  const [pagina, setPagina] = useState(1)
  const [versao, setVersao] = useState(0)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setNome(busca.trim())
      setPagina(1)
    }, 350)
    return () => clearTimeout(t)
  }, [busca])

  const instituicoes = useCarregar(() => todasInstituicoes(), [])
  const lista = useCarregar(
    () =>
      professoresApi.listar({
        page: pagina,
        limit: POR_PAGINA,
        nome: nome || undefined,
        instituicaoId: instituicaoId || undefined,
      }),
    [pagina, nome, instituicaoId, versao],
  )

  async function desativar(p: Professor) {
    if (
      !window.confirm(
        `Desativar ${p.usuario.nome}? O perfil de professor é removido e a conta passa a ser de usuário comum.`,
      )
    )
      return
    setErroAcao(null)
    try {
      await professoresApi.desativar(p.id)
      setVersao((v) => v + 1)
    } catch (err) {
      setErroAcao(mensagemDeErro(err))
    }
  }

  return (
    <div className="admin-grid">
      <section className="principal">
        <div className="page-header">
          <div>
            <h1 className="page-title">Professores</h1>
            <p className="page-subtitle">E-mails visíveis só para administradores.</p>
          </div>
          <div className="toolbar" style={{ flex: '0 1 520px' }}>
            <div className="search">
              <label htmlFor="busca-prof" className="sr-only">
                Filtrar por nome
              </label>
              <IconBusca />
              <input
                id="busca-prof"
                type="search"
                className="input"
                placeholder="Filtrar por nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <label htmlFor="filtro-inst" className="sr-only">
              Instituição
            </label>
            <select
              id="filtro-inst"
              className="select"
              style={{ width: 'auto', flex: '0 1 220px' }}
              value={instituicaoId}
              onChange={(e) => {
                setInstituicaoId(e.target.value)
                setPagina(1)
              }}
            >
              <option value="">Todas as instituições</option>
              {instituicoes.dados?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sigla ?? i.nome}
                </option>
              ))}
            </select>
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
          ) : lista.dados.professores.length === 0 ? (
            <p className="empty">Nenhum professor encontrado.</p>
          ) : (
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>Professor</th>
                    <th>Titulação</th>
                    <th>Instituições</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.dados.professores.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link
                          to={`/professores/${p.id}`}
                          style={{ display: 'block', fontWeight: 500, color: 'var(--text)', textDecoration: 'none' }}
                        >
                          {p.usuario.nome}
                        </Link>
                        {p.usuario.conta?.email && <span className="muted small">{p.usuario.conta.email}</span>}
                      </td>
                      <td>{p.titulacao ? TITULACOES[p.titulacao] : '—'}</td>
                      <td style={{ color: 'var(--text-2)' }}>
                        {p.instituicoes.map((v) => v.instituicao.sigla ?? v.instituicao.nome).join(', ') || '—'}
                      </td>
                      <td className="acoes">
                        <Link to={`/admin/professores/${p.id}`} className="btn--text" style={{ textDecoration: 'none' }}>
                          Vínculos
                        </Link>
                        <button type="button" className="btn--text" onClick={() => desativar(p)}>
                          Desativar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <RodapeTabela pagina={pagina} porPagina={POR_PAGINA} total={lista.dados?.total ?? 0} onChange={setPagina} />
        </div>
        <p className="muted small">Desativar remove o perfil de professor e a conta passa a ser de usuário comum.</p>
      </section>

      <CadastrarProfessor onCriado={() => setVersao((v) => v + 1)} />
    </div>
  )
}
