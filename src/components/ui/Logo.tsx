import { Link } from 'react-router'

interface LogoProps {
  para?: string
  altura?: number
  // fundo branco atrás da logo, pra usar em fundo escuro
  placa?: boolean
}

export function Logo({ para = '/', altura = 40, placa = false }: LogoProps) {
  return (
    <Link to={para} className={`logo${placa ? ' logo--placa' : ''}`}>
      <img src="/logo-unifacol.png" alt="UNIFACOL — página inicial" height={altura} />
    </Link>
  )
}
