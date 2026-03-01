'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import { getUserData } from '@/services/userService'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { aiSearch, analyseImage, getPersonalisedRecommendations } from '@/services/aiSearchService'

const S = {
  hero: { minHeight: 'calc(90vh - 64px)', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' },
  heroLeft: { padding: '80px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--grey)' },
  heroRight: { background: 'var(--grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 180, position: 'relative' },
  eyebrow: { fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24 },
  heroTitle: { fontFamily: 'Bebas Neue', fontSize: 'clamp(72px,8vw,120px)', lineHeight: 0.92, letterSpacing: 2, marginBottom: 28 },
  heroSub: { fontSize: 16, lineHeight: 1.7, color: 'var(--mid)', maxWidth: 380, marginBottom: 48, fontWeight: 300 },
  btnPrimary: { background: 'var(--black)', color: 'var(--white)', padding: '16px 36px', borderRadius: 4, fontSize: 14, fontWeight: 600, letterSpacing: '0.5px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none', display: 'inline-block' },
  btnOutline: { background: 'transparent', color: 'var(--black)', padding: '16px 36px', borderRadius: 4, fontSize: 14, fontWeight: 600, letterSpacing: '0.5px', border: '2px solid var(--black)', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 },
  section: { padding: '80px 48px' },
  sectionTitle: { fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: 2 },
  sectionSub: { fontSize: 13, color: 'var(--mid)', marginTop: 4 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 40 },
}

export default function HomePage() {
  const { products, loading } = useProducts()

  const topSellers = products.filter(p => p.tag === 'Best Seller').slice(0, 4)
  const newArrivals = products.filter(p => p.tag === 'New').slice(0, 4)
  const router = useRouter()

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')


  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const { user } = useAuth()
  const [recommended, setRecommended] = useState([])
  const [recLoading, setRecLoading] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)


  useEffect(() => {
    if (!user || loading) return
    const fetchRecs = async () => {
      try {
        const data = await getUserData(user.uid)
        if (!data?.runProfile?.arch) { setHasProfile(false); return }
        setHasProfile(true)
        setRecLoading(true)
        const ids = await getPersonalisedRecommendations(data.runProfile, products)
        const recs = ids.map(id => products.find(p => p.id === id)).filter(Boolean)
        setRecommended(recs)
      } catch (err) {
        console.error(err)
      } finally {
        setRecLoading(false)
      }
    }
    fetchRecs()
  }, [user, products, loading])

  const handleImageSearch = async (file) => {
    if (!file) return
    setImageLoading(true)
    setImageError('')
    setPreviewUrl(URL.createObjectURL(file))
    try {
      const result = await analyseImage(file, products)
      if (!result.match || result.ids.length === 0) {
        setImageError("We couldn't find any shoe in this image. Please upload a photo of a shoe.")
        setImageLoading(false)
        return
      }
      const topMatchId = result.ids[0]
      const topMatch = products.find(p => p.id === topMatchId)
      const matchName = topMatch ? `${topMatch.brand} ${topMatch.name}` : 'a similar shoe'
      router.push(`/products?ai=${encodeURIComponent(JSON.stringify(result.ids))}&prompt=${encodeURIComponent(`Visual match — closest to ${matchName}`)}`)
    } catch (err) {
      console.error(err)
      setImageError('Image search failed. Please try again.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleAiSearch = async () => {
    if (!aiPrompt.trim() || aiLoading) return
    setAiLoading(true)
    setAiError('')
    try {
      const rankedIds = await aiSearch(aiPrompt, products)
      router.push(`/products?ai=${encodeURIComponent(JSON.stringify(rankedIds))}&prompt=${encodeURIComponent(aiPrompt)}`)
    } catch (err) {
      console.error(err)
      setAiError('Search failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
      {/* HERO */}
      <section style={{ ...S.hero, position: 'relative', overflow: 'hidden' }}>

        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/v1772366318/From_KlickPin_CF_Running_vibe_Running_motivation_Gym_workouts_Fitness_motivation_a2kczo.mp4`}
            type="video/mp4"
          />
        </video>

        {/* OVERLAY */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 1,
        }} />

        {/* HERO CONTENT */}
        <div style={{ ...S.heroLeft, position: 'relative', zIndex: 2, background: 'transparent' }}>
          <p style={{ ...S.eyebrow, color: 'var(--accent)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            🔥 New Season Collection — 2026
          </p>
          <h1 style={{ ...S.heroTitle, color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            FIND<br />YOUR<br />
            <span style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>PERFECT</span>
            <br />RUN
          </h1>
          <p style={{ ...S.heroSub, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Describe what you're looking for and our AI will find your perfect shoe.
          </p>

          <div style={{ marginBottom: 40 }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid var(--border)', borderRadius: 12, padding: '4px 4px 4px 20px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <svg height="18" width="18" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--mid)', flexShrink: 0 }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2835 8.75 11.25C8.75 12.2165 9.5335 13 10.5 13Z" fill="currentColor" />
              </svg>              <input
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                placeholder="e.g. trail shoes under R2000 with neutral arch..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'DM Sans', background: 'transparent', padding: '12px 0' }}
              />
              <button onClick={handleAiSearch} disabled={aiLoading || !aiPrompt.trim()}
                style={{ background: aiLoading ? 'var(--mid)' : 'var(--black)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 13, fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => { if (!aiLoading) e.currentTarget.style.background = 'var(--accent)' }}
                onMouseLeave={e => { if (!aiLoading) e.currentTarget.style.background = 'var(--black)' }}
              >
                {aiLoading ? <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Searching...
                </> : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  Find My Shoe
                </>}
              </button>
            </div>
            {aiError && <p style={{ fontSize: 12, color: '#ff6b6b', marginTop: 8, fontWeight: 500 }}>{aiError}</p>}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 10, fontFamily: 'DM Mono' }}>
              Try: "lightweight road shoe for marathons" · "stable trail shoe under R2500"
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 64 }}>
            <Link href="/products" style={S.btnPrimary}>Browse All Shoes</Link>
          </div>

          <div style={{ display: 'flex', gap: 40 }}>
            {[['200+', 'Models'], ['15K+', 'Runners Matched'], ['98%', 'Satisfaction']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 1, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* FEATURE CARDS */}
      <section style={{ padding: '0 48px', marginTop: -32, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, maxWidth: 860, margin: '0 auto' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
            <div style={{ width: 48, height: 48, background: 'var(--grey)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg height="24" width="24" viewBox="0 0 16 16" style={{ color: 'var(--black)' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.5 3.5H3.5L5 1H11L12.5 3.5H14.5H16V5V12.5C16 13.8807 14.8807 15 13.5 15H2.5C1.11929 15 0 13.8807 0 12.5V5V3.5H1.5ZM4.78624 4.27174L5.84929 2.5H10.1507L11.2138 4.27174L11.6507 5H12.5H14.5V12.5C14.5 13.0523 14.0523 13.5 13.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V5H3.5H4.34929L4.78624 4.27174ZM9.75 8.5C9.75 9.4665 8.9665 10.25 8 10.25C7.0335 10.25 6.25 9.4665 6.25 8.5C6.25 7.5335 7.0335 6.75 8 6.75C8.9665 6.75 9.75 7.5335 9.75 8.5ZM11.25 8.5C11.25 10.2949 9.79493 11.75 8 11.75C6.20507 11.75 4.75 10.2949 4.75 8.5C4.75 6.70507 6.20507 5.25 8 5.25C9.79493 5.25 11.25 6.70507 11.25 8.5Z" fill="currentColor" />
              </svg>
            </div>            <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Visual Search</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Upload a Photo</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.6, fontWeight: 300, marginBottom: 24 }}>See a shoe you love? Upload a picture and we'll find the closest match in our store.</div>

            <input type="file" accept="image/*" id="image-search-input" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleImageSearch(e.target.files[0])}
            />

            {previewUrl ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                <img src={previewUrl} alt="Uploaded shoe" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                {imageLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600, gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    Analysing...
                  </div>
                )}
              </div>
            ) : (
              <label htmlFor="image-search-input" style={{ display: 'block' }}>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--mid)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--black)'; e.currentTarget.style.background = 'var(--grey)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                >
                  📎 &nbsp; Drop an image here or <strong>click to upload</strong>
                </div>
              </label>
            )}

            {imageError && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8, fontWeight: 500 }}>{imageError}</p>}

            {previewUrl && !imageLoading && (
              <button onClick={() => { setPreviewUrl(null); setImageError('') }}
                style={{ marginTop: 8, fontSize: 11, color: 'var(--mid)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans' }}>
                Clear image
              </button>
            )}
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, background: 'var(--grey)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg height="24" width="24" viewBox="0 0 16 16" style={{ color: 'var(--black)' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2835 8.75 11.25C8.75 12.2165 9.5335 13 10.5 13Z" fill="currentColor" />
              </svg>
            </div>            <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>AI Powered</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Personal Shoe Advisor</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.6, fontWeight: 300, marginBottom: 24 }}>Answer 6 quick questions about your running style and we'll find your perfect match.</div>
            <Link href="/ai-advisor" style={{ display: 'block' }}>
              <button style={{ width: '100%', background: 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Start AI Consultation — Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* RECOMMENDED FOR YOU */}
      {user && (
        <section style={S.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>✦ Personalised for you</p>
              <h2 style={S.sectionTitle}>RECOMMENDED FOR YOU</h2>
              <p style={S.sectionSub}>Based on your running profile</p>
            </div>
            <Link href="/ai-advisor" style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>
              {hasProfile ? 'Update Profile →' : 'Complete Profile →'}
            </Link>
          </div>

          {recLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--mid)', fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Finding your perfect matches...
            </div>
          )}

          {!recLoading && !hasProfile && (
            <div style={{ background: 'white', border: '2px dashed var(--border)', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>GET PERSONALISED RECOMMENDATIONS</h3>
              <p style={{ fontSize: 14, color: 'var(--mid)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>Complete your running profile quiz and we'll recommend the perfect shoes for you every time you visit.</p>
              <Link href="/ai-advisor" style={{ background: 'var(--black)', color: 'white', padding: '14px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'inline-block' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >
                Take the Quiz →
              </Link>
            </div>
          )}

          {!recLoading && hasProfile && recommended.length > 0 && (
            <div style={S.grid4}>
              {recommended.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '0 48px' }} />

      {/* TOP SELLERS */}
      <section style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div><h2 style={S.sectionTitle}>TOP SELLERS</h2><p style={S.sectionSub}>Our best-performing shoes this season</p></div>
          <Link href="/products" style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>View All →</Link>
        </div>
        <div style={S.grid4}>{topSellers.map(p => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 48px' }} />

      {/* NEW ARRIVALS */}
      <section style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div><h2 style={S.sectionTitle}>NEW ARRIVALS</h2><p style={S.sectionSub}>Fresh drops — just landed</p></div>
          <Link href="/products" style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>View All →</Link>
        </div>
        <div style={S.grid4}>{newArrivals.map(p => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      {/* BANNER */}
      <div style={{ margin: '0 48px 80px', background: 'var(--black)', borderRadius: 24, padding: 64, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 48, position: 'relative', overflow: 'hidden' }}>
        <div>
          <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>✦ Powered by AI</p>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 56, color: 'white', lineHeight: 1, letterSpacing: 2, marginBottom: 16 }}>NOT SURE WHICH<br />SHOE IS RIGHT?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 440, lineHeight: 1.6, fontWeight: 300 }}>Answer 6 quick questions about your foot type, terrain, and running goals. Our AI will recommend the perfect shoe for you.</p>
        </div>
        <Link href="/ai-advisor" style={{ background: 'var(--accent)', color: 'white', padding: '18px 40px', borderRadius: 4, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'inline-block' }}>
          Start Free Consultation →
        </Link>
      </div>
    </>
  )
}