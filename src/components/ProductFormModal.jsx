'use client'
import { useState } from 'react'
import { addProduct, updateProduct } from '@/services/productServices'

const BRANDS = ['Nike', 'ASICS', 'Brooks', 'Hoka', 'Adidas', 'New Balance', 'On Running', 'Saucony', 'Puma', 'New Era']
const CATEGORIES = ['road', 'trail', 'track', 'gym']
const ARCH_TYPES = ['Neutral', 'Stability', 'Motion Control']
const TAGS = ['', 'New', 'Sale', 'Best Seller', 'Hot']
const TERRAINS = ['Road', 'Trail', 'Track', 'Treadmill', 'Mixed']
const EMOJIS = ['👟', '🥾', '👠', '🩴', '👞']

const EMPTY_FORM = {
  brand: '', name: '', category: '', arch: '', terrain: '',
  drop: '', weight: '', price: '', originalPrice: '',
  tag: '', emoji: '👟', description: '', features: '', stock: '',
}

// When editing, convert the product object to form-compatible values
const productToForm = (product) => ({
  brand: product.brand || '',
  name: product.name || '',
  category: product.category || '',
  arch: product.arch || '',
  terrain: product.terrain || '',
  drop: product.drop || '',
  weight: product.weight || '',
  price: product.price?.toString() || '',
  originalPrice: product.originalPrice?.toString() || '',
  tag: product.tag || '',
  emoji: product.emoji || '👟',
  description: product.description || '',
  features: Array.isArray(product.features) ? product.features.join('\n') : '',
  stock: product.stock?.toString() || '',
})

function validate(form) {
  const errors = {}
  if (!form.brand)           errors.brand = 'Brand is required'
  if (!form.name.trim())     errors.name = 'Product name is required'
  if (!form.category)        errors.category = 'Category is required'
  if (!form.arch)            errors.arch = 'Arch type is required'
  if (!form.terrain)         errors.terrain = 'Terrain is required'
  if (!form.drop.trim())     errors.drop = 'Heel drop is required (e.g. 8mm)'
  if (!form.weight.trim())   errors.weight = 'Weight is required (e.g. 280g)'
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
    errors.price = 'Enter a valid price'
  if (form.originalPrice && (isNaN(Number(form.originalPrice)) || Number(form.originalPrice) <= Number(form.price)))
    errors.originalPrice = 'Original price must be greater than current price'
  if (!form.description.trim()) errors.description = 'Description is required'
  if (!form.features.trim())    errors.features = 'Enter at least one feature'
  if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
    errors.stock = 'Enter a valid stock number'
  return errors
}

function slugify(brand, name) {
  return `${brand}-${name}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function buildProductPayload(form, existingId = null) {
  const stock = Number(form.stock)
  return {
    id: existingId || slugify(form.brand, form.name),
    brand: form.brand,
    name: form.name.trim(),
    category: form.category,
    arch: form.arch,
    terrain: form.terrain,
    drop: form.drop.trim(),
    weight: form.weight.trim(),
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
    tag: form.tag || null,
    emoji: form.emoji,
    description: form.description.trim(),
    features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
    stock,
    status: stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'Active',
  }
}

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 14px', fontSize: 13, fontFamily: 'DM Sans',
  border: `1.5px solid ${hasError ? '#ef4444' : 'var(--border)'}`,
  borderRadius: 8, outline: 'none', background: 'white',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
})

const selectStyle = (hasError) => ({
  ...inputStyle(hasError), cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32,
})

const labelStyle = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px',
  color: 'var(--mid)', marginBottom: 6, display: 'block', fontFamily: 'DM Mono',
}
const errorStyle = { fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: 500 }

// ─── Component ───────────────────────────────────────────────────────────────
// Props:
//   product  — if provided, modal opens in EDIT mode pre-filled with product data
//   onClose  — called when modal should close
//   onSaved  — called after successful add or edit (triggers refetch)

export default function ProductFormModal({ product = null, onClose, onSaved }) {
  const isEditing = Boolean(product)

  const [form, setForm] = useState(isEditing ? productToForm(product) : EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const payload = buildProductPayload(form, isEditing ? product.id : null)

      if (isEditing) {
        await updateProduct(product.id, payload)
      } else {
        await addProduct(payload)
      }

      setSaved(true)
      setTimeout(() => { onSaved?.(); onClose() }, 1200)
    } catch (err) {
      console.error('Failed to save product:', err)
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(2px)' }} />

      {/* Modal */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, background: 'white', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 2 }}>
              {isEditing ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>
              {isEditing ? `Editing ${product.brand} ${product.name}` : 'Fill in the details below to add to your catalogue'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--grey)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Brand + Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Brand *</label>
              <select value={form.brand} onChange={e => set('brand', e.target.value)} style={selectStyle(errors.brand)}>
                <option value="">Select brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.brand && <p style={errorStyle}>{errors.brand}</p>}
            </div>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pegasus 41" style={inputStyle(errors.name)} />
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>
          </div>

          {/* Category + Arch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={selectStyle(errors.category)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              {errors.category && <p style={errorStyle}>{errors.category}</p>}
            </div>
            <div>
              <label style={labelStyle}>Arch Support *</label>
              <select value={form.arch} onChange={e => set('arch', e.target.value)} style={selectStyle(errors.arch)}>
                <option value="">Select arch type</option>
                {ARCH_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.arch && <p style={errorStyle}>{errors.arch}</p>}
            </div>
          </div>

          {/* Terrain + Tag */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Terrain *</label>
              <select value={form.terrain} onChange={e => set('terrain', e.target.value)} style={selectStyle(errors.terrain)}>
                <option value="">Select terrain</option>
                {TERRAINS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.terrain && <p style={errorStyle}>{errors.terrain}</p>}
            </div>
            <div>
              <label style={labelStyle}>Tag</label>
              <select value={form.tag} onChange={e => set('tag', e.target.value)} style={selectStyle(false)}>
                {TAGS.map(t => <option key={t} value={t}>{t || 'No tag'}</option>)}
              </select>
            </div>
          </div>

          {/* Drop + Weight + Emoji */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Heel Drop *</label>
              <input value={form.drop} onChange={e => set('drop', e.target.value)} placeholder="e.g. 10mm" style={inputStyle(errors.drop)} />
              {errors.drop && <p style={errorStyle}>{errors.drop}</p>}
            </div>
            <div>
              <label style={labelStyle}>Weight *</label>
              <input value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 280g" style={inputStyle(errors.weight)} />
              {errors.weight && <p style={errorStyle}>{errors.weight}</p>}
            </div>
            <div>
              <label style={labelStyle}>Emoji</label>
              <select value={form.emoji} onChange={e => set('emoji', e.target.value)} style={selectStyle(false)}>
                {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Original Price + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Price (R) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 1899" style={inputStyle(errors.price)} />
              {errors.price && <p style={errorStyle}>{errors.price}</p>}
            </div>
            <div>
              <label style={labelStyle}>Original Price (R)</label>
              <input type="number" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="e.g. 2299" style={inputStyle(errors.originalPrice)} />
              {errors.originalPrice && <p style={errorStyle}>{errors.originalPrice}</p>}
              <p style={{ fontSize: 10, color: 'var(--mid)', marginTop: 4 }}>Leave blank if no sale</p>
            </div>
            <div>
              <label style={labelStyle}>Stock (pairs) *</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 24" style={inputStyle(errors.stock)} />
              {errors.stock && <p style={errorStyle}>{errors.stock}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the shoe in 1-2 sentences..." rows={3}
              style={{ ...inputStyle(errors.description), resize: 'vertical', lineHeight: 1.6 }} />
            {errors.description && <p style={errorStyle}>{errors.description}</p>}
          </div>

          {/* Features */}
          <div>
            <label style={labelStyle}>Features * <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one per line)</span></label>
            <textarea value={form.features} onChange={e => set('features', e.target.value)} placeholder={'React foam midsole\nBreathable mesh upper\nWaffle outsole'} rows={4}
              style={{ ...inputStyle(errors.features), resize: 'vertical', lineHeight: 1.8, fontFamily: 'DM Mono', fontSize: 12 }} />
            {errors.features && <p style={errorStyle}>{errors.features}</p>}
          </div>

          {/* Document ID preview — only show when adding */}
          {!isEditing && form.brand && form.name && (
            <div style={{ background: 'var(--grey)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--mid)', fontFamily: 'DM Mono', textTransform: 'uppercase', letterSpacing: 1 }}>Document ID:</span>
              <span style={{ fontSize: 12, fontFamily: 'DM Mono', fontWeight: 600 }}>{slugify(form.brand, form.name)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12, flexShrink: 0, background: 'white' }}>
          <button onClick={onClose} style={{ padding: '11px 24px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'white', cursor: 'pointer', fontFamily: 'DM Sans' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '11px 28px', background: saved ? '#16a34a' : saving ? 'var(--mid)' : 'var(--black)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', transition: 'all 0.2s', minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saved
              ? `✓ ${isEditing ? 'Changes Saved!' : 'Product Added!'}`
              : saving ? 'Saving...'
              : isEditing ? 'Save Changes' : '+ Add Product'}
          </button>
        </div>
      </div>
    </>
  )
}