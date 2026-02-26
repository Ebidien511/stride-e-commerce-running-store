'use client'
import { useState } from 'react'
import { fmt } from '@/lib/validation'
import { useProducts } from '@/app/hooks/useProducts'
import ProductFormModal from '@/components/ProductFormModal'
import { deleteProduct } from '@/services/productServices'
const STATS = [
  { label: 'Total Revenue', value: 'R284,320', change: '+12.4%', up: true, icon: '💰' },
  { label: 'Orders Today', value: '47', change: '+8.1%', up: true, icon: '📦' },
  { label: 'Active Customers', value: '1,284', change: '+3.2%', up: true, icon: '👥' },
  { label: 'Low Stock Items', value: '6', change: '-2', up: false, icon: '⚠️' },
]

const RECENT_ORDERS = [
  { id: 'STR-A7X2B1', customer: 'Alex Runner', item: 'Nike Pegasus 40', amount: 'R1,899', status: 'Delivered', date: '12 Feb' },
  { id: 'STR-C3K9P2', customer: 'Sara Pace', item: 'Hoka Clifton 9 ×2', amount: 'R4,598', status: 'Shipped', date: '12 Feb' },
  { id: 'STR-M5R8Q4', customer: 'Mike Trail', item: 'ASICS Gel-Kayano 30', amount: 'R2,499', status: 'Processing', date: '11 Feb' },
  { id: 'STR-P2L5N7', customer: 'Lisa Speed', item: 'Brooks Ghost 15', amount: 'R1,399', status: 'Processing', date: '11 Feb' },
  { id: 'STR-Q9R3T1', customer: 'Tom Distance', item: 'Adidas Ultraboost 23', amount: 'R2,999', status: 'Delivered', date: '10 Feb' },
]

const STATUS_COLORS = {
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Shipped: { bg: '#dbeafe', color: '#1e40af' },
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Active: { bg: '#dcfce7', color: '#166534' },
  'Low Stock': { bg: '#fef3c7', color: '#92400e' },
  'Out of Stock': { bg: '#fee2e2', color: '#991b1b' },
}

const REPORT_TABS = ['Financial', 'Top Products', 'Customers']

export default function AdminPage() {
  const { products: PRODUCTS_DATA, loading, refetch } = useProducts()
  const [activePanel, setActivePanel] = useState('dashboard')
  const [activeReport, setActiveReport] = useState('Financial')
  const [searchQ, setSearchQ] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const NAV = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'products', icon: '👟', label: 'Products' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ]

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try { await deleteProduct(id); refetch() }
    catch (err) { console.error(err) }
  }

  const filteredOrders = RECENT_ORDERS.filter(o =>
    !searchQ || [o.id, o.customer, o.item, o.status].some(v => v.toLowerCase().includes(searchQ.toLowerCase()))
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: 'var(--grey)' }}>

      {/* Add Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowAddModal(false); setEditingProduct(null) }}
          onSaved={() => { refetch(); setShowAddModal(false); setEditingProduct(null) }}
        />
      )}

      {/* Sidebar */}
      <aside style={{ background: 'var(--black)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'white', letterSpacing: 3 }}>STR<span style={{ color: 'var(--accent)' }}>I</span>DE</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'DM Mono', marginTop: 2 }}>Admin Panel</div>
        </div>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setActivePanel(item.id)}
            style={{ width: '100%', padding: '14px 20px', border: 'none', background: activePanel === item.id ? 'rgba(255,255,255,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500, color: activePanel === item.id ? 'white' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 12, borderLeft: activePanel === item.id ? '3px solid var(--accent)' : '3px solid transparent', transition: 'all 0.2s', fontFamily: 'DM Sans' }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' }}>
            ← View Store
          </a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: '40px', overflow: 'auto' }}>

        {/* ── DASHBOARD ── */}
        {activePanel === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2 }}>DASHBOARD</h1>
              <p style={{ color: 'var(--mid)', fontSize: 13 }}>Welcome back. Here's what's happening today.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {STATS.map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: s.up ? '#dcfce7' : '#fee2e2', color: s.up ? 'var(--green)' : 'var(--red)', padding: '3px 8px', borderRadius: 100 }}>{s.change}</span>
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--mid)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1 }}>RECENT ORDERS</h2>
                <button onClick={() => setActivePanel('orders')} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans' }}>View All →</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--grey)' }}>
                    {['Order ID', 'Customer', 'Item', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.slice(0, 5).map(order => (
                    <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700 }}>{order.id}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>{order.customer}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--mid)' }}>{order.item}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: 1 }}>{order.amount}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, ...STATUS_COLORS[order.status] }}>{order.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--mid)' }}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activePanel === 'products' && (
          <div>
            {loading
              ? <p style={{ color: 'var(--mid)', fontSize: 13 }}>Loading products...</p>
              : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                    <div>
                      <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2 }}>PRODUCTS</h1>
                      <p style={{ color: 'var(--mid)', fontSize: 13 }}>{PRODUCTS_DATA.length} products total</p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      style={{ padding: '12px 24px', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
                    >
                      + Add Product
                    </button>
                  </div>

                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--grey)' }}>
                          {['Product', 'Price', 'Stock', 'Status', ''].map(h => (
                            <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PRODUCTS_DATA.map(p => (
                          <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 48, height: 48, background: 'var(--grey)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.emoji}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--mid)' }}>{p.brand}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>{fmt(p.price)}</td>
                            <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: p.stock === 0 ? 'var(--red)' : p.stock <= 5 ? 'var(--yellow)' : 'var(--black)' }}>
                              {p.stock === 0 ? 'Out of Stock' : `${p.stock} pairs`}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, ...(STATUS_COLORS[p.status] || { bg: 'var(--grey)', color: 'var(--mid)' }) }}>{p.status}</span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>
                                  Edit
                                </button>                                <button
                                  onClick={() => handleDelete(p.id)}
                                  style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: '1px solid #fee2e2', borderRadius: 8, background: '#fee2e2', color: 'var(--red)', cursor: 'pointer' }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {activePanel === 'orders' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2 }}>ORDERS</h1>
              <p style={{ color: 'var(--mid)', fontSize: 13 }}>{RECENT_ORDERS.length} total orders</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by order ID, customer, item or status..."
                style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white' }} />
            </div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--grey)' }}>
                    {['Order ID', 'Customer', 'Item', 'Amount', 'Status', 'Date', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0
                    ? <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--mid)', fontSize: 14 }}>No orders match your search.</td></tr>
                    : filteredOrders.map(order => (
                      <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px', fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700 }}>{order.id}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>{order.customer}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--mid)' }}>{order.item}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: 1 }}>{order.amount}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, ...STATUS_COLORS[order.status] }}>{order.status}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--mid)' }}>{order.date}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>View</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activePanel === 'reports' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2 }}>REPORTS</h1>
              <p style={{ color: 'var(--mid)', fontSize: 13 }}>Analytics for the last 30 days</p>
            </div>
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 32, gap: 4 }}>
              {REPORT_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveReport(tab)}
                  style={{ padding: '12px 28px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: activeReport === tab ? 'var(--black)' : 'var(--mid)', borderBottom: `3px solid ${activeReport === tab ? 'var(--accent)' : 'transparent'}`, marginBottom: -2, borderRadius: '4px 4px 0 0', transition: 'all 0.2s', fontFamily: 'DM Sans' }}>
                  {tab}
                </button>
              ))}
            </div>
            {activeReport === 'Financial' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {[['Total Revenue', 'R284,320', '+12.4% vs last month'], ['Avg Order Value', 'R2,140', '+5.1% vs last month'], ['Refunds Issued', 'R8,400', '-2.1% vs last month']].map(([l, v, s]) => (
                    <div key={l} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 8, fontFamily: 'DM Mono', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>{v}</div>
                      <div style={{ fontSize: 12, color: 'var(--green)' }}>{s}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)' }}>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1, marginBottom: 20 }}>REVENUE BY MONTH</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                    {[65, 80, 55, 90, 75, 100, 85, 110, 95, 120, 88, 130].map((h, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', height: `${h}%`, opacity: i === 11 ? 1 : 0.5, transition: 'opacity 0.2s', cursor: 'pointer' }} title={`R${(h * 2200).toLocaleString()}`} />
                        <div style={{ fontSize: 8, color: 'var(--mid)', fontFamily: 'DM Mono' }}>{'JFMAMJJASOND'[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeReport === 'Top Products' && (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--grey)' }}>
                      {['#', 'Product', 'Units Sold', 'Revenue', 'Trend'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS_DATA.map((p, i) => (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 20, color: 'var(--mid)' }}>{i + 1}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 24 }}>{p.emoji}</span>
                            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--mid)' }}>{p.brand}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600 }}>{[142, 98, 76, 61, 43][i] ?? '—'}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>{fmt(([142, 98, 76, 61, 43][i] ?? 0) * p.price)}</td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: i < 3 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{i < 3 ? '↑ +' : '↓ -'}{[18, 12, 8, 3, 5][i] ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeReport === 'Customers' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[['Total Customers', '1,284', '+3.2%', true], ['New This Month', '156', '+18.4%', true], ['Repeat Buyers', '68%', '+2.1%', true], ['Avg Lifetime Value', 'R4,820', '+6.3%', true], ['Churn Rate', '2.4%', '-0.8%', true], ['NPS Score', '72', '+4pts', true]].map(([l, v, c, up]) => (
                  <div key={l} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 8, fontFamily: 'DM Mono', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 4 }}>{v}</div>
                    <div style={{ fontSize: 12, color: up ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{c}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}