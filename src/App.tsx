import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/layout/AdminLayout'
import { SiteLayout } from './components/layout/SiteLayout'
import { AdminCursos } from './pages/admin/AdminCursos'
import { AdminInstituicoes } from './pages/admin/AdminInstituicoes'
import { AdminProfessores } from './pages/admin/AdminProfessores'
import { AdminVinculos } from './pages/admin/AdminVinculos'
import { Login } from './pages/Login'
import { VerificarEmail } from './pages/VerificarEmail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />

          {/* Aluno e professor */}
          <Route
            element={
              <RequireAuth>
                <SiteLayout />
              </RequireAuth>
            }
          >
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
