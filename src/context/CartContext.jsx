'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const DELIVERY_FEE = 99
const FREE_THRESHOLD = 5000

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([
    { id: 'nike-pegasus-40', brand: 'Nike', name: 'Pegasus 40', price: 1899, size: 'UK 8', meta: 'Neutral', qty: 1, emoji: '👟' },
    { id: 'hoka-clifton-9',  brand: 'Hoka', name: 'Clifton 9',  price: 2299, size: 'UK 7.5', meta: 'Max Cushion', qty: 1, emoji: '👟' },
  ])
  const [isOpen, setIsOpen] = useState(false)

  const fmt = (n) => 'R' + n.toLocaleString('en-ZA')

  const openCart  = useCallback(() => { setIsOpen(true);  document.body.style.overflow = 'hidden' }, [])
  const closeCart = useCallback(() => { setIsOpen(false); document.body.style.overflow = '' }, [])

  const addItem = useCallback((item) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === item.size)
      if (existing) return prev.map(i => i.id === item.id && i.size === item.size ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id, size) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))
  }, [])

  const changeQty = useCallback((id, size, delta) => {
    setItems(prev =>
      prev.map(i => i.id === id && i.size === size ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((s, i) => s + i.qty, 0)
  const subtotal  = items.reduce((s, i) => s + i.qty * i.price, 0)
  const delivery  = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE
  const total     = subtotal + delivery

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addItem, removeItem, changeQty, clearCart, itemCount, subtotal, delivery, total, fmt }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}