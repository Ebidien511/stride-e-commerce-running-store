'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/hooks/useWishlist'
import { fmt } from '@/lib/validation'
import ProductCard from '@/components/ProductCard'
import { useProduct, useProducts } from '@/hooks/useProducts'
import { getProductSummary } from '@/services/aiSearchService'

const SIZES = ['5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11']
const SOLD_OUT = ['5', '11']
const TABS = ['Description', 'Full Specs', 'AI Summary']

export const dynamic = 'force-dynamic'


export default function ProductDetailPage() {
  const { id } = useParams()
  const { product, loading } = useProduct(id)
  const { products } = useProducts()
  const { addItem, openCart } = useCart()
  const router = useRouter()

  const [selectedSize, setSelectedSize] = useState('7')
  const [activeThumb, setActiveThumb] = useState(0)
  const { isWished, toggleWishlist } = useWishlist()
  const wished = isWished(product?.id)
  const [activeTab, setActiveTab] = useState('Description')
  const [sizeError, setSizeError] = useState(false)

  const [aiSummary, setAiSummary] = useState(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSummaryError, setAiSummaryError] = useState('')

  const handleGenerateSummary = async () => {
    if (aiSummaryLoading) return
    setAiSummaryLoading(true)
    setAiSummaryError('')
    try {
      const summary = await getProductSummary(product)
      setAiSummary(summary)
    } catch (err) {
      console.error(err)
      setAiSummaryError('Failed to generate summary. Please try again.')
    } finally {
      setAiSummaryLoading(false)
    }
  }

  const related = products.filter(p => p.id !== id).slice(0, 4)

  if (loading) return (
    <div style={{ padding: '80px 48px', textAlign: 'center' }}>
      <p style={{ color: 'var(--mid)' }}>Loading product...</p>
    </div>
  )

  if (!product) return (
    <div style={{ padding: '80px 48px', textAlign: 'center' }}>
      <h1>Product not found</h1>
      <button onClick={() => router.push('/products')} style={{ marginTop: 16, padding: '12px 24px', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>← Back to Shop</button>
    </div>
  )

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return }
    addItem({ ...product, size: `UK ${selectedSize}`, meta: product.arch, cost: product.cost || 0 })
    openCart()
  }

  return (
    <div style={{ marginTop: 'var(--nav-h)', padding: '40px 48px 80px', maxWidth: 1400, margin: 'var(--nav-h) auto 0' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Mono', fontSize: 12, color: 'var(--mid)', marginBottom: 36 }}>
        <a href="/" style={{ color: 'var(--mid)' }}>Home</a><span>/</span>
        <a href="/products" style={{ color: 'var(--mid)' }}>All Shoes</a><span>/</span>
        <span style={{ color: 'var(--black)', fontWeight: 500 }}>{product.brand} {product.name}</span>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start' }}>
        {/* Gallery */}
        <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--grey)', borderRadius: 20, aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {product.images?.[activeThumb]
              ? <img src={product.images[activeThumb]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 180 }}>👟</span>
            }
            {product.tag && <span style={{ position: 'absolute', top: 18, left: 18, background: product.tag === 'New' ? 'var(--accent2)' : 'var(--accent)', color: 'white', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, textTransform: 'uppercase' }}>{product.tag}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} onClick={() => setActiveThumb(i)} style={{ aspectRatio: '1/1', background: 'var(--grey)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2px solid ${activeThumb === i ? 'var(--black)' : 'transparent'}`, fontSize: 40 }}>
                {product.images?.[i]
                  ? <img src={product.images[i]} alt={`${product.name} view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ opacity: 0.3 }}>👟</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 4 }}>
          <div>
            <div style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', marginBottom: 8 }}>{product.brand}</div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 56, lineHeight: 0.95, letterSpacing: 1 }}>{product.name}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: 1, lineHeight: 1 }}>{fmt(product.price)}</span>
            {product.originalPrice && <>
              <span style={{ fontSize: 18, color: 'var(--mid)', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>
              <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>Save {fmt(product.originalPrice - product.price)}</span>
            </>}
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Specs */}
          <div>
            <p style={{ fontFamily: 'DM Mono', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--mid)', marginBottom: 12 }}>Key Specs</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['Arch Type', product.arch], ['Terrain', product.terrain], ['Heel Drop', product.drop], ['Weight', product.weight], ['Cushioning', 'Moderate'], ['Level', 'All levels']].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--grey)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--mid)', fontWeight: 600, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Size picker */}
          <div>
            <p style={{ fontFamily: 'DM Mono', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--mid)', marginBottom: 12 }}>Select Size (UK)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SIZES.map(size => (
                <button key={size} disabled={SOLD_OUT.includes(size)}
                  onClick={() => { setSelectedSize(size); setSizeError(false) }}
                  style={{ minWidth: 52, height: 44, padding: '0 8px', border: `1.5px solid ${selectedSize === size ? 'var(--black)' : 'var(--border)'}`, borderRadius: 8, background: selectedSize === size ? 'var(--black)' : 'white', color: selectedSize === size ? 'white' : 'var(--black)', fontSize: 13, fontWeight: 500, cursor: SOLD_OUT.includes(size) ? 'not-allowed' : 'pointer', opacity: SOLD_OUT.includes(size) ? 0.35 : 1, textDecoration: SOLD_OUT.includes(size) ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                  {size}
                </button>
              ))}
            </div>
            {sizeError && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 8, fontWeight: 500 }}>Please select a size before adding to cart</p>}
            <p style={{ fontSize: 11, color: 'var(--mid)', marginTop: 8, fontStyle: 'italic' }}>Strikethrough sizes are currently unavailable</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: 'var(--black)', color: 'white', border: 'none', borderRadius: 10, padding: '17px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', letterSpacing: '0.5px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product)} style={{ width: 56, height: 56, border: `2px solid ${wished ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, background: wished ? '#fff0ed' : 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: wished ? 'var(--accent)' : 'inherit', transition: 'all 0.2s' }}>
              {wished ? '♥' : '♡'}
            </button>
          </div>

          {/* Delivery */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              [<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M195-195q-35-35-35-85H60l18-80h113q17-19 40-29.5t49-10.5q26 0 49 10.5t40 29.5h167l84-360H182l4-17q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35q-50 0-85-35Zm442-245h193l4-21-74-99h-95l-28 120Zm-19-273 2-7-84 360 2-7 34-146 46-200ZM20-427l20-80h220l-20 80H20Zm80-146 20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Z" /></svg>, 'Free delivery on orders over R500', 'Estimated 3–5 business days'],
              [<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M200-640h560v-80H200v80Zm0 0v-80 80Zm0 560q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v227q-19-9-39-15t-41-9v-43H200v400h252q7 22 16.5 42T491-80H200Zm378.5-18.5Q520-157 520-240t58.5-141.5Q637-440 720-440t141.5 58.5Q920-323 920-240T861.5-98.5Q803-40 720-40T578.5-98.5ZM787-145l28-28-75-75v-112h-40v128l87 87Z" /></svg>, 'Free returns within 30 days', 'No questions asked'],
              [<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>, '100% authentic products', 'Official authorised retailer'],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <div><strong style={{ display: 'block', fontWeight: 600, marginBottom: 2 }}>{title}</strong><span style={{ color: 'var(--mid)', fontSize: 12 }}>{sub}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 80 }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', gap: 4, marginBottom: 44 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 32px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', color: activeTab === tab ? 'var(--black)' : 'var(--mid)', borderBottom: `3px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`, marginBottom: -2, borderRadius: '4px 4px 0 0', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
              {tab === 'AI Summary' && (
                <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2835 8.75 11.25C8.75 12.2165 9.5335 13 10.5 13Z" />
                </svg>
              )}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Description' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ fontSize: 15, lineHeight: 1.85, color: '#444', fontWeight: 300 }}>
              <p style={{ marginBottom: 18 }}>{product.description}</p>
              <p>Whether you're running on city pavement or a light trail path, this shoe handles it comfortably. A solid all-round choice that earns its place in any runner's rotation.</p>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {product.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ width: 22, height: 22, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'Full Specs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.3s ease both' }}>
            {[
              [['Brand', product.brand], ['Model', product.name], ['Category', 'Road Running'], ['Arch Support', product.arch], ['Cushioning', 'Moderate'], ['Heel Drop', product.drop]],
              [['Weight', product.weight], ['Midsole', 'Proprietary Foam'], ['Outsole', 'Durable Rubber'], ['Upper', 'Engineered Mesh'], ['Experience Level', 'All levels'], ['Best For', 'Daily training']],
            ].map((col, ci) => (
              <div key={ci} style={ci === 0 ? { borderRight: '1px solid var(--border)' } : {}}>
                {col.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 24px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--mid)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'AI Summary' && (
          <div style={{ maxWidth: 780, animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff0ed', color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 100, border: '1px solid rgba(255,77,28,0.2)' }}>
                <svg height="12" width="12" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2835 8.75 11.25       Z" />
                </svg>
                AI Generated Summary
              </span>
              <button onClick={aiSummary ? handleGenerateSummary : undefined} disabled={aiSummaryLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '2px solid var(--border)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: aiSummaryLoading ? 'not-allowed' : 'pointer', opacity: aiSummaryLoading ? 0.6 : 1 }}>
                {aiSummaryLoading
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Generating...</>
                  : <><svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z" /></svg> {aiSummary ? 'Regenerate' : 'Generate Summary'}</>
                }
              </button>
            </div>

            {!aiSummary && !aiSummaryLoading && (
              <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--grey)', borderRadius: 16, border: '2px dashed var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <svg height="48" width="48" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--mid)' }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2832 8.75 11.25Z" />
                  </svg>
                </div>                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>GET AN AI EXPERT SUMMARY</h3>
                <p style={{ fontSize: 14, color: 'var(--mid)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>Click below to get a personalised expert analysis of this shoe — who it's best for, and who should look elsewhere.</p>
                <button onClick={handleGenerateSummary}
                  style={{ background: 'var(--black)', color: 'white', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  Generate AI Summary
                </button>
              </div>
            )}

            {aiSummaryLoading && (
              <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--grey)', borderRadius: 16 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                <p style={{ fontSize: 14, color: 'var(--mid)', fontWeight: 500 }}>Analysing shoe specs and generating expert summary...</p>
              </div>
            )}

            {aiSummaryError && (
              <p style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500, marginBottom: 16 }}>{aiSummaryError}</p>
            )}

            {aiSummary && !aiSummaryLoading && (
              <>
                <p style={{ fontSize: 15, lineHeight: 1.9, color: '#333', fontWeight: 300, marginBottom: 28, padding: 24, background: 'var(--grey)', borderRadius: 12, borderLeft: '3px solid var(--accent)' }}>
                  {aiSummary.summary}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: '✓  Great for', color: '#16a34a', items: aiSummary.greatFor },
                    { label: '✗  Not ideal for', color: '#dc2626', items: aiSummary.notIdealFor }
                  ].map(card => (
                    <div key={card.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14, color: card.color }}>{card.label}</div>
                      {card.items.map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, marginBottom: 10 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: card.color, flexShrink: 0 }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Related */}
      <div style={{ marginTop: 88 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 44, letterSpacing: 2 }}>YOU MIGHT ALSO LIKE</h2>
          <a href="/products" style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>View All →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}