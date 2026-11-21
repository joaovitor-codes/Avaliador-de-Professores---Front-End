import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { TIPOS_USUARIO } from '../utils/format'
import { Avatar } from './ui'

/** Avatar + nome no canto direito da barra, com menu (perfil, sair). */
export function MenuUsuario() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [aberto])

  if (!usuario) return null

  return (
    <div
      className="user-menu"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setAberto(false)
      }}
    >
      <button
        type="button"
        className="user-menu__button"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-label={`Menu de ${usuario.nome}`}
        onClick={() => setAberto((a) => !a)}
      >
        <Avatar nome={usuario.nome} tamanho="sm" />
        <span className="user-menu__nome">{usuario.nome}</span>
      </button>
      {aberto && (
        <div className="user-menu__dropdown">
          <div className="user-menu__info">
            <strong>{usuario.nome}</strong>
            {TIPOS_USUARIO[usuario.tipoUsuario]} · {usuario.conta.email}
          </div>
          <button
            type="button"
            onClick={async () => {
              await sair()
              navigate('/login', { replace: true })
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
