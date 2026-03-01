'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/hooks/useWishlist'
import { logOut } from '@/services/authService'
import { useRouter } from 'next/navigation'

export default function Navbar({ onSearchToggle, searchOpen }) {
  const { itemCount, openCart } = useCart()
  const { user, role } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const { wishlist } = useWishlist()


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await logOut()
    setDropdownOpen(false)
    router.push('/')
  }

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Account'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: 'var(--nav-h)',
      background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link href="/" style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 3, color: 'var(--black)' }}>
        STR<span style={{ color: 'var(--accent)' }}>I</span>DE
      </Link>

      <ul style={{ display: 'flex', gap: 36 }}>
        {[['Shop', '/products'], ['AI Advisor', '/ai-advisor'], ['About', '/#about']].map(([label, href]) => (
          <li key={href}>
            <Link href={href} style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--black)'}
            >{label}</Link>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* Search */}
        <button onClick={onSearchToggle} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', color: searchOpen ? 'var(--accent)' : 'var(--black)', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* Wishlist */}
        {/* Wishlist */}
        <Link href="/profile?tab=wishlist" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', color: 'var(--black)', position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {wishlist.length > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: 'white', width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {wishlist.length}
            </span>
          )}
        </Link>
        {/* Cart */}
        <button onClick={openCart} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--black)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Cart
          <span style={{ background: 'var(--accent)', color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {itemCount}
          </span>
        </button>

        {/* Account */}
        {user ? (
          // Logged in — show avatar + dropdown
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button onClick={() => setDropdownOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid var(--border)', borderRadius: 100, padding: '6px 14px 6px 6px', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Avatar */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {firstName[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>{firstName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--mid)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', zIndex: 200 }}>

                {/* User info */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--grey)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user.displayName || firstName}</div>
                  <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2 }}>{user.email}</div>
                  {role === 'admin' && (
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginTop: 6 }}>Admin</span>
                  )}
                </div>

                {/* Menu items */}
                {[
                  ...(role === 'admin' ? [[
                    <svg height="16" width="16" viewBox="0 -960 960 960" style={{ color: 'currentcolor' }}>
                      <path d="M722.5-297.5Q740-315 740-340t-17.5-42.5Q705-400 680-400t-42.5 17.5Q620-365 620-340t17.5 42.5Q655-280 680-280t42.5-17.5ZM680-160q31 0 57-14.5t42-38.5q-22-13-47-20t-52-7q-27 0-52 7t-47 20q16 24 42 38.5t57 14.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v227q-19-8-39-14.5t-41-9.5v-147l-240-90-240 90v188q0 47 12.5 94t35 89.5Q310-290 342-254t71 60q11 32 29 61t41 52q-1 0-1.5.5t-1.5.5Zm200 0q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM480-494Z" fill="currentColor" />
                    </svg>,
                    'Admin Panel', '/admin'
                  ]] : []),
                  [
                    <svg height="16" width="16" viewBox="0 -960 960 960" style={{ color: 'currentcolor' }}>
                      <path d="m216-160-56-56 384-384H440v80h-80v-160h233q16 0 31 6t26 17l120 119q27 27 66 42t84 16v80q-62 0-112.5-19T718-476l-40-42-88 88 90 90-262 151-40-69 172-99-68-68-266 265Zm-96-280v-80h200v80H120ZM40-560v-80h200v80H40Zm739-80q-33 0-57-23.5T698-720q0-33 24-56.5t57-23.5q33 0 57 23.5t24 56.5q0 33-24 56.5T779-640Zm-659-40v-80h200v80H120Z" fill="currentColor" />
                    </svg>,
                    'My Profile', '/profile'
                  ]
                ].map(([icon, label, href]) => (
                  <Link key={href} href={href} onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--black)', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--grey)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    {icon}{label}
                  </Link>
                ))}

                {/* Sign out */}
                <button onClick={handleSignOut}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'DM Sans' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg height="16" width="16" viewBox="0 -960 960 960" style={{ color: 'currentcolor' }}>
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" fill="currentColor" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          // Logged out — show sign in link
          <Link href="/auth" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--black)', border: '1.5px solid var(--border)', borderRadius: 100, padding: '7px 16px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--black)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--black)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}