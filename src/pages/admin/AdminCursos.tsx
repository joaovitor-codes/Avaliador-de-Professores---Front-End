import { useState, type SubmitEvent } from 'react'
import { useSearchParams } from 'react-router'
import { cursosApi, disciplinasApi, todasInstituicoes } from '../../api/catalogo'
import { ApiError, mensagemDeErro } from '../../api/client'
import type { Curso, Disciplina, Grau, Uuid } from '../../api/types'
import { Alerta, Campo, Carregando, Modal, RodapeTabela } from '../../components/ui'
import { GRAUS, opcional } from '../../utils/format'
import { useCarregar } from '../../utils/useCarregar'


const POR_PAGINA = 20

type Erro = { msg: string; detalhes?: string[] } | null
const paraErro = (err: unknown): Erro => ({
  msg: mensagemDeErro(err),
  detalhes: err instanceof ApiError ? err.details : undefined,
})

function ModalCurso({
  instituicaoId,
  curso,
  onFechar,
  onSalvo,
}: {
  instituicaoId: Uuid
  curso: Curso | null
  onFechar: () => void
  onSalvo: () => void
}) {
  const [nome, setNome] = useState(curso?.nome ?? '')
  const [grau, setGrau] = useState<Grau | ''>(curso?.grau ?? '')
  const [erro, setErro] = useState<Erro>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!grau) return
    setErro(null)
    setEnviando(true)
    try {
      if (curso) await cursosApi.atualizar(curso.id, { nome: nome.trim(), grau })
      else await cursosApi.criar({ instituicaoId, nome: nome.trim(), grau })
      onSalvo()
    } catch (err) {
      setErro(paraErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={curso ? 'Editar curso' : 'Novo curso'} onFechar={onFechar}>
      <form className="form" onSubmit={onSubmit}>
        <Campo label="Nome" obrigatorio>
          {(id) => <input id={id} className="input" value={nome} onChange={(e) => setNome(e.target.value)} required />}
        </Campo>
        <Campo label="Grau" obrigatorio>
          {(id) => (
            <select id={id} className="select" value={grau} onChange={(e) => setGrau(e.target.value as Grau)} required>
              <option value="">Selecione</option>
              {Object.entries(GRAUS).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          )}
        </Campo>
        {erro && <Alerta detalhes={erro.detalhes}>{erro.msg}</Alerta>}
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ModalDisciplina({
  instituicaoId,
  disciplina,
  onFechar,
  onSalvo,
}: {
  instituicaoId: Uuid
  disciplina: Disciplina | null
  onFechar: () => void
  onSalvo: () => void
}) {
  const [nome, setNome] = useState(disciplina?.nome ?? '')
  const [codigo, setCodigo] = useState(disciplina?.codigo ?? '')
  const [carga, setCarga] = useState(disciplina?.cargaHoraria?.toString() ?? '')
  const [erro, setErro] = useState<Erro>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const corpo = {
      nome: nome.trim(),
      codigo: opcional(codigo),
      cargaHoraria: carga.trim() === '' ? undefined : Number(carga),
    }
    try {
      if (disciplina) await disciplinasApi.atualizar(disciplina.id, corpo)
      else await disciplinasApi.criar({ ...corpo, instituicaoId })
      onSalvo()
    } catch (err) {
      setErro(paraErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={disciplina ? 'Editar disciplina' : 'Nova disciplina'} onFechar={onFechar}>
      <form className="form" onSubmit={onSubmit}>
        <Campo label="Nome" obrigatorio>
          {(id) => <input id={id} className="input" value={nome} onChange={(e) => setNome(e.target.value)} required />}
        </Campo>
        <div className="row">
          <Campo label="Código" className="grow">
            {(id) => (
              <input
                id={id}
                className="input"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex.: INF0123"
              />
            )}
          </Campo>
          <Campo label="Carga horária (h)" className="grow">
            {(id) => (
              <input
                id={id}
                type="number"
                min={1}
                className="input"
                value={carga}
                onChange={(e) => setCarga(e.target.value)}
              />
            )}
          </Campo>
        </div>
        {erro && <Alerta detalhes={erro.detalhes}>{erro.msg}</Alerta>}
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function TabelaCursos({ instituicaoId }: { instituicaoId: Uuid }) {
  const [pagina, setPagina] = useState(1)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState<{ curso: Curso | null } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const lista = useCarregar(
    () => cursosApi.listar({ instituicaoId, page: pagina, limit: POR_PAGINA }),
    [instituicaoId, pagina, versao],
  )

  async function excluir(c: Curso) {
    if (!window.confirm(`Excluir o curso "${c.nome}"?`)) return
    setErro(null)
    try {
      await cursosApi.remover(c.id)
      setVersao((v) => v + 1)
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  return (
    <section className="card card--flush metade">
      <div className="card__head">
        <h2 className="card__title">
          Cursos {lista.dados && <span className="muted" style={{ fontWeight: 500 }}>· {lista.dados.total}</span>}
        </h2>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setModal({ curso: null })}>
          Novo curso
        </button>
      </div>
      {erro && (
        <div style={{ padding: '0 20px 16px' }}>
          <Alerta>{erro}</Alerta>
        </div>
      )}
      {lista.erro ? (
        <div style={{ padding: 20 }}>
          <Alerta>{mensagemDeErro(lista.erro)}</Alerta>
        </div>
      ) : !lista.dados ? (
        <Carregando />
      ) : lista.dados.cursos.length === 0 ? (
        <p className="empty">Nenhum curso nesta instituição.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Grau</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.dados.cursos.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.nome}</td>
                  <td>
                    <span className="badge badge--square">{GRAUS[c.grau]}</span>
                  </td>
                  <td className="acoes">
                    <button type="button" className="btn--text" onClick={() => setModal({ curso: c })}>
                      Editar
                    </button>
                    <button type="button" className="btn--text" onClick={() => excluir(c)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RodapeTabela pagina={pagina} porPagina={POR_PAGINA} total={lista.dados?.total ?? 0} onChange={setPagina} />
      {modal && (
        <ModalCurso
          instituicaoId={instituicaoId}
          curso={modal.curso}
          onFechar={() => setModal(null)}
          onSalvo={() => {
            setModal(null)
            setVersao((v) => v + 1)
          }}
        />
      )}
    </section>
  )
}

function TabelaDisciplinas({ instituicaoId }: { instituicaoId: Uuid }) {
  const [pagina, setPagina] = useState(1)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState<{ disciplina: Disciplina | null } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const lista = useCarregar(
    () => disciplinasApi.listar({ instituicaoId, page: pagina, limit: POR_PAGINA }),
    [instituicaoId, pagina, versao],
  )

  async function excluir(d: Disciplina) {
    if (!window.confirm(`Excluir a disciplina "${d.nome}"?`)) return
    setErro(null)
    try {
      await disciplinasApi.remover(d.id)
      setVersao((v) => v + 1)
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  return (
    <section className="card card--flush metade">
      <div className="card__head">
        <h2 className="card__title">
          Disciplinas{' '}
          {lista.dados && <span className="muted" style={{ fontWeight: 500 }}>· {lista.dados.total}</span>}
        </h2>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setModal({ disciplina: null })}>
          Nova disciplina
        </button>
      </div>
      {erro && (
        <div style={{ padding: '0 20px 16px' }}>
          <Alerta>{erro}</Alerta>
        </div>
      )}
      {lista.erro ? (
        <div style={{ padding: 20 }}>
          <Alerta>{mensagemDeErro(lista.erro)}</Alerta>
        </div>
      ) : !lista.dados ? (
        <Carregando />
      ) : lista.dados.disciplinas.length === 0 ? (
        <p className="empty">Nenhuma disciplina nesta instituição.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th style={{ textAlign: 'right' }}>Carga</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.dados.disciplinas.map((d) => (
                <tr key={d.id}>
                  <td className="muted" style={{ fontSize: 14 }}>
                    {d.codigo ?? '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{d.nome}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {d.cargaHoraria !== null ? `${d.cargaHoraria} h` : '—'}
                  </td>
                  <td className="acoes">
                    <button type="button" className="btn--text" onClick={() => setModal({ disciplina: d })}>
                      Editar
                    </button>
                    <button type="button" className="btn--text" onClick={() => excluir(d)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RodapeTabela pagina={pagina} porPagina={POR_PAGINA} total={lista.dados?.total ?? 0} onChange={setPagina} />
      {modal && (
        <ModalDisciplina
          instituicaoId={instituicaoId}
          disciplina={modal.disciplina}
          onFechar={() => setModal(null)}
          onSalvo={() => {
            setModal(null)
            setVersao((v) => v + 1)
          }}
        />
      )}
    </section>
  )
}

export function AdminCursos() {
  const [params, setParams] = useSearchParams()
  const instituicoes = useCarregar(() => todasInstituicoes(), [])
  const instituicaoId = params.get('instituicao') ?? instituicoes.dados?.[0]?.id ?? ''

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cursos e disciplinas</h1>
          <p className="page-subtitle">Sempre ligados a uma instituição.</p>
        </div>
        <Campo label="Instituição">
          {(id) => (
            <select
              id={id}
              className="select"
              style={{ minWidth: 320 }}
              value={instituicaoId}
              disabled={!instituicoes.dados?.length}
              onChange={(e) => setParams({ instituicao: e.target.value }, { replace: true })}
            >
              {instituicoes.dados?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sigla ? `${i.sigla} — ${i.nome}` : i.nome}
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>

      {instituicoes.erro ? (
        <Alerta>{mensagemDeErro(instituicoes.erro)}</Alerta>
      ) : instituicoes.carregando ? (
        <Carregando />
      ) : !instituicaoId ? (
        <div className="card empty">Cadastre uma instituição primeiro.</div>
      ) : (
        <div className="admin-grid" key={instituicaoId}>
          <TabelaCursos instituicaoId={instituicaoId} />
          <TabelaDisciplinas instituicaoId={instituicaoId} />
        </div>
      )}
    </div>
  )
}
