import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, mensagemDeErro } from '../api/client'
import { AuthSimples } from '../components/layout/AuthSimples'
import { Alerta, Campo } from '../components/ui'

export function RecuperarSenha() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [pedido, setPedido] = useState<{ enviando: boolean; msg: string | null; erro: string | null }>({
    enviando: false,
    msg: null,
    erro: null,
  })

  const [token, setToken] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState<{ enviando: boolean; erro: string | null; detalhes?: string[] }>({
    enviando: false,
    erro: null,
  })

  async function pedirCodigo(e: SubmitEvent) {
    e.preventDefault()
    setPedido({ enviando: true, msg: null, erro: null })
    try {
      const { message } = await authApi.requestPasswordReset(email.trim())
      setPedido({ enviando: false, msg: message, erro: null })
    } catch (err) {
      setPedido({ enviando: false, msg: null, erro: mensagemDeErro(err) })
    }
  }

  async function definirSenha(e: SubmitEvent) {
    e.preventDefault()
    setConfirmacao({ enviando: true, erro: null })
    try {
      await authApi.confirmPasswordReset({ token: token.trim(), newPassword: novaSenha })
      navigate('/login?aviso=senha', { replace: true })
    } catch (err) {
      setConfirmacao({
        enviando: false,
        erro: mensagemDeErro(err, 'Código inválido ou expirado.'),
        detalhes: err instanceof ApiError ? err.details : undefined,
      })
    }
  }

  return (
    <AuthSimples>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 34, fontWeight: 600, marginBottom: 8 }}>Recuperar senha</h1>
        <p className="muted" style={{ fontSize: 15 }}>
          Duas etapas: pedir o código e definir a nova senha.
        </p>
      </div>

      <div className="auth-steps">
        <form className="card" onSubmit={pedirCodigo}>
          <div className="step-title">
            <span className="step-number">1</span>
            <h2 className="card__title">Pedir código</h2>
          </div>
          <Campo label="E-mail da conta">
            {(id) => (
              <input
                id={id}
                type="email"
                className="input input--lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            )}
          </Campo>
          <button type="submit" className="btn btn--primary btn--lg" disabled={pedido.enviando}>
            {pedido.enviando ? 'Enviando…' : 'Enviar código'}
          </button>
          {pedido.msg && <Alerta tipo="ok">{pedido.msg}</Alerta>}
          {pedido.erro && <Alerta>{pedido.erro}</Alerta>}
        </form>

        <form className="card" onSubmit={definirSenha}>
          <div className="step-title">
            <span className="step-number">2</span>
            <h2 className="card__title">Definir nova senha</h2>
          </div>
          <Campo label="Código recebido">
            {(id) => (
              <input
                id={id}
                className="input input--lg"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole o código do e-mail"
                autoComplete="one-time-code"
                required
              />
            )}
          </Campo>
          <Campo label="Nova senha">
            {(id) => (
              <input
                id={id}
                type="password"
                className="input input--lg"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
                required
              />
            )}
          </Campo>
          {confirmacao.erro && <Alerta detalhes={confirmacao.detalhes}>{confirmacao.erro}</Alerta>}
          <button type="submit" className="btn btn--dark btn--lg" disabled={confirmacao.enviando}>
            {confirmacao.enviando ? 'Salvando…' : 'Salvar e voltar ao login'}
          </button>
        </form>
      </div>

      <Link to="/login" style={{ fontSize: 14 }}>
        Voltar para o login
      </Link>
    </AuthSimples>
  )
}
