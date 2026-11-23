import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, mensagemDeErro } from '../api/client'
import { professoresApi } from '../api/professores'
import type { Professor, Titulacao } from '../api/types'
import { ComMeuProfessor } from '../components/professor/ComMeuProfessor'
import { IconVoltar } from '../components/icons'
import { Alerta, Campo } from '../components/ui'
import { VinculosEditor } from '../components/professor/VinculosEditor'
import { TITULACOES } from '../utils/format'

type Status = { tipo: 'ok' | 'erro'; msg: string; detalhes?: string[] } | null

function DadosPublicos({ professor }: { professor: Professor }) {
  const [titulacao, setTitulacao] = useState<Titulacao | ''>(professor.titulacao ?? '')
  const [biografia, setBiografia] = useState(professor.biografia ?? '')
  const [status, setStatus] = useState<Status>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setStatus(null)
    setEnviando(true)
    try {
      await professoresApi.atualizar(professor.id, {
        titulacao: titulacao || undefined,
        biografia: biografia.trim(),
      })
      setStatus({ tipo: 'ok', msg: 'Alterações salvas.' })
    } catch (err) {
      setStatus({ tipo: 'erro', msg: mensagemDeErro(err), detalhes: err instanceof ApiError ? err.details : undefined })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2 className="card__title">Dados públicos</h2>
      <Campo label="Titulação">
        {(id) => (
          <select
            id={id}
            className="select"
            value={titulacao}
            onChange={(e) => setTitulacao(e.target.value as Titulacao)}
          >
            {!professor.titulacao && <option value="">Selecione</option>}
            {Object.entries(TITULACOES).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo label="Biografia">
        {(id) => (
          <textarea
            id={id}
            className="textarea"
            rows={6}
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
          />
        )}
      </Campo>
      {status && (
        <Alerta tipo={status.tipo} detalhes={status.detalhes}>
          {status.msg}
        </Alerta>
      )}
      <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }} disabled={enviando}>
        {enviando ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}

export function AlterarSenha() {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setStatus(null)
    setEnviando(true)
    try {
      await authApi.resetPassword({ currentPassword: atual, newPassword: nova })
      setAtual('')
      setNova('')
      setStatus({ tipo: 'ok', msg: 'Senha atualizada.' })
    } catch (err) {
      setStatus({
        tipo: 'erro',
        msg: err instanceof ApiError && err.status === 401 ? 'Senha atual incorreta.' : mensagemDeErro(err),
        detalhes: err instanceof ApiError ? err.details : undefined,
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2 className="card__title">Alterar senha</h2>
      <Campo label="Senha atual">
        {(id) => (
          <input
            id={id}
            type="password"
            className="input"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            autoComplete="current-password"
            required
          />
        )}
      </Campo>
      <Campo label="Nova senha">
        {(id) => (
          <input
            id={id}
            type="password"
            className="input"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            autoComplete="new-password"
            required
          />
        )}
      </Campo>
      {status && (
        <Alerta tipo={status.tipo} detalhes={status.detalhes}>
          {status.msg}
        </Alerta>
      )}
      <button type="submit" className="btn btn--secondary" style={{ alignSelf: 'flex-start' }} disabled={enviando}>
        {enviando ? 'Atualizando…' : 'Atualizar senha'}
      </button>
    </form>
  )
}

export function EditarPerfil() {
  return (
    <ComMeuProfessor>
      {(p) => (
        <main className="container stack">
          <Link to="/meu-perfil" className="link-back">
            <IconVoltar /> Voltar para o painel
          </Link>
          <div className="page-header">
            <div>
              <h1 className="page-title">Editar perfil</h1>
              <p className="page-subtitle">O que alunos veem na sua página pública.</p>
            </div>
            <Link to={`/professores/${p.id}`} className="btn btn--secondary">
              Ver página pública
            </Link>
          </div>

          <div className="duas-colunas">
            <section className="card lateral" style={{ gap: 18 }}>
              <DadosPublicos professor={p} />
              <hr className="divider" />
              <AlterarSenha />
            </section>
            <div className="principal stack">
              <VinculosEditor professorId={p.id} proprio />
            </div>
          </div>
        </main>
      )}
    </ComMeuProfessor>
  )
}
