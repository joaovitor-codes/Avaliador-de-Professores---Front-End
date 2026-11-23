import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/layout/AdminLayout'
import { AdminCursos } from './pages/admin/AdminCursos'
import { AdminInstituicoes } from './pages/admin/AdminInstituicoes'
import { AdminProfessores } from './pages/admin/AdminProfessores'
import { AdminVinculos } from './pages/admin/AdminVinculos'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
