// hooks/useProducts.js
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
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