'use client'
import { useState } from 'react'
import { fmt } from '@/lib/validation'
import { useProducts } from '@/hooks/useProducts'
import ProductFormModal from '@/components/ProductFormModal'
import { deleteProduct } from '@/services/productServices'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllOrders, updateOrderStatus } from '@/services/orderService'
import { getCustomerCount } from '@/services/userService'

import { useEffect } from 'react'

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
  const [productSearchQ, setProductSearchQ] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [customerCount, setCustomerCount] = useState(0)

  // ── Computed report data ──────────────────────────────────────────────
const deliveredOrders = orders.filter(o => o.status !== 'Cancelled')

// Financial
const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
const totalCost = deliveredOrders.reduce((sum, o) => {
  return sum + (o.items?.reduce((s, item) => {
    const product = PRODUCTS_DATA.find(p => p.id === item.id)
    return s + ((product?.cost || 0) * item.qty)
  }, 0) || 0)
}, 0)
const grossProfit = totalRevenue - totalCost
const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0
const avgOrderValue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0
const today = new Date().toDateString()
const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today).length

// Product stats — count units sold per product from orders
const productSales = {}
deliveredOrders.forEach(o => {
  o.items?.forEach(item => {
    if (!productSales[item.id]) productSales[item.id] = { qty: 0, revenue: 0 }
    productSales[item.id].qty += item.qty
    productSales[item.id].revenue += item.qty * item.price
  })
})
const rankedProducts = PRODUCTS_DATA
  .map(p => ({ ...p, unitsSold: productSales[p.id]?.qty || 0, salesRevenue: productSales[p.id]?.revenue || 0 }))
  .sort((a, b) => b.unitsSold - a.unitsSold)

// Customer stats
const customerOrderMap = {}
deliveredOrders.forEach(o => {
  const email = o.details?.email
  if (!email) return
  if (!customerOrderMap[email]) customerOrderMap[email] = { name: `${o.details.firstName} ${o.details.lastName}`, email, orders: 0, spent: 0 }
  customerOrderMap[email].orders += 1
  customerOrderMap[email].spent += o.total || 0
})
const topCustomers = Object.values(customerOrderMap).sort((a, b) => b.spent - a.spent).slice(0, 5)
const repeatBuyers = Object.values(customerOrderMap).filter(c => c.orders > 1).length
const totalUniqueCustomers = Object.keys(customerOrderMap).length

  // Add to your existing useEffect:
  useEffect(() => {
    getAllOrders().then(data => {
      setOrders(data)
      setOrdersLoading(false)
    }).catch(err => console.error(err))
    getCustomerCount().then(setCustomerCount).catch(console.error)
  }, [])


  useEffect(() => {
    getAllOrders().then(data => {
      setOrders(data)
      setOrdersLoading(false)
    }).catch(err => console.error(err))
  }, [])

  const filteredProducts = PRODUCTS_DATA.filter(p =>
    !productSearchQ || [p.name, p.brand, p.category, p.status].some(v =>
      v?.toLowerCase().includes(productSearchQ.toLowerCase())
    )
  )

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error(err)
    }
  }

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


  return (
    <ProtectedRoute requiredRole="admin">
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
  {[
    { label: 'Total Revenue', value: `R${totalRevenue.toLocaleString('en-ZA')}`, icon: '💰', sub: `${deliveredOrders.length} orders` },
    { label: 'Orders Today', value: ordersToday, icon: '📦', sub: 'New orders today' },
    { label: 'Registered Customers', value: customerCount, icon: '👥', sub: 'Total accounts' },
    { label: 'Low Stock Items', value: PRODUCTS_DATA.filter(p => p.stock <= 5).length, icon: '⚠️', sub: '5 pairs or fewer' },
  ].map(s => (
    <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{s.icon}</span>
      </div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 4 }}>{s.value}</div>
      <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 2 }}>{s.label}</div>
      <div style={{ fontSize: 11, color: 'var(--mid)', opacity: 0.7 }}>{s.sub}</div>
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
                      {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (<th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px', fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700 }}>{order.id}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          <div style={{ fontWeight: 600 }}>{order.details?.firstName} {order.details?.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--mid)' }}>{order.details?.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--mid)', maxWidth: 200 }}>
                          {order.items?.map(i => `${i.name} (${i.size})`).join(', ')}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: 1 }}>
                          R{order.total?.toLocaleString('en-ZA')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={order.status}
                            onChange={e => handleStatusUpdate(order.id, e.target.value)}
                            style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans' }}>
                            {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--mid)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                        </td>
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

                    <div style={{ marginBottom: 20 }}>
                      <input
                        value={productSearchQ}
                        onChange={e => setProductSearchQ(e.target.value)}
                        placeholder="Search by name, brand, category or status..."
                        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white' }}
                      />
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
                          {filteredProducts.length === 0
                            ? <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--mid)', fontSize: 14 }}>No products match your search.</td></tr>
                            : filteredProducts.map(p => (
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
                <p style={{ color: 'var(--mid)', fontSize: 13 }}>{orders.length} total orders</p>
              </div>

              {/* Search + Filter */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search by order ID, customer, item or status..."
                  style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${statusFilter === s ? 'var(--black)' : 'var(--border)'}`, background: statusFilter === s ? 'var(--black)' : 'white', color: statusFilter === s ? 'white' : 'var(--black)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {ordersLoading ? (
                  <p style={{ padding: 48, textAlign: 'center', color: 'var(--mid)' }}>Loading orders...</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--grey)' }}>
                        {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => statusFilter === 'All' || o.status === statusFilter)
                        .filter(o => !searchQ || [o.id, o.details?.firstName, o.details?.lastName, o.details?.email, o.status].some(v => v?.toLowerCase().includes(searchQ.toLowerCase())))
                        .length === 0
                        ? <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--mid)', fontSize: 14 }}>No orders found.</td></tr>
                        : orders
                          .filter(o => statusFilter === 'All' || o.status === statusFilter)
                          .filter(o => !searchQ || [o.id, o.details?.firstName, o.details?.lastName, o.details?.email, o.status].some(v => v?.toLowerCase().includes(searchQ.toLowerCase())))
                          .map(order => (
                            <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                              <td style={{ padding: '14px 16px', fontFamily: 'DM Mono', fontSize: 12, fontWeight: 700 }}>{order.id}</td>
                              <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                <div style={{ fontWeight: 600 }}>{order.details?.firstName} {order.details?.lastName}</div>
                                <div style={{ fontSize: 11, color: 'var(--mid)' }}>{order.details?.email}</div>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--mid)', maxWidth: 200 }}>
                                {order.items?.map(i => `${i.name} (${i.size})`).join(', ')}
                              </td>
                              <td style={{ padding: '14px 16px', fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: 1 }}>
                                R{order.total?.toLocaleString('en-ZA')}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <select
                                  value={order.status}
                                  onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                  style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans' }}>
                                  {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--mid)' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <button style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>View</button>
                              </td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
{activePanel === 'reports' && (
  <div>
    <div style={{ marginBottom: 32 }}>
      <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2 }}>REPORTS</h1>
      <p style={{ color: 'var(--mid)', fontSize: 13 }}>Live data from your store</p>
    </div>
    <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 32, gap: 4 }}>
      {REPORT_TABS.map(tab => (
        <button key={tab} onClick={() => setActiveReport(tab)}
          style={{ padding: '12px 28px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: activeReport === tab ? 'var(--black)' : 'var(--mid)', borderBottom: `3px solid ${activeReport === tab ? 'var(--accent)' : 'transparent'}`, marginBottom: -2, borderRadius: '4px 4px 0 0', transition: 'all 0.2s', fontFamily: 'DM Sans' }}>
          {tab}
        </button>
      ))}
    </div>

    {/* ── FINANCIAL ── */}
    {activeReport === 'Financial' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            ['💰', 'Total Revenue', `R${totalRevenue.toLocaleString('en-ZA')}`, 'All non-cancelled orders'],
            ['🏷️', 'Cost of Sales', `R${totalCost.toLocaleString('en-ZA')}`, 'Wholesale cost of sold items'],
            ['📈', 'Gross Profit', `R${grossProfit.toLocaleString('en-ZA')}`, `${profitMargin}% profit margin`],
            ['🧾', 'Avg Order Value', `R${avgOrderValue.toLocaleString('en-ZA')}`, `Across ${deliveredOrders.length} orders`],
          ].map(([icon, label, value, sub]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 8, fontFamily: 'DM Mono', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Profit breakdown bar */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1, marginBottom: 20 }}>REVENUE BREAKDOWN</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Revenue', totalRevenue, 'var(--black)', totalRevenue],
              ['Cost of Sales', totalCost, '#ef4444', totalRevenue],
              ['Gross Profit', grossProfit, 'var(--green)', totalRevenue],
            ].map(([label, value, color, max]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>R{value.toLocaleString('en-ZA')}</span>
                </div>
                <div style={{ height: 10, background: 'var(--grey)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: max > 0 ? `${(value / max) * 100}%` : '0%', background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1, marginBottom: 20 }}>ORDERS BY STATUS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
              const count = orders.filter(o => o.status === status).length
              return (
                <div key={status} style={{ padding: 16, background: 'var(--grey)', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1 }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginTop: 4, ...STATUS_COLORS[status] }}>{status}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )}

    {/* ── TOP PRODUCTS ── */}
    {activeReport === 'Top Products' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1 }}>BEST SELLING PRODUCTS</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--grey)' }}>
                {['#', 'Product', 'Units Sold', 'Revenue', 'Cost', 'Profit'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankedProducts.length === 0
                ? <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--mid)' }}>No sales data yet.</td></tr>
                : rankedProducts.map((p, i) => {
                  const cost = (p.cost || 0) * p.unitsSold
                  const profit = p.salesRevenue - cost
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 20, color: i < 3 ? 'var(--accent)' : 'var(--mid)' }}>{i + 1}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{p.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--mid)' }}>{p.brand} · {p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700 }}>{p.unitsSold}</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>R{p.salesRevenue.toLocaleString('en-ZA')}</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, color: '#ef4444' }}>R{cost.toLocaleString('en-ZA')}</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, color: 'var(--green)' }}>R{profit.toLocaleString('en-ZA')}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {/* Sales by category */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1, marginBottom: 20 }}>SALES BY CATEGORY</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['road', 'trail', 'track', 'gym'].map(cat => {
              const catRevenue = rankedProducts.filter(p => p.category === cat).reduce((s, p) => s + p.salesRevenue, 0)
              const maxRevenue = Math.max(...['road', 'trail', 'track', 'gym'].map(c => rankedProducts.filter(p => p.category === c).reduce((s, p) => s + p.salesRevenue, 0)))
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{cat}</span>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 1 }}>R{catRevenue.toLocaleString('en-ZA')}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--grey)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: maxRevenue > 0 ? `${(catRevenue / maxRevenue) * 100}%` : '0%', background: 'var(--accent)', borderRadius: 100, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )}

    {/* ── CUSTOMERS ── */}
    {activeReport === 'Customers' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            ['👥', 'Registered Customers', customerCount, ''],
            ['🛍️', 'Customers Who Ordered', totalUniqueCustomers, ''],
            ['🔁', 'Repeat Buyers', repeatBuyers, `${totalUniqueCustomers > 0 ? ((repeatBuyers / totalUniqueCustomers) * 100).toFixed(0) : 0}% of buyers`],
            ['💸', 'Avg Customer Spend', totalUniqueCustomers > 0 ? `R${Math.round(totalRevenue / totalUniqueCustomers).toLocaleString('en-ZA')}` : 'R0', 'Per ordering customer'],
          ].map(([icon, label, value, sub]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 8, fontFamily: 'DM Mono', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 4 }}>{value}</div>
              {sub && <div style={{ fontSize: 11, color: 'var(--mid)' }}>{sub}</div>}
            </div>
          ))}
        </div>

        {/* Top customers table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1 }}>TOP CUSTOMERS BY SPEND</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--grey)' }}>
                {['#', 'Customer', 'Orders', 'Total Spent', 'Avg Order'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontFamily: 'DM Mono' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0
                ? <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--mid)' }}>No customer data yet.</td></tr>
                : topCustomers.map((c, i) => (
                  <tr key={c.email} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 20, color: i < 3 ? 'var(--accent)' : 'var(--mid)' }}>{i + 1}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--mid)' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700 }}>{c.orders}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>R{c.spent.toLocaleString('en-ZA')}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>R{Math.round(c.spent / c.orders).toLocaleString('en-ZA')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}
        </main>
      </div>
    </ProtectedRoute>
  )
}