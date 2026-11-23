import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { paginaInicial } from '../../auth/paginaInicial'
import { useAuth } from '../../auth/useAuth'
import { AppBar } from './AppBar'

const classeNav = ({ isActive }: { isActive: boolean }) => `navlink${isActive ? ' active' : ''}`

export function SiteLayout() {
  const { usuario } = useAuth()
  const [navAberta, setNavAberta] = useState(false)
  const fechar = () => setNavAberta(false)

  return (
    <div className="page">
      <AppBar
        logoPara={paginaInicial(usuario)}
        onMenu={() => setNavAberta((a) => !a)}
        menuAberto={navAberta}
        controla="nav-principal"
        menuSoNoCelular
      >
        <nav id="nav-principal" aria-label="Principal" className={`appbar__nav${navAberta ? ' aberta' : ''}`}>
          {usuario?.tipoUsuario === 'ADMINISTRADOR' && (
            <NavLink to="/admin" className={classeNav} onClick={fechar}>
              Administração
            </NavLink>
          )}
          {usuario?.tipoUsuario === 'PROFESSOR' && (
            <NavLink to="/meu-perfil" className={classeNav} onClick={fechar}>
              Meu painel
            </NavLink>
          )}
          <NavLink to="/professores" className={classeNav} onClick={fechar}>
            Professores
          </NavLink>
        </nav>
      </AppBar>
      <Outlet />
    </div>
  )
}
