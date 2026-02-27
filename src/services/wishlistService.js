import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const getWishlist = async (uid) => {
  const snap = await getDoc(doc(db, 'wishlists', uid))
  return snap.exists() ? snap.data().items : []
}

export const addToWishlist = async (uid, product) => {
  const ref = doc(db, 'wishlists', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { items: [product] })
  } else {
    await updateDoc(ref, { items: arrayUnion(product) })
  }
}

export const removeFromWishlist = async (uid, productId) => {
  const ref = doc(db, 'wishlists', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const updated = snap.data().items.filter(i => i.id !== productId)
  await updateDoc(ref, { items: updated })
}