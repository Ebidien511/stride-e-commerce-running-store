'use client'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Navbar({ onSearchToggle, searchOpen }) {
  const { itemCount, openCart } = useCart()

  return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:100,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 48px',height:'var(--nav-h)',
      background:'rgba(250,250,248,0.92)',backdropFilter:'blur(12px)',
      borderBottom:'1px solid var(--border)',
    }}>
      <Link href="/" style={{ fontFamily:'Bebas Neue',fontSize:28,letterSpacing:3,color:'var(--black)' }}>
        STR<span style={{color:'var(--accent)'}}>I</span>DE
      </Link>

      <ul style={{display:'flex',gap:36}}>
        {[['Shop','/products'],['AI Advisor','/ai-advisor'],['About','/#about']].map(([label,href])=>(
          <li key={href}><Link href={href} style={{fontSize:13,fontWeight:500,letterSpacing:'0.5px',textTransform:'uppercase',transition:'color 0.2s'}}
            onMouseEnter={e=>e.target.style.color='var(--accent)'}
            onMouseLeave={e=>e.target.style.color='var(--black)'}
          >{label}</Link></li>
        ))}
      </ul>

      <div style={{display:'flex',alignItems:'center',gap:20}}>
        {/* Search */}
        <button onClick={onSearchToggle} style={{background:'none',border:'none',padding:0,display:'flex',alignItems:'center',color:searchOpen?'var(--accent)':'var(--black)',transition:'color 0.2s'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Wishlist */}
        <button style={{background:'none',border:'none',padding:0,display:'flex',color:'var(--black)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Cart */}
        <button onClick={openCart} style={{display:'flex',alignItems:'center',gap:8,background:'var(--black)',color:'white',border:'none',padding:'8px 20px',borderRadius:100,fontSize:13,fontWeight:500,transition:'background 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--accent)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--black)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Cart
          <span style={{background:'var(--accent)',color:'white',width:18,height:18,borderRadius:'50%',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {itemCount}
          </span>
        </button>

        {/* Account */}
        <Link href="/profile" style={{color:'var(--black)',display:'flex'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
      </div>
    </nav>
  )
}