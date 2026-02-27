'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children, requiredRole = 'customer' }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    console.log('user:', user, 'role:', role)  // 👈 add this

    if (!user) { router.replace('/auth'); return }
    if (requiredRole === 'admin' && role !== 'admin') { router.replace('/'); return }
  }, [user, role, loading])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--grey)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return null
  if (requiredRole === 'admin' && role !== 'admin') return null

  return children
}