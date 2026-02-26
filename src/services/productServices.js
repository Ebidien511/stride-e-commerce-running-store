import { doc, deleteDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const addProduct = async (product) => {
  await setDoc(doc(db, 'products', product.id), product)
}

export const updateProduct = async (id, updates) => {
  await updateDoc(doc(db, 'products', id), updates)
}

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id))
}