'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getUserData, updateUserData, changePassword } from '@/services/userService'
import { useWishlist } from '@/hooks/useWishlist'
import { getUserOrders } from '@/services/orderService'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

import { useSearchParams } from 'next/navigation'

import ProtectedRoute from '@/components/ProtectedRoute'


const STATUS_COLORS = {
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Shipped: { bg: '#dbeafe', color: '#1e40af' },
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

function Label({ children }) {
  return <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontWeight: 600, marginBottom: 6 }}>{children}</div>
}

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick} style={{ padding: '10px 24px', background: saved ? 'var(--green)' : 'var(--black)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.background = saved ? 'var(--green)' : 'var(--black)'}
    >{saved ? '✓ Saved!' : 'Save Changes'}</button>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()        // 👈 must be here
  const [loading, setLoading] = useState(true)  // 👈 add this
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders')
  const [orders, setOrders] = useState([])
  const { wishlist, toggleWishlist } = useWishlist()
  const { addItem, openCart } = useCart()
  const router = useRouter()





  // Personal info
  const [info, setInfo] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [infoErr, setInfoErr] = useState({})
  const [infoSaved, setInfoSaved] = useState(false)

  // Address
  const [addr, setAddr] = useState({ street: '', city: '', province: 'Western Cape', postal: '' })
  const [addrErr, setAddrErr] = useState({})
  const [addrSaved, setAddrSaved] = useState(false)


  // Password
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })
  const [pwErr, setPwErr] = useState({})
  const [pwSaved, setPwSaved] = useState(false)
  const [pwStrength, setPwStrength] = useState(0)

  // Running profile
  const [runProfile, setRunProfile] = useState({ arch: 'Neutral', terrain: 'Road', size: 'UK 8' })
  const [profileSaved, setProfileSaved] = useState(false)

  // fetch user data from Firestore on mount
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const data = await getUserData(user.uid)
        if (data) {
          setInfo({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
          })
          setAddr({
            street: data.address?.street || '',
            city: data.address?.city || '',
            province: data.address?.province || 'Western Cape',
            postal: data.address?.postal || '',
          })
          setRunProfile({
            arch: data.runProfile?.arch || 'Neutral',
            terrain: data.runProfile?.terrain || 'Road',
            size: data.runProfile?.size || 'UK 8',
          })
        }
        const userOrders = await getUserOrders(user.uid)
        console.log('Orders fetched:', userOrders)
        setOrders(userOrders)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const setI = (k, v) => { setInfo(p => ({ ...p, [k]: v })); setInfoErr(p => ({ ...p, [k]: '' })); setInfoSaved(false) }
  const setA = (k, v) => { setAddr(p => ({ ...p, [k]: v })); setAddrErr(p => ({ ...p, [k]: '' })); setAddrSaved(false) }
  const setP = (k, v) => {
    setPw(p => ({ ...p, [k]: v })); setPwErr(p => ({ ...p, [k]: '' })); setPwSaved(false)
    if (k === 'newPw') {
      const s = v.length >= 12 ? 4 : v.length >= 8 ? 3 : v.length >= 6 ? 2 : v.length > 0 ? 1 : 0
      setPwStrength(s)
    }
  }



  const saveInfo = async () => {
    const e = {}
    if (!info.firstName.trim()) e.firstName = 'Required'
    if (!info.lastName.trim()) e.lastName = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = 'Invalid email'
    if (info.phone.replace(/\D/g, '').length < 9) e.phone = 'Invalid phone'
    setInfoErr(e)
    if (Object.keys(e).length) return
    await updateUserData(user.uid, { firstName: info.firstName, lastName: info.lastName, phone: info.phone })
    setInfoSaved(true)
    setTimeout(() => setInfoSaved(false), 3000)
  }

  const saveAddr = async () => {
    const e = {}
    if (!addr.street.trim()) e.street = 'Required'
    if (!addr.city.trim()) e.city = 'Required'
    if (!/^\d{4}$/.test(addr.postal)) e.postal = '4-digit code required'
    setAddrErr(e)
    if (Object.keys(e).length) return
    await updateUserData(user.uid, { address: addr })
    setAddrSaved(true)
    setTimeout(() => setAddrSaved(false), 3000)
  }

  const savePw = async () => {
    const e = {}
    if (!pw.current) e.current = 'Required'
    if (pw.newPw.length < 8) e.newPw = 'Minimum 8 characters'
    if (pw.newPw !== pw.confirm) e.confirm = 'Passwords do not match'
    setPwErr(e)
    if (Object.keys(e).length) return
    try {
      await changePassword(pw.current, pw.newPw)
      setPwSaved(true)
      setPw({ current: '', newPw: '', confirm: '' })
      setPwStrength(0)
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err) {
      setPwErr({ current: 'Incorrect current password' })
    }
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'var(--red)', 'var(--yellow)', '#3b82f6', 'var(--green)']

  const inputStyle = (err) => ({ width: '100%', border: `1.5px solid ${err ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white', color: 'var(--black)', boxShadow: err ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none' })
  const Err = ({ msg }) => msg ? <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 500, marginTop: 5 }}>{msg}</div> : null

  const TABS = [
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '♡' },
    { id: 'settings', label: 'Account Settings', icon: '⚙️' },
  ]

  return (
    <ProtectedRoute requiredRole="customer">
      <div style={{ padding: '40px 48px 80px', maxWidth: 1200, margin: 'var(--nav-h) auto 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48, padding: '28px 32px', background: 'var(--black)', borderRadius: 20, color: 'white' }}>
          <div style={{ width: 72, height: 72, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1 }}>
            {info.firstName?.[0]}{info.lastName?.[0]}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1 }}>{info.firstName} {info.lastName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{info.email} · Member since {new Date(user?.metadata?.creationTime).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Sidenav */}
          <aside style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 88 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ width: '100%', padding: '16px 20px', border: 'none', background: activeTab === tab.id ? 'var(--grey)' : 'white', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 400, color: activeTab === tab.id ? 'var(--black)' : 'var(--mid)', display: 'flex', alignItems: 'center', gap: 12, borderLeft: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </aside>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── ORDERS ── */}
            {activeTab === 'orders' && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1 }}>MY ORDERS ({orders.length})</h2>
                </div>
                {orders.length === 0
                  ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--mid)', fontSize: 14 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    You haven't placed any orders yet.
                  </div>
                  : orders.map(order => (
                    <div key={order.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                          <span style={{ fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700 }}>{order.id}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, ...STATUS_COLORS[order.status] }}>{order.status}</span>
                        </div>
                        <div style={{ fontSize: 13, marginBottom: 4 }}>
                          {order.items.map(i => `${i.brand} ${i.name} (${i.size})`).join(', ')}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--mid)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1, marginBottom: 8 }}>
                          R{order.total.toLocaleString('en-ZA')}
                        </div>
                        <button style={{ fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                          View Order
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === 'wishlist' && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 1 }}>WISHLIST ({wishlist.length})</h2>
                </div>
                {wishlist.length === 0
                  ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--mid)', fontSize: 14 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
                    Your wishlist is empty. Heart a product to save it here.
                  </div>
                  : wishlist.map(item => (
                    <div key={item.id} onClick={() => router.push(`/product/${item.id}`)} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 16, alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--grey)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >                      <div style={{ width: 72, height: 72, background: 'var(--grey)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{item.emoji}</div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 4 }}>{item.brand}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>R{item.price.toLocaleString('en-ZA')}</span>
                          {item.originalPrice && <span style={{ fontSize: 12, color: 'var(--mid)', textDecoration: 'line-through' }}>R{item.originalPrice.toLocaleString('en-ZA')}</span>}
                          {item.tag && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 100 }}>{item.tag}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); addItem({ ...item, size: 'UK 8', meta: 'Neutral', qty: 1 }); openCart() }}
                          style={{ padding: '10px 18px', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(item) }}
                          style={{ padding: '10px 18px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--red)' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <>
                {/* Personal Info */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1, marginBottom: 24 }}>PERSONAL INFORMATION</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div><Label>First Name</Label><input style={inputStyle(infoErr.firstName)} value={info.firstName} onChange={e => setI('firstName', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))} /><Err msg={infoErr.firstName} /></div>
                    <div><Label>Last Name</Label><input style={inputStyle(infoErr.lastName)} value={info.lastName} onChange={e => setI('lastName', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))} /><Err msg={infoErr.lastName} /></div>
                  </div>
                  <div style={{ marginBottom: 16 }}><Label>Email</Label><input style={inputStyle(infoErr.email)} value={info.email} onChange={e => setI('email', e.target.value)} /><Err msg={infoErr.email} /></div>
                  <div style={{ marginBottom: 24 }}><Label>Phone</Label><input style={inputStyle(infoErr.phone)} value={info.phone} onChange={e => setI('phone', e.target.value.replace(/[^\d+\s]/g, ''))} /><Err msg={infoErr.phone} /></div>
                  <SaveBtn onClick={saveInfo} saved={infoSaved} />
                </div>

                {/* Address */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1, marginBottom: 24 }}>DELIVERY ADDRESS</h3>
                  <div style={{ marginBottom: 16 }}><Label>Street Address</Label><input style={inputStyle(addrErr.street)} value={addr.street} onChange={e => setA('street', e.target.value)} /><Err msg={addrErr.street} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div><Label>City</Label><input style={inputStyle(addrErr.city)} value={addr.city} onChange={e => setA('city', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))} /><Err msg={addrErr.city} /></div>
                    <div><Label>Province</Label>
                      <select style={{ ...inputStyle(), cursor: 'pointer' }} value={addr.province} onChange={e => setA('province', e.target.value)}>
                        {['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div><Label>Postal Code</Label><input style={inputStyle(addrErr.postal)} value={addr.postal} maxLength={4} onChange={e => setA('postal', e.target.value.replace(/\D/g, '').substring(0, 4))} /><Err msg={addrErr.postal} /></div>
                    <div><Label>Country</Label><input style={{ ...inputStyle(), background: 'var(--grey)', color: 'var(--mid)', cursor: 'not-allowed' }} value="South Africa" disabled /></div>
                  </div>
                  <SaveBtn onClick={saveAddr} saved={addrSaved} />
                </div>

                {/* Password */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1, marginBottom: 24 }}>CHANGE PASSWORD</h3>
                  <div style={{ marginBottom: 16 }}><Label>Current Password</Label><input style={inputStyle(pwErr.current)} type="password" value={pw.current} onChange={e => setP('current', e.target.value)} placeholder="••••••••" /><Err msg={pwErr.current} /></div>
                  <div style={{ marginBottom: 8 }}><Label>New Password</Label><input style={inputStyle(pwErr.newPw)} type="password" value={pw.newPw} onChange={e => setP('newPw', e.target.value)} placeholder="Min 8 characters" /><Err msg={pwErr.newPw} /></div>
                  {pw.newPw && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${pwStrength * 25}%`, background: strengthColor[pwStrength], borderRadius: 2, transition: 'all 0.3s' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 24 }}><Label>Confirm New Password</Label><input style={inputStyle(pwErr.confirm)} type="password" value={pw.confirm} onChange={e => setP('confirm', e.target.value)} placeholder="••••••••" /><Err msg={pwErr.confirm} /></div>
                  <SaveBtn onClick={savePw} saved={pwSaved} />
                </div>

                {/* Running Profile */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1, marginBottom: 24 }}>RUNNING PROFILE</h3>
                  {[
                    { label: 'Arch Type', key: 'arch', options: ['Neutral', 'Flat Feet', 'High Arch'] },
                    { label: 'Preferred Terrain', key: 'terrain', options: ['Road', 'Trail', 'Treadmill', 'Mixed'] },
                    { label: 'Shoe Size', key: 'size', options: ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10'] },
                  ].map(field => (
                    <div key={field.key} style={{ marginBottom: 20 }}>
                      <Label>{field.label}</Label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {field.options.map(opt => (
                          <button key={opt} onClick={() => { setRunProfile(p => ({ ...p, [field.key]: opt })); setProfileSaved(false) }}
                            style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${runProfile[field.key] === opt ? 'var(--black)' : 'var(--border)'}`, background: runProfile[field.key] === opt ? 'var(--black)' : 'white', color: runProfile[field.key] === opt ? 'white' : 'var(--black)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <SaveBtn onClick={async () => {
                      await updateUserData(user.uid, { runProfile })
                      setProfileSaved(true)
                      setTimeout(() => setProfileSaved(false), 3000)
                    }} saved={profileSaved} />                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}