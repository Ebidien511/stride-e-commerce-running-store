import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const getCartFromFirestore = async (uid) => {
  const snap = await getDoc(doc(db, 'carts', uid))
  return snap.exists() ? snap.data().items : []
}

export const saveCartToFirestore = async (uid, items) => {
  await setDoc(doc(db, 'carts', uid), { items, updatedAt: new Date().toISOString() })
}

export const clearCartFromFirestore = async (uid) => {
  await deleteDoc(doc(db, 'carts', uid))
}