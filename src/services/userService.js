import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'


export const getUserData = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export const updateUserData = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), data)
}

export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

export const getCustomerCount = async () => {
  const snap = await getCountFromServer(collection(db, 'users'))
  return snap.data().count
}