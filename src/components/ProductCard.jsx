'use client'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/hooks/useWishlist'
import { fmt } from '@/lib/validation'

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart()
  const { isWished, toggleWishlist } = useWishlist()
  const router = useRouter()
  const wished = isWished(product.id)

  const handleAdd = (e) => {
    e.stopPropagation()
    addItem({ ...product, size: 'UK 8', meta: product.arch, qty: 1, cost: product.cost || 0 })
    openCart()
  }

  return (
    <div onClick={() => router.push(`/product/${product.id}`)} style={{ borderRadius: 12, overflow: 'hidden', transition: 'transform 0.3s', cursor: 'pointer', border: '1px solid var(--border)', background: 'white' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ background: 'var(--grey)', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <span style={{ fontSize: 80 }}>{product.emoji}</span>
        {product.tag && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: product.tag === 'New' ? 'var(--accent2)' : product.tag === 'Sale' ? '#16a34a' : 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {product.tag}
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); toggleWishlist(product) }}
          style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, background: 'white', border: 'none', borderRadius: '50%', fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: wished ? 'var(--accent)' : 'inherit', transition: 'color 0.2s' }}>
          {wished ? '♥' : '♡'}
        </button>
      </div>
      <div style={{ padding: 16, borderTop: 'none' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 4 }}>{product.brand}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
          {[['Arch', product.arch], ['Terrain', product.terrain], ['Drop', product.drop], ['Weight', product.weight]].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--grey)', borderRadius: 6, padding: '5px 8px' }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mid)', fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 1 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1 }}>{fmt(product.price)}</div>
            {product.originalPrice && <div style={{ fontSize: 12, color: 'var(--mid)', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</div>}
          </div>
          <button onClick={handleAdd} style={{ background: 'var(--black)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
          >+ Add</button>
        </div>
      </div>
    </div>
  )
}