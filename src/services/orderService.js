import { doc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const placeOrder = async ({ uid, items, details, payMethod, subtotal, delivery, total }) => {
  const orderId = 'STR-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  const order = {
    id: orderId,
    uid,
    items,
    details,
    payMethod,
    subtotal,
    delivery,
    total,
    status: 'Processing',
    createdAt: new Date().toISOString(),
  }
  await setDoc(doc(db, 'orders', orderId), order)
  return orderId
}

export const getUserOrders = async (uid) => {
  const q = query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}