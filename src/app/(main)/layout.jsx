'use client'
import { useState } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import SearchBar from '@/components/SearchBar'

export default function MainLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar onSearchToggle={() => setSearchOpen(v => !v)} searchOpen={searchOpen} />
        <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <CartSidebar />
        <main style={{ paddingTop: 'var(--nav-h)' }}>{children}</main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  )
}