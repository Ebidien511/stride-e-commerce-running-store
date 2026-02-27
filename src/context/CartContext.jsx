'use client'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getCartFromFirestore, saveCartToFirestore, clearCartFromFirestore } from '@/services/cartService'
const DELIVERY_FEE = 99
const FREE_THRESHOLD = 5000
const STORAGE_KEY = 'stride_guest_cart'

const CartContext = createContext(null)

// ── Helpers ──────────────────────────────────────────────────────────────────
const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const saveGuestCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const clearGuestCart = () => {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(true)
  const prevUserRef = useRef(null)

  // Load cart on mount and when user changes
  useEffect(() => {
    const prevUser = prevUserRef.current
    prevUserRef.current = user

    const load = async () => {
      setCartLoading(true)

      if (user) {
        // User just logged in — migrate guest cart to Firestore
        const guestItems = loadGuestCart()
        const firestoreItems = await getCartFromFirestore(user.uid)

        if (guestItems.length > 0) {
          // Merge guest cart into Firestore cart
          const merged = [...firestoreItems]
          guestItems.forEach(guestItem => {
            const existing = merged.find(i => i.id === guestItem.id && i.size === guestItem.size)
            if (existing) {
              existing.qty += guestItem.qty
            } else {
              merged.push(guestItem)
            }
          })
          await saveCartToFirestore(user.uid, merged)
          clearGuestCart()
          setItems(merged)
        } else {
          setItems(firestoreItems)
        }
      } else {
        // Guest — load from localStorage
        setItems(loadGuestCart())
      }

      setCartLoading(false)
    }

    load()
  }, [user])

  // Persist cart whenever items change
  useEffect(() => {
    if (cartLoading) return
    if (user) {
      saveCartToFirestore(user.uid, items)
    } else {
      saveGuestCart(items)
    }
  }, [items, user, cartLoading])

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

  const clearCart = useCallback(() => {
    setItems([])
    if (user) clearCartFromFirestore(user.uid)
    else clearGuestCart()
  }, [user])

  const itemCount = items.reduce((s, i) => s + i.qty, 0)
  const subtotal  = items.reduce((s, i) => s + i.qty * i.price, 0)
  const delivery  = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE
  const total     = subtotal + delivery

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addItem, removeItem, changeQty, clearCart, itemCount, subtotal, delivery, total, fmt, cartLoading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}