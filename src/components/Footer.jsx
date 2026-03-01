import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <footer style={{ background: 'var(--black)', color: 'rgba(255,255,255,0.6)', padding: 48, display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48 }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'white', letterSpacing: 3, marginBottom: 12 }}>STR<span style={{ color: 'var(--accent)' }}>I</span>DE</div>
          <p style={{ fontSize: 13, lineHeight: 1.6, fontWeight: 300 }}>AI-powered running shoe recommendations. Find your perfect fit without the guesswork.</p>
        </div>
        {[
          { title: 'Shop', links: [['Road Shoes', '/products?category=road'], ['Trail Shoes', '/products?category=trail'], ['New Arrivals', '/products'], ['Sale', '/products']] },
          { title: 'Help', links: [['Contact Us', '/contact'], ['Track Order', '/profile'], ['AI Advisor', '/ai-advisor'], ['About Us', '/about']] },
          { title: 'Account', links: [['Sign In', '/auth'], ['Register', '/auth'], ['Order History', '/profile'], ['Wishlist', '/profile?tab=wishlist']] },
        ].map(col => (
          <div key={col.title}>
            <h4 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'white', marginBottom: 20 }}>{col.title}</h4>
            {col.links.map(([label, href]) => (
              <Link key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              >{label}</Link>
            ))}
          </div>
        ))}
      </footer>
      <div style={{ background: '#111', padding: '16px 48px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        <span>© 2026 STRIDE. All rights reserved.</span>
        <span>Privacy Policy · Terms of Service</span>
      </div>
    </>
  )
}