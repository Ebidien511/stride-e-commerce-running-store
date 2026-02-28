'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, changeQty, itemCount, subtotal, delivery, total, fmt } = useCart()
  const router = useRouter()
  const FREE_THRESHOLD = 5000

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeCart])

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none', transition: 'opacity 0.3s', backdropFilter: 'blur(2px)' },
    sidebar: { position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: 'var(--white)', zIndex: 201, display: 'flex', flexDirection: 'column', transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)' },
  }

  return (
    <>
      <div style={s.overlay} onClick={closeCart} />
      <aside style={s.sidebar}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            YOUR CART
            <span style={{ background: 'var(--accent)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, fontFamily: 'DM Sans' }}>{itemCount}</span>
          </div>
          <button onClick={closeCart} style={{ width: 36, height: 36, background: 'var(--grey)', border: 'none', borderRadius: '50%', fontSize: 18, color: 'var(--mid)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48 }}>🛒</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1 }}>YOUR CART IS EMPTY</div>
              <div style={{ fontSize: 13, color: 'var(--mid)' }}>Add some shoes to get started.</div>
            </div>
          ) : items.map(item => (
            <div key={`${item.id}-${item.size}`} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 14, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 72, height: 72, background: 'var(--grey)', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 36 }}>👟</span>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)' }}>{item.brand}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--mid)' }}>{item.size} · {item.meta}</div>
                <button onClick={() => removeItem(item.id, item.size)} style={{ fontSize: 11, color: 'var(--mid)', background: 'none', border: 'none', textDecoration: 'underline', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Remove</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1 }}>{fmt(item.qty * item.price)}</div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                  <button onClick={() => changeQty(item.id, item.size, -1)} style={{ width: 28, height: 28, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <div style={{ width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, borderLeft: '1.5px solid var(--border)', borderRight: '1.5px solid var(--border)' }}>{item.qty}</div>
                  <button onClick={() => changeQty(item.id, item.size, 1)} style={{ width: 28, height: 28, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upsell + Footer */}
        {items.length > 0 && (
          <>
            <div style={{ margin: '0 24px 4px', padding: '12px 16px', background: 'var(--grey)', borderRadius: 8, fontSize: 12, border: '1px dashed var(--border)', flexShrink: 0 }}>
              {subtotal >= FREE_THRESHOLD
                ? <span>🎉 <strong style={{ color: 'var(--green)' }}>You qualify for free delivery!</strong></span>
                : <span>🚚 <strong>Add {fmt(FREE_THRESHOLD - subtotal)} more</strong> to qualify for free delivery!</span>
              }
            </div>
            <div style={{ padding: '16px 24px 24px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['Subtotal', fmt(subtotal)], ['Delivery', delivery === 0 ? 'FREE' : fmt(delivery)]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--mid)' }}>{l}</span>
                    <span style={{ fontWeight: 600, color: l === 'Delivery' && delivery === 0 ? 'var(--green)' : undefined }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: 1 }}>{fmt(total)}</span>
                </div>
              </div>
              <button onClick={() => { closeCart(); router.push('/checkout') }} style={{ width: '100%', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 10, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', letterSpacing: '0.5px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Proceed to Checkout
              </button>
              <button onClick={() => { closeCart(); router.push('/cart') }} style={{ width: '100%', background: 'none', border: '2px solid var(--border)', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                View Full Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}