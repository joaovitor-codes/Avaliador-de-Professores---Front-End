import { useRef, useState, type ClipboardEvent, type SubmitEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError, mensagemDeErro } from '../api/client'
import { paginaInicial } from '../auth/paginaInicial'
import { useAuth } from '../auth/useAuth'
import { AuthSimples } from '../components/layout/AuthSimples'
import { IconEmail } from '../components/icons'
import { Alerta, Campo } from '../components/ui'

const DIGITOS = 6

export function VerificarEmail() {
  const [params] = useSearchParams()
  const emailDaUrl = params.get('email') ?? ''
  const { recarregar } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState(emailDaUrl)
  const [codigo, setCodigo] = useState<string[]>(Array(DIGITOS).fill(''))
  const [erro, setErro] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function preencher(inicio: number, texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, DIGITOS - inicio).split('')
    if (digitos.length === 0) return
    setCodigo((atual) => {
      const novo = [...atual]
      digitos.forEach((d, i) => (novo[inicio + i] = d))
      return novo
    })
    inputs.current[Math.min(inicio + digitos.length, DIGITOS - 1)]?.focus()
  }

  function onChange(i: number, valor: string) {
    if (valor === '') {
      setCodigo((atual) => atual.map((d, j) => (j === i ? '' : d)))
      return
    }
    preencher(i, valor)
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && codigo[i] === '' && i > 0) {
      e.preventDefault()
      setCodigo((atual) => atual.map((d, j) => (j === i - 1 ? '' : d)))
      inputs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < DIGITOS - 1) {
      inputs.current[i + 1]?.focus()
    }
  }

  function onPaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    preencher(i, e.clipboardData.getData('text'))
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    const code = codigo.join('')
    setErro(null)
    setInfo(null)
    if (code.length !== DIGITOS) {
      setErro('Digite os 6 dígitos do código.')
      return
    }
    setEnviando(true)
    try {
      await authApi.verifyEmail({ email: email.trim(), code })
      // o cadastro já deixa logado, então segue direto
      const me = await recarregar()
      if (me) navigate(paginaInicial(me), { replace: true })
      else navigate(`/login?aviso=verificado&email=${encodeURIComponent(email.trim())}`, { replace: true })
    } catch (err) {
      setErro(mensagemDeErro(err, 'Código inválido ou expirado.'))
    } finally {
      setEnviando(false)
    }
  }

  async function reenviar() {
    setErro(null)
    setInfo(null)
    if (!email.trim()) {
      setErro('Informe o e-mail da conta.')
      return
    }
    setReenviando(true)
    try {
      const { message } = await authApi.resendEmailVerification(email.trim())
      setInfo(message)
    } catch (err) {
      if (err instanceof ApiError && err.status === 429)
        setErro('Você atingiu o limite de 3 reenvios em 15 minutos. Tente novamente mais tarde.')
      else setErro(mensagemDeErro(err))
    } finally {
      setReenviando(false)
    }
  }

  return (
    <AuthSimples>
      <form className="card verify-card" onSubmit={onSubmit}>
        <div className="verify-icon">
          <IconEmail />
        </div>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 600, marginBottom: 10 }}>Confirme seu e-mail</h1>
          {emailDaUrl ? (
            <p className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
              Enviamos um código de 6 dígitos para <strong style={{ color: 'var(--text)' }}>{emailDaUrl}</strong>.
            </p>
          ) : (
            <p className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
              Informe o e-mail da conta e o código de 6 dígitos que enviamos.
            </p>
          )}
        </div>

        {!emailDaUrl && (
          <div style={{ textAlign: 'left' }}>
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
          </div>
        )}

        <fieldset className="plain">
          <legend className="sr-only">Código de verificação</legend>
          <div className="code-inputs">
            {codigo.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el
                }}
                aria-label={`Dígito ${i + 1}`}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={DIGITOS}
                value={d}
                onChange={(e) => onChange(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={(e) => onPaste(i, e)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        </fieldset>

        {erro && <Alerta>{erro}</Alerta>}
        {info && <Alerta tipo="ok">{info}</Alerta>}

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={enviando}>
          {enviando ? 'Verificando…' : 'Verificar e-mail'}
        </button>

        <div className="muted" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          <span>
            Não recebeu?{' '}
            <button type="button" className="btn--text" style={{ padding: 0, fontWeight: 600 }} onClick={reenviar} disabled={reenviando}>
              {reenviando ? 'Reenviando…' : 'Reenviar código'}
            </button>
          </span>
          <span className="small">Limite de 3 reenvios a cada 15 minutos.</span>
        </div>

        <Link to="/login" style={{ fontSize: 14 }}>
          Voltar para o login
        </Link>
      </form>
    </AuthSimples>
  )
}
