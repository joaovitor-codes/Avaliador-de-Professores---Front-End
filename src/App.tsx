import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/layout/AdminLayout'
import { SiteLayout } from './components/layout/SiteLayout'
import { AdminCursos } from './pages/admin/AdminCursos'
import { AdminInstituicoes } from './pages/admin/AdminInstituicoes'
import { AdminProfessores } from './pages/admin/AdminProfessores'
import { AdminVinculos } from './pages/admin/AdminVinculos'
import { Inicio } from './pages/Inicio'
import { Login } from './pages/Login'
import { PerfilProfessor } from './pages/PerfilProfessor'
import { Professores } from './pages/Professores'
import { RecuperarSenha } from './pages/RecuperarSenha'
import { VerificarEmail } from './pages/VerificarEmail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />

          {/* Aluno e professor */}
          <Route
            element={
              <RequireAuth>
                <SiteLayout />
              </RequireAuth>
            }
          >
            <Route path="/professores" element={<Professores />} />
            <Route path="/professores/:id" element={<PerfilProfessor />} />
          </Route>

          {/* Administrador */}
          <Route
            path="/admin"
            element={
              <RequireAuth perfis={['ADMINISTRADOR']}>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="instituicoes" replace />} />
            <Route path="instituicoes" element={<AdminInstituicoes />} />
            <Route path="cursos" element={<AdminCursos />} />
            <Route path="professores" element={<AdminProfessores />} />
            <Route path="professores/:id" element={<AdminVinculos />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
