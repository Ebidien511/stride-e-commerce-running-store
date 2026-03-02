'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getUserData, updateUserData, changePassword } from '@/services/userService'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { getUserOrders, cancelOrder } from '@/services/orderService'

import { useSearchParams } from 'next/navigation'

import ProtectedRoute from '@/components/ProtectedRoute'


const STATUS_COLORS = {
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Shipped: { bg: '#dbeafe', color: '#1e40af' },
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
    <path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11Zm200-528 77-44-237-137-78 45 238 136Zm-160 93 78-45-237-137-78 45 237 137Z" />
  </svg>
)

const FavoriteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
    <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
  </svg>
)

const BoxAddIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor">
    <path d="M640-640h120-120Zm-440 0h338-18 14-334Zm16-80h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190Zm182 330H200q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v196q-19-7-39-11t-41-4v-122H640v153q-35 20-61 49.5T538-371l-58-29-160 80v-320H200v440h334q8 23 20 43t28 37Zm138 0v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
  </svg>
)

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
  const { user } = useAuth()        
  const [loading, setLoading] = useState(true)  
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders')
  const [orders, setOrders] = useState([])
  const { wishlist, toggleWishlist } = useWishlist()
  const { addItem, openCart } = useCart()
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState(null)

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
            experience: data.runProfile?.experience || '',
            cushion: data.runProfile?.cushion || '',
            budget: data.runProfile?.budget || '',
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
    { id: 'orders', label: 'My Orders', icon: <PackageIcon /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FavoriteIcon /> },
    { id: 'settings', label: 'Account Settings', icon: <SettingsIcon /> },
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
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                      <BoxAddIcon size={40} />
                    </div>
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
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{ fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                            View Order
                          </button>
                          {order.status === 'Processing' && (
                            <button
                              onClick={async () => {
                                await cancelOrder(order.id)
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o))
                              }}
                              style={{ fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid var(--red)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--red)', transition: 'all 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
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
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                      <FavoriteIcon style={{ width: 40, height: 40 }} />
                    </div>
                    Your wishlist is empty. Heart a product to save it here.
                  </div>
                  : wishlist.map(item => (
                    <div key={item.id} onClick={() => router.push(`/product/${item.id}`)} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 16, alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--grey)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ width: 72, height: 72, background: 'var(--grey)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👟'}
                      </div>
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

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 680, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

            {/* Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{selectedOrder.id}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, ...STATUS_COLORS[selectedOrder.status] }}>{selectedOrder.status}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--mid)', lineHeight: 1 }}>✕</button>
            </div>

            {/* Scrollable content */}
            <div style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Items */}
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 14 }}>Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 56, height: 56, background: 'var(--grey)', borderRadius: 10, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👟'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{item.brand}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--mid)' }}>Size: {item.size} · Qty: {item.qty}</div>
                      </div>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1 }}>R{(item.price * item.qty).toLocaleString('en-ZA')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.details && (
                <div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 14 }}>Delivery Address</div>
                  <div style={{ background: 'var(--grey)', borderRadius: 12, padding: '14px 16px', fontSize: 13, lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 600 }}>{selectedOrder.details.firstName} {selectedOrder.details.lastName}</div>
                    <div style={{ color: 'var(--mid)' }}>{selectedOrder.details.street}, {selectedOrder.details.city}</div>
                    <div style={{ color: 'var(--mid)' }}>{selectedOrder.details.province}, {selectedOrder.details.postal}</div>
                    <div style={{ color: 'var(--mid)', marginTop: 4 }}>{selectedOrder.details.phone}</div>
                  </div>
                </div>
              )}

              {/* Payment */}
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 14 }}>Payment</div>
                <div style={{ background: 'var(--grey)', borderRadius: 12, padding: '14px 16px', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--mid)' }}>Payment Method</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedOrder.payMethod || 'Card'}</span>
                </div>
              </div>

              {/* Order Total */}
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 14 }}>Order Summary</div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  {[
                    ['Subtotal', `R${selectedOrder.subtotal?.toLocaleString('en-ZA') || 0}`],
                    ['Delivery', selectedOrder.delivery === 0 ? 'Free' : `R${selectedOrder.delivery?.toLocaleString('en-ZA')}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      <span style={{ color: 'var(--mid)' }}>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', fontSize: 15, fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1 }}>R{selectedOrder.total?.toLocaleString('en-ZA')}</span>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div style={{ fontSize: 12, color: 'var(--mid)', textAlign: 'center', paddingBottom: 8 }}>
                Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}