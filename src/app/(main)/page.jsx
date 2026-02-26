
'use client'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/app/hooks/useProducts'

const S = {
  hero: { minHeight:'calc(90vh - 64px)',display:'grid',gridTemplateColumns:'1fr 1fr',overflow:'hidden' },
  heroLeft: { padding:'80px 48px',display:'flex',flexDirection:'column',justifyContent:'center',background:'var(--grey)' },
  heroRight: { background:'var(--grey)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:180,position:'relative' },
  eyebrow: { fontFamily:'DM Mono',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--accent)',marginBottom:24 },
  heroTitle: { fontFamily:'Bebas Neue',fontSize:'clamp(72px,8vw,120px)',lineHeight:0.92,letterSpacing:2,marginBottom:28 },
  heroSub: { fontSize:16,lineHeight:1.7,color:'var(--mid)',maxWidth:380,marginBottom:48,fontWeight:300 },
  btnPrimary: { background:'var(--black)',color:'var(--white)',padding:'16px 36px',borderRadius:4,fontSize:14,fontWeight:600,letterSpacing:'0.5px',border:'none',cursor:'pointer',transition:'all 0.2s',textDecoration:'none',display:'inline-block' },
  btnOutline: { background:'transparent',color:'var(--black)',padding:'16px 36px',borderRadius:4,fontSize:14,fontWeight:600,letterSpacing:'0.5px',border:'2px solid var(--black)',cursor:'pointer',transition:'all 0.2s',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8 },
  section: { padding:'80px 48px' },
  sectionTitle: { fontFamily:'Bebas Neue',fontSize:48,letterSpacing:2 },
  sectionSub: { fontSize:13,color:'var(--mid)',marginTop:4 },
  grid4: { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,marginTop:40 },
}

export default function HomePage() {
    const { products, loading } = useProducts()

  const topSellers = products.slice(0,4)
  const newArrivals = products.slice(4,8)

  return (
    <>
      {/* HERO */}
      <section style={S.hero}>
        <div style={S.heroLeft}>
          <p style={S.eyebrow}>🔥 New Season Collection — 2026</p>
          <h1 style={S.heroTitle}>FIND<br/>YOUR<br/><span style={{WebkitTextStroke:'2px var(--black)',color:'transparent'}}>PERFECT</span><br/>RUN</h1>
          <p style={S.heroSub}>AI-powered shoe recommendations tailored to your foot type, gait, and running goals. No guesswork.</p>
          <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:64}}>
            <Link href="/products" style={S.btnPrimary}>Shop Now</Link>
            <Link href="/ai-advisor" style={S.btnOutline}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Try AI Advisor
            </Link>
          </div>
          <div style={{display:'flex',gap:40}}>
            {[['200+','Models'],['15K+','Runners Matched'],['98%','Satisfaction']].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:'Bebas Neue',fontSize:36,letterSpacing:1}}>{n}</div>
                <div style={{fontSize:11,color:'var(--mid)',textTransform:'uppercase',letterSpacing:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.heroRight}>
          <div style={{position:'absolute',width:'120%',height:'120%',background:'radial-gradient(circle at 60% 50%, #ff4d1c18 0%, transparent 70%)'}}/>
          <span style={{fontSize:160,animation:'floatShoe 4s ease-in-out infinite',position:'relative',zIndex:1}}>👟</span>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section style={{padding:'0 48px',marginTop:-32,position:'relative',zIndex:10}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,maxWidth:860,margin:'0 auto'}}>
          <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:16,padding:32,cursor:'pointer'}}>
            <div style={{width:48,height:48,background:'var(--grey)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:20}}>📸</div>
            <div style={{fontFamily:'DM Mono',fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--accent)',marginBottom:8}}>Visual Search</div>
            <div style={{fontSize:18,fontWeight:600,marginBottom:10}}>Upload a Photo</div>
            <div style={{fontSize:13,color:'var(--mid)',lineHeight:1.6,fontWeight:300,marginBottom:24}}>See a shoe you love? Upload a picture and we'll find the closest match in our store.</div>
            <div style={{border:'2px dashed var(--border)',borderRadius:10,padding:20,textAlign:'center',fontSize:13,color:'var(--mid)',cursor:'pointer'}}>
              📎 &nbsp; Drop an image here or <strong>click to upload</strong>
            </div>
          </div>
          <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:16,padding:32,cursor:'pointer'}}>
            <div style={{width:48,height:48,background:'var(--grey)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:20}}>🤖</div>
            <div style={{fontFamily:'DM Mono',fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--accent)',marginBottom:8}}>AI Powered</div>
            <div style={{fontSize:18,fontWeight:600,marginBottom:10}}>Personal Shoe Advisor</div>
            <div style={{fontSize:13,color:'var(--mid)',lineHeight:1.6,fontWeight:300,marginBottom:24}}>Answer 5 quick questions about your running style and we'll find your perfect match.</div>
            <Link href="/ai-advisor" style={{display:'block'}}>
              <button style={{width:'100%',background:'var(--black)',color:'var(--white)',border:'none',borderRadius:10,padding:14,fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Start AI Consultation — Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* TOP SELLERS */}
      <section style={S.section}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40}}>
          <div><h2 style={S.sectionTitle}>TOP SELLERS</h2><p style={S.sectionSub}>Our best-performing shoes this season</p></div>
          <Link href="/products" style={{fontSize:13,fontWeight:600,borderBottom:'1px solid var(--black)',paddingBottom:2}}>View All →</Link>
        </div>
        <div style={S.grid4}>{topSellers.map(p=><ProductCard key={p.id} product={p}/>)}</div>
      </section>

      <div style={{height:1,background:'var(--border)',margin:'0 48px'}}/>

      {/* NEW ARRIVALS */}
      <section style={S.section}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40}}>
          <div><h2 style={S.sectionTitle}>NEW ARRIVALS</h2><p style={S.sectionSub}>Fresh drops — just landed</p></div>
          <Link href="/products" style={{fontSize:13,fontWeight:600,borderBottom:'1px solid var(--black)',paddingBottom:2}}>View All →</Link>
        </div>
        <div style={S.grid4}>{newArrivals.map(p=><ProductCard key={p.id} product={p}/>)}</div>
      </section>

      {/* BANNER */}
      <div style={{margin:'0 48px 80px',background:'var(--black)',borderRadius:24,padding:64,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:48,position:'relative',overflow:'hidden'}}>
        <div>
          <p style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--accent)',marginBottom:16}}>✦ Powered by AI</p>
          <h2 style={{fontFamily:'Bebas Neue',fontSize:56,color:'white',lineHeight:1,letterSpacing:2,marginBottom:16}}>NOT SURE WHICH<br/>SHOE IS RIGHT?</h2>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.5)',maxWidth:440,lineHeight:1.6,fontWeight:300}}>Answer 5 quick questions about your foot type, terrain, and running goals. Our AI will recommend the perfect shoe for you.</p>
        </div>
        <Link href="/ai-advisor" style={{background:'var(--accent)',color:'white',padding:'18px 40px',borderRadius:4,fontSize:14,fontWeight:700,whiteSpace:'nowrap',transition:'all 0.2s',display:'inline-block'}}>
          Start Free Consultation →
        </Link>
      </div>
    </>
  )
}