'use client'
import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ isOpen, onClose }) {
  const inputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleChange = (e) => {
    const q = e.target.value
    if (q.trim()) {
      router.push(`/products?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/products')
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 99,
      background: 'white', borderBottom: '1px solid var(--border)',
      padding: isOpen ? '14px 48px' : '0 48px',
      maxHeight: isOpen ? 80 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s ease',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 720, margin: '0 auto' }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--mid)', whiteSpace: 'nowrap' }}>Search</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. trail shoes, neutral, Hoka..."
          onChange={handleChange}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 18, fontFamily: 'DM Sans', color: 'var(--black)', background: 'transparent', caretColor: 'var(--accent)' }}
        />
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--mid)', cursor: 'pointer', lineHeight: 1 }}>✕</button>
      </div>
    </div>
  )
}