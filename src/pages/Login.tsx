import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, mensagemDeErro } from '../api/client'
import { paginaInicial } from '../auth/paginaInicial'
import { useAuth } from '../auth/useAuth'
import { IconVoltar } from '../components/icons'
import { Alerta, Campo, Carregando, Logo } from '../components/ui'

type Modo = 'entrar' | 'cadastrar'

export function Login() {
  const { usuario, carregando, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const modo: Modo = params.get('modo') === 'cadastro' ? 'cadastrar' : 'entrar'
  const destino = (location.state as { de?: string } | null)?.de

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<{ msg: string; detalhes?: string[] } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aviso = params.get('aviso')

  if (carregando) return <Carregando tela />
  if (usuario) return <Navigate to={destino ?? paginaInicial(usuario)} replace />

  function trocarModo(novo: Modo) {
    setErro(null)
    const p = new URLSearchParams(params)
    p.delete('aviso')
    if (novo === 'cadastrar') p.set('modo', 'cadastro')
    else p.delete('modo')
    setParams(p, { replace: true })
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const me = await entrar(email.trim(), senha)
        navigate(destino ?? paginaInicial(me), { replace: true })
      } else {
        await authApi.signUp({ name: nome.trim(), email: email.trim(), password: senha })
        navigate(`/verificar-email?email=${encodeURIComponent(email.trim())}`)
      }
    } catch (err) {
      if (modo === 'entrar' && err instanceof ApiError && err.status === 401) {
        setErro({ msg: 'E-mail ou senha inválidos.' })
      } else if (err instanceof ApiError && err.status === 409) {
        setErro({ msg: 'Este e-mail já está cadastrado.' })
      } else {
        setErro({ msg: mensagemDeErro(err), detalhes: err instanceof ApiError ? err.details : undefined })
      }
    } finally {
      setEnviando(false)
    }
  }

  const linkVerificar = `/verificar-email${email ? `?email=${encodeURIComponent(email.trim())}` : ''}`

  return (
    <div className="auth-split">
      <section className="auth-hero">
        <div className="auth-hero__topo">
          <Link to="/" className="voltar-inicio">
            <IconVoltar /> Voltar ao início
          </Link>
          <img src="/logo-facolsi.jpg" alt="FacolSI — Sistemas de Informação UNIFACOL" className="logo-facolsi" width={140} height={140} />
        </div>
        <div>
          <h1>
            Avalie seus professores. <span>Escolha melhor suas turmas.</span>
          </h1>
          <p>
            Notas por critério, como didática e clareza, dadas por quem assistiu às aulas, em cada
            instituição e disciplina.
          </p>
        </div>
        <div className="auth-hero__tags">
          <span>Instituições</span>
          <span>Cursos</span>
          <span>Disciplinas</span>
          <span>Professores</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <Logo para="/" altura={80} />
          <div className="segmented" role="group" aria-label="Escolha uma opção">
            <button type="button" aria-pressed={modo === 'entrar'} onClick={() => trocarModo('entrar')}>
              Entrar
            </button>
            <button type="button" aria-pressed={modo === 'cadastrar'} onClick={() => trocarModo('cadastrar')}>
              Criar conta
            </button>
          </div>

          <div>
            <h2>{modo === 'entrar' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
            <p className="muted" style={{ fontSize: 15 }}>
              {modo === 'entrar'
                ? 'Entre com o e-mail e a senha da sua conta.'
                : 'Depois do cadastro enviaremos um código para confirmar seu e-mail.'}
            </p>
          </div>

          {aviso === 'verificado' && <Alerta tipo="ok">E-mail confirmado. Agora é só entrar.</Alerta>}
          {aviso === 'senha' && <Alerta tipo="ok">Senha atualizada. Entre com a nova senha.</Alerta>}

          <form className="form" onSubmit={onSubmit}>
            {modo === 'cadastrar' && (
              <Campo label="Nome completo">
                {(id) => (
                  <input
                    id={id}
                    className="input input--lg"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    required
                  />
                )}
              </Campo>
            )}
            <Campo label="E-mail">
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
            <Campo
              label="Senha"
              extra={modo === 'entrar' ? <Link to="/recuperar-senha">Esqueci minha senha</Link> : undefined}
            >
              {(id) => (
                <input
                  id={id}
                  type="password"
                  className="input input--lg"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  required
                />
              )}
            </Campo>

            {erro && <Alerta detalhes={erro.detalhes}>{erro.msg}</Alerta>}

            <button type="submit" className="btn btn--dark btn--lg btn--block" disabled={enviando}>
              {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="muted" style={{ fontSize: 14, textAlign: 'center' }}>
            Ainda não confirmou seu e-mail? <Link to={linkVerificar}>Inserir código</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
