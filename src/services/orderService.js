import { doc, setDoc, collection, getDocs, query, where, orderBy, updateDoc, getDoc } from 'firebase/firestore'
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

export const getAllOrders = async () => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

export const updateOrderStatus = async (orderId, status) => {
  await updateDoc(doc(db, 'orders', orderId), { status })
}

export const decreaseStock = async (items) => {
  for (const item of items) {
    const ref = doc(db, 'products', item.id)
    const snap = await getDoc(ref)
    if (!snap.exists()) continue
    const currentStock = snap.data().stock || 0
    const newStock = Math.max(0, currentStock - item.qty)
    const status = newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'Active'
    await updateDoc(ref, { stock: newStock, status })
  }
}

export const cancelOrder = async (orderId) => {
  await updateDoc(doc(db, 'orders', orderId), { status: 'Cancelled' })
}