import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { canAccessField, canAccessWarehouse, useAuth } from './lib/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { Inventory } from './pages/Inventory'
import { Receiving } from './pages/Receiving'
import { CycleCounting } from './pages/CycleCounting'
import { Slotting } from './pages/Slotting'
import { Palletization } from './pages/Palletization'
import { Catalog } from './pages/Catalog'
import { Surveys } from './pages/Surveys'
import { PosManagement } from './pages/PosManagement'
import { Planogram } from './pages/Planogram'
import { Login } from './pages/Login'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-slate-500">
        Checking session…
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}

function RequireWarehouse({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  if (!canAccessWarehouse(role)) return <Navigate to="/" replace />
  return children
}

function RequireField({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  if (!canAccessField(role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="inventory"
          element={
            <RequireWarehouse>
              <Inventory />
            </RequireWarehouse>
          }
        />
        <Route
          path="receiving"
          element={
            <RequireWarehouse>
              <Receiving />
            </RequireWarehouse>
          }
        />
        <Route
          path="cycle-counting"
          element={
            <RequireWarehouse>
              <CycleCounting />
            </RequireWarehouse>
          }
        />
        <Route
          path="slotting"
          element={
            <RequireWarehouse>
              <Slotting />
            </RequireWarehouse>
          }
        />
        <Route
          path="palletization"
          element={
            <RequireWarehouse>
              <Palletization />
            </RequireWarehouse>
          }
        />
        <Route
          path="catalog"
          element={
            <RequireField>
              <Catalog />
            </RequireField>
          }
        />
        <Route
          path="surveys"
          element={
            <RequireField>
              <Surveys />
            </RequireField>
          }
        />
        <Route
          path="pos"
          element={
            <RequireField>
              <PosManagement />
            </RequireField>
          }
        />
        <Route
          path="planogram"
          element={
            <RequireField>
              <Planogram />
            </RequireField>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
