'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getWishlist, addToWishlist, removeFromWishlist } from '@/services/wishlistService'

export function useWishlist() {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (!user) { setWishlist([]); return }
    getWishlist(user.uid).then(setWishlist)
  }, [user])

  const isWished = useCallback((productId) => {
    return wishlist.some(i => i.id === productId)
  }, [wishlist])

  const toggleWishlist = useCallback(async (product) => {
    if (!user) return
    const wished = wishlist.some(i => i.id === product.id)
    if (wished) {
      await removeFromWishlist(user.uid, product.id)
      setWishlist(prev => prev.filter(i => i.id !== product.id))
    } else {
      const item = { id: product.id, brand: product.brand, name: product.name, price: product.price, originalPrice: product.originalPrice || null, tag: product.tag || null, images: product.images || [] }
      await addToWishlist(user.uid, item)
      setWishlist(prev => [...prev, item])
    }
  }, [user, wishlist])

  return { wishlist, isWished, toggleWishlist }
}