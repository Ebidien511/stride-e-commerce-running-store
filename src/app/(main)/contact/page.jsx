'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.subject.trim()) e.subject = 'Required'
    if (form.message.trim().length < 10) e.message = 'Message too short'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const inputStyle = (err) => ({
    width: '100%',
    border: `1.5px solid ${err ? 'var(--red)' : 'var(--border)'}`,
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 14,
    fontFamily: 'DM Sans',
    outline: 'none',
    background: 'white',
    color: 'var(--black)',
    boxSizing: 'border-box',
    boxShadow: err ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
    transition: 'border-color 0.2s',
  })

  const Label = ({ children }) => (
    <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontWeight: 600, marginBottom: 8 }}>{children}</div>
  )

  const Err = ({ msg }) => msg ? <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 500, marginTop: 5 }}>{msg}</div> : null

  return (
    <>
      {/* HERO */}
      <section style={{
        background: 'var(--black)',
        padding: '80px 48px',
        marginTop: 'var(--nav-h)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,77,28,0.1) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20 }}>Get In Touch</p>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(56px,7vw,96px)', lineHeight: 0.92, letterSpacing: 2, color: 'white', marginBottom: 24 }}>
            WE'D LOVE TO<br />
            <span style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>HEAR</span> FROM YOU
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontWeight: 300, maxWidth: 480 }}>
            Whether you have a question about a shoe, need help with an order, or just want to talk running — our team is here for you.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section style={{ padding: '80px 48px', maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'start' }}>

        {/* CONTACT FORM */}
        <div>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2, marginBottom: 8 }}>SEND US A MESSAGE</h2>
          <p style={{ fontSize: 14, color: 'var(--mid)', marginBottom: 40, fontWeight: 300 }}>We typically respond within 24 hours on business days.</p>

          {submitted ? (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 16, padding: '48px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1, marginBottom: 8, color: '#166534' }}>MESSAGE SENT!</h3>
              <p style={{ fontSize: 14, color: '#166534', marginBottom: 24, fontWeight: 300 }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                style={{ background: '#166534', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Full Name</Label>
                  <input style={inputStyle(errors.name)} value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" />
                  <Err msg={errors.name} />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <input style={inputStyle(errors.email)} value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                  <Err msg={errors.email} />
                </div>
              </div>

              <div>
                <Label>Subject</Label>
                <select style={{ ...inputStyle(errors.subject), cursor: 'pointer' }} value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">Select a topic...</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="return">Returns & Exchanges</option>
                  <option value="ai">AI Advisor Feedback</option>
                  <option value="other">Other</option>
                </select>
                <Err msg={errors.subject} />
              </div>

              <div>
                <Label>Message</Label>
                <textarea
                  style={{ ...inputStyle(errors.message), resize: 'vertical', minHeight: 160, lineHeight: 1.6 }}
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder="Tell us how we can help..."
                />
                <Err msg={errors.message} />
              </div>

              <button onClick={handleSubmit} disabled={loading}
                style={{ background: loading ? 'var(--mid)' : 'var(--black)', color: 'white', border: 'none', borderRadius: 10, padding: '16px 32px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', width: 'fit-content' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--black)' }}
              >
                {loading ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Sending...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>Send Message</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR — Store Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Contact Details */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--black)' }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, color: 'white' }}>CONTACT INFO</h3>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                  label: 'Email',
                  value: 'support@stride.co.za',
                  sub: 'We reply within 24 hours',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
                  label: 'Phone',
                  value: '+27 21 777 8577',
                  sub: 'Mon–Fri, 9am–5pm SAST',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
                  label: 'Address',
                  value: 'Cape Town, South Africa',
                  sub: 'Online store only',
                },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, background: 'var(--grey)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--black)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'DM Mono', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--mid)' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Store Hours */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--black)' }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, color: 'white' }}>SUPPORT HOURS</h3>
            </div>
            <div style={{ padding: 24 }}>
              {[
                ['Monday – Friday', '9:00am – 5:00pm'],
                ['Saturday', '9:00am – 1:00pm'],
                ['Sunday', 'Closed'],
                ['Public Holidays', 'Closed'],
              ].map(([day, hours]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--mid)' }}>{day}</span>
                  <span style={{ fontWeight: 600, color: hours === 'Closed' ? 'var(--red)' : 'var(--black)' }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: 'var(--grey)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', marginBottom: 16 }}>Quick Help</div>
            {[
              ['Track my order', '/profile'],
              ['Returns & exchanges', '/contact'],
              ['AI shoe advisor', '/ai-advisor'],
              ['Browse all shoes', '/products'],
            ].map(([label, href]) => (
              <Link key={label} href={href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--black)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--black)'}
              >
                {label} <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM BANNER */}
      <div style={{ margin: '0 48px 80px', background: 'var(--black)', borderRadius: 24, padding: '48px 64px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(255,77,28,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>✦ Not sure what you need?</p>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 44, color: 'white', lineHeight: 1, letterSpacing: 2, marginBottom: 12 }}>LET OUR AI FIND YOUR SHOE</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Answer 6 quick questions and get a personalised recommendation in seconds.</p>
        </div>
        <Link href="/ai-advisor" style={{ background: 'var(--accent)', color: 'white', padding: '16px 36px', borderRadius: 4, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block', position: 'relative', zIndex: 1 }}>
          Start Free Consultation →
        </Link>
      </div>
    </>
  )
}