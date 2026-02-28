'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { placeOrder as placeOrderService } from '@/services/orderService'
import ProtectedRoute from '@/components/ProtectedRoute'

const STEPS = ['Cart', 'Details', 'Payment', 'Confirm']

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: done ? 'var(--accent)' : active ? 'var(--black)' : 'white', color: done || active ? 'white' : 'var(--mid)', border: `2px solid ${done || active ? 'transparent' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                {done ? '✓' : step}
              </span>
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? 'var(--black)' : done ? 'var(--accent)' : 'var(--mid)', transition: 'all 0.3s' }}>{label}</span>
            </span>
            {i < STEPS.length - 1 && <span style={{ width: 48, height: 2, background: done ? 'var(--accent)' : 'var(--border)', margin: '0 12px', transition: 'background 0.3s' }} />}
          </span>
        )
      })}
    </div>
  )
}

function FieldError({ msg }) {
  return msg ? <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 500, marginTop: 5, animation: 'fadeUp 0.2s ease both' }}>{msg}</div> : null
}

function Label({ children }) {
  return <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontWeight: 600, marginBottom: 6 }}>{children}</div>
}

function Input({ error, ...props }) {
  return (
    <input {...props} style={{ width: '100%', border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white', color: 'var(--black)', transition: 'border-color 0.2s', boxShadow: error ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none', ...props.style }}
      onFocus={e => { if (!error) e.target.style.borderColor = 'var(--black)' }}
      onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)' }}
    />
  )
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, delivery, total, fmt, clearCart } = useCart()
  const [step, setStep] = useState(2)

  // Step 2 — Details
  const [details, setDetails] = useState({ firstName: '', lastName: '', email: '', phone: '', street: '', city: '', province: '', postal: '' })
  const [detailsErr, setDetailsErr] = useState({})

  // Step 3 — Payment
  const [payMethod, setPayMethod] = useState('card')
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [cardErr, setCardErr] = useState({})

  // Step 4 — Order number
  const [orderNum, setOrderNum] = useState('')

  const setD = (k, v) => { setDetails(p => ({ ...p, [k]: v })); setDetailsErr(p => ({ ...p, [k]: '' })) }
  const setC = (k, v) => { setCard(p => ({ ...p, [k]: v })); setCardErr(p => ({ ...p, [k]: '' })) }

  const validateDetails = () => {
    const e = {}
    if (!details.firstName.trim()) e.firstName = 'First name is required'
    if (!details.lastName.trim()) e.lastName = 'Last name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) e.email = 'Please enter a valid email'
    if (details.phone.replace(/\D/g, '').length < 9) e.phone = 'Please enter a valid phone number'
    if (!details.street.trim()) e.street = 'Street address is required'
    if (!details.city.trim()) e.city = 'City is required'
    if (!details.province.trim()) e.province = 'Province is required'
    if (!/^\d{4}$/.test(details.postal)) e.postal = 'Enter a valid 4-digit postal code'
    setDetailsErr(e)
    return Object.keys(e).length === 0
  }

  const validateCard = () => {
    if (payMethod !== 'card') return true
    const e = {}
    if (!card.name.trim()) e.name = 'Name on card is required'
    if (card.number.replace(/\s/g, '').length !== 16) e.number = 'Enter a valid 16-digit card number'
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(card.expiry)) e.expiry = 'Enter expiry as MM / YY'
    if (!/^\d{3}$/.test(card.cvv)) e.cvv = 'Enter a valid 3-digit CVV'
    setCardErr(e)
    return Object.keys(e).length === 0
  }

  const goToPayment = () => { if (validateDetails()) setStep(3) }
  const placeOrder = async () => {
    if (!validateCard()) return
    try {
      const orderId = await placeOrderService({
        uid: user.uid,
        items: items.map(item => ({ ...item, cost: item.cost || 0 })),
        details,
        payMethod,
        subtotal,
        delivery,
        total,
      })
      setOrderNum(orderId)
      clearCart()
      setStep(4)
    } catch (err) {
      console.error('Order failed:', err)
    }
  }

  const inputStyle = (err) => ({ width: '100%', border: `1.5px solid ${err ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white', color: 'var(--black)', boxShadow: err ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none' })

  // Order summary (sidebar)
  const Summary = () => (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 88 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1 }}>ORDER SUMMARY</h3>
      </div>
      <div style={{ padding: '0 24px' }}>
        {items.map(item => (
          <div key={`${item.id}-${item.size}`} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, background: 'var(--grey)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👟'}
            </div>            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>{item.size} × {item.qty}</div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 1 }}>{fmt(item.qty * item.price)}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[['Subtotal', fmt(subtotal)], ['Delivery', delivery === 0 ? 'FREE' : fmt(delivery)]].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--mid)' }}>{l}</span>
            <span style={{ fontWeight: 600, color: l === 'Delivery' && delivery === 0 ? 'var(--green)' : undefined }}>{v}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1 }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <ProtectedRoute requiredRole="customer">
      <div style={{ padding: '40px 48px 80px', maxWidth: 1200, margin: 'var(--nav-h) auto 0' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: 2, marginBottom: 8 }}>CHECKOUT</h1>
        <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 40 }}>Secure checkout powered by STRIDE</p>

        <StepIndicator current={step} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* ── STEP 2: DETAILS ── */}
            {step === 2 && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1 }}>DELIVERY DETAILS</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label>First Name</Label>
                    <input style={inputStyle(detailsErr.firstName)} value={details.firstName}
                      onChange={e => setD('firstName', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))} placeholder="Jane" />
                    <FieldError msg={detailsErr.firstName} />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <input style={inputStyle(detailsErr.lastName)} value={details.lastName}
                      onChange={e => setD('lastName', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))} placeholder="Smith" />
                    <FieldError msg={detailsErr.lastName} />
                  </div>
                </div>

                <div>
                  <Label>Email Address</Label>
                  <input style={inputStyle(detailsErr.email)} value={details.email} type="email"
                    onChange={e => setD('email', e.target.value)} placeholder="jane@example.com" />
                  <FieldError msg={detailsErr.email} />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <input style={inputStyle(detailsErr.phone)} value={details.phone}
                    onChange={e => setD('phone', e.target.value.replace(/[^\d+\s]/g, ''))} placeholder="+27 82 000 0000" />
                  <FieldError msg={detailsErr.phone} />
                </div>

                <div style={{ height: 1, background: 'var(--border)' }} />
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1 }}>DELIVERY ADDRESS</h3>

                <div>
                  <Label>Street Address</Label>
                  <input style={inputStyle(detailsErr.street)} value={details.street}
                    onChange={e => setD('street', e.target.value)} placeholder="123 Main Street" />
                  <FieldError msg={detailsErr.street} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label>City</Label>
                    <input style={inputStyle(detailsErr.city)} value={details.city}
                      onChange={e => setD('city', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))} placeholder="Cape Town" />
                    <FieldError msg={detailsErr.city} />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <select style={{ ...inputStyle(detailsErr.province), cursor: 'pointer' }} value={details.province}
                      onChange={e => setD('province', e.target.value)}>
                      <option value="">Select province</option>
                      {['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <FieldError msg={detailsErr.province} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label>Postal Code</Label>
                    <input style={inputStyle(detailsErr.postal)} value={details.postal} maxLength={4}
                      onChange={e => setD('postal', e.target.value.replace(/\D/g, '').substring(0, 4))} placeholder="8001" />
                    <FieldError msg={detailsErr.postal} />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <input style={{ ...inputStyle(), background: 'var(--grey)', color: 'var(--mid)', cursor: 'not-allowed' }} value="South Africa" disabled />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
                  <button onClick={() => setStep(1)} style={{ padding: '14px 24px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'white', cursor: 'pointer' }}>← Back</button>
                  <button onClick={goToPayment} style={{ padding: '14px 32px', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
                  >Continue to Payment →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT ── */}
            {step === 3 && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1 }}>PAYMENT METHOD</h2>

                {/* Method selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[['card', '💳', 'Credit / Debit Card'], ['paypal', '🅿️', 'PayPal'], ['cod', '💵', 'Cash on Delivery']].map(([val, icon, label]) => (
                    <button key={val} onClick={() => setPayMethod(val)}
                      style={{ padding: '16px 12px', border: `2px solid ${payMethod === val ? 'var(--black)' : 'var(--border)'}`, borderRadius: 12, background: payMethod === val ? '#f7f5f2' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
                    </button>
                  ))}
                </div>

                {/* Card form */}
                {payMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <Label>Name on Card</Label>
                      <input style={inputStyle(cardErr.name)} value={card.name}
                        onChange={e => setC('name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} placeholder="Jane Smith" />
                      <FieldError msg={cardErr.name} />
                    </div>
                    <div>
                      <Label>Card Number</Label>
                      <input style={inputStyle(cardErr.number)} value={card.number} maxLength={19}
                        onChange={e => setC('number', e.target.value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                        placeholder="0000 0000 0000 0000" />
                      <FieldError msg={cardErr.number} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <Label>Expiry Date</Label>
                        <input style={inputStyle(cardErr.expiry)} value={card.expiry} maxLength={7}
                          onChange={e => { const d = e.target.value.replace(/\D/g, '').substring(0, 4); setC('expiry', d.length >= 2 ? d.substring(0, 2) + ' / ' + d.substring(2) : d) }}
                          placeholder="MM / YY" />
                        <FieldError msg={cardErr.expiry} />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <input style={inputStyle(cardErr.cvv)} value={card.cvv} maxLength={3} type="password"
                          onChange={e => setC('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))} placeholder="•••" />
                        <FieldError msg={cardErr.cvv} />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === 'paypal' && (
                  <div style={{ padding: 32, textAlign: 'center', background: 'var(--grey)', borderRadius: 12 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🅿️</div>
                    <p style={{ color: 'var(--mid)', fontSize: 14 }}>You'll be redirected to PayPal to complete payment.</p>
                  </div>
                )}

                {payMethod === 'cod' && (
                  <div style={{ padding: 32, textAlign: 'center', background: 'var(--grey)', borderRadius: 12 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💵</div>
                    <p style={{ color: 'var(--mid)', fontSize: 14 }}>Pay in cash when your order is delivered. Additional R25 COD fee applies.</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
                  <button onClick={() => setStep(2)} style={{ padding: '14px 24px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'white', cursor: 'pointer' }}>← Back</button>
                  <button onClick={placeOrder} style={{ padding: '14px 32px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ff6540'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Place Order
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: CONFIRMATION ── */}
            {step === 4 && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', animation: 'bounceIn 0.5s ease both' }}>✓</div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2, marginBottom: 8 }}>ORDER PLACED!</h2>
                <p style={{ color: 'var(--mid)', marginBottom: 4 }}>Order number: <strong style={{ color: 'var(--black)', fontFamily: 'DM Mono' }}>{orderNum}</strong></p>
                <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 32 }}>A confirmation email has been sent to {details.email || 'your inbox'}.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
                  {[['📦', 'Processing', 'Your order is being prepared'], ['🚚', 'Est. Delivery', '3–5 business days'], ['✅', 'Guaranteed', '100% authentic products']].map(([icon, title, sub]) => (
                    <div key={title} style={{ padding: 20, background: 'var(--grey)', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
                      <div style={{ fontSize: 11, color: 'var(--mid)' }}>{sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <a href="/products" style={{ padding: '14px 28px', background: 'var(--black)', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'inline-block' }}>Continue Shopping</a>
                  <a href="/profile" style={{ padding: '14px 28px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'inline-block' }}>View My Orders</a>
                </div>
              </div>
            )}
          </div>

          {step < 4 && <Summary />}
        </div>
      </div>
    </ProtectedRoute>
  )
}