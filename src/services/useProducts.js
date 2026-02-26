// hooks/useProducts.js
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snapshot = await getDocs(collection(db, 'products'))
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setProducts(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return { products, loading, error }
}

export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() })
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  return { product, loading }
}