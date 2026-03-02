'use client'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { fmt } from '@/lib/validation'

export default function CartPage() {
  const { items, removeItem, changeQty, subtotal, delivery, total } = useCart()
  const router = useRouter()

  return (
    <div style={{ padding: '40px 48px 80px', maxWidth: 1400, margin: 'var(--nav-h) auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: 2 }}>YOUR CART</h1>
          <p style={{ color: 'var(--mid)', fontSize: 13, marginTop: 4 }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <a href="/products" style={{ fontSize: 13, fontWeight: 600, color: 'var(--mid)', borderBottom: '1px solid var(--mid)', paddingBottom: 2 }}>← Continue Shopping</a>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🛒</div>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: 2, marginBottom: 12 }}>YOUR CART IS EMPTY</h2>
          <p style={{ color: 'var(--mid)', marginBottom: 32 }}>Looks like you haven't added any shoes yet.</p>
          <button onClick={() => router.push('/products')} style={{ background: 'var(--black)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse Shoes →</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '16px 24px', background: 'white', border: '1px solid var(--border)', borderRadius: 12 }}>
              {[['✓', 'Cart', true], ['2', 'Details', false], ['3', 'Payment', false], ['4', 'Confirm', false]].map(([n, label, done], i) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: done ? 'var(--accent)' : 'white', color: done ? 'white' : 'var(--mid)', border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}` }}>{n}</span>
                  <span style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? 'var(--accent)' : 'var(--mid)' }}>{label}</span>
                  {i < 3 && <span style={{ width: 60, height: 2, background: done ? 'var(--accent)' : 'var(--border)', marginLeft: 6 }} />}
                </span>
              ))}
            </div>

            {items.map(item => (
              <div key={`${item.id}-${item.size}`} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 20, alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 100, height: 100, background: 'var(--grey)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{item.emoji}</div>
                <div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', marginBottom: 4 }}>{item.brand}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 16 }}>Size: {item.size} · {item.meta}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => changeQty(item.id, item.size, -1)} style={{ width: 36, height: 36, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>−</button>
                      <div style={{ width: 40, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderLeft: '1.5px solid var(--border)', borderRight: '1.5px solid var(--border)' }}>{item.qty}</div>
                      <button onClick={() => changeQty(item.id, item.size, 1)} style={{ width: 36, height: 36, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.id, item.size)} style={{ fontSize: 12, color: 'var(--mid)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: 1 }}>{fmt(item.qty * item.price)}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 88, alignSelf: 'start' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1 }}>ORDER SUMMARY</h2>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Subtotal', fmt(subtotal)], ['Delivery', delivery === 0 ? 'FREE' : fmt(delivery)]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--mid)' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: l === 'Delivery' && delivery === 0 ? 'var(--green)' : undefined }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1 }}>{fmt(total)}</span>
              </div>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => router.push('/checkout')} style={{ width: '100%', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 10, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Proceed to Checkout
              </button>
              <button onClick={() => router.push('/products')} style={{ width: '100%', background: 'none', border: '2px solid var(--border)', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}