import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { AppBar } from './AppBar'
import { IconExterno, IconLivro, IconPessoas, IconPredio } from './icons'

const classeNav = ({ isActive }: { isActive: boolean }) => `navlink${isActive ? ' active' : ''}`
const ehCelular = () => window.matchMedia('(max-width: 720px)').matches

export function AdminLayout() {
  // No computador o ☰ recolhe o menu lateral; no celular ele abre o menu por cima do conteúdo.
  const [recolhido, setRecolhido] = useState(false)
  const [abertoCelular, setAbertoCelular] = useState(false)
  const fecharCelular = () => setAbertoCelular(false)

  return (
    <div className="admin-shell">
      <AppBar
        logoPara="/admin"
        etiqueta="Admin"
        controla="menu-admin"
        menuAberto={ehCelular() ? abertoCelular : !recolhido}
        onMenu={() => (ehCelular() ? setAbertoCelular((a) => !a) : setRecolhido((r) => !r))}
      />
      <div className="admin-body">
        <aside
          id="menu-admin"
          className={`admin-sidebar${recolhido ? ' recolhido' : ''}${abertoCelular ? ' aberto' : ''}`}
        >
          <nav aria-label="Administração">
            <NavLink to="/admin/instituicoes" className={classeNav} onClick={fecharCelular}>
              <IconPredio /> Instituições
            </NavLink>
            <NavLink to="/admin/cursos" className={classeNav} onClick={fecharCelular}>
              <IconLivro /> Cursos e disciplinas
            </NavLink>
            <NavLink to="/admin/professores" className={classeNav} onClick={fecharCelular}>
              <IconPessoas /> Professores
            </NavLink>
            <NavLink to="/professores" className="navlink">
              <IconExterno /> Ver site
            </NavLink>
          </nav>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
