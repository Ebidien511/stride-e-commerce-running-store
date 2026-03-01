import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'

import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const googleProvider = new GoogleAuthProvider()

// Creates Firestore user doc on first sign up
const createUserDoc = async (user, extraData = {}) => {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      role: 'customer',
      createdAt: new Date().toISOString(),
      phone: '',
      address: { street: '', city: '', province: 'Western Cape', postal: '' },
      runProfile: { arch: 'Neutral', terrain: 'Road', size: 'UK 8' },
      ...extraData,
    })
  }
}

export const signUpWithEmail = async (email, password, firstName, lastName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await createUserDoc(user, { firstName, lastName })
  return user
}

export const signInWithEmail = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export const signInWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, googleProvider)
  await createUserDoc(user, { firstName: user.displayName?.split(' ')[0] || '', lastName: user.displayName?.split(' ')[1] || '' })
  return user
}

export const logOut = async () => {
  await signOut(auth)
}

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email)
}