'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

function Label({ children }) {
  return <div style={{ fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--mid)', fontWeight: 600, marginBottom: 6 }}>{children}</div>
}

function Err({ msg }) {
  return msg ? <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 500, marginTop: 5 }}>{msg}</div> : null
}

export default function AuthPage() {
  const [mode, setMode] = useState('signin')  // signin | signup | forgot
  const router = useRouter()

  // Sign in state
  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [signInErr, setSignInErr] = useState({})
  const [signInMsg, setSignInMsg] = useState(null)

  // Sign up state
  const [signUp, setSignUp] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [signUpErr, setSignUpErr] = useState({})
  const [signUpMsg, setSignUpMsg] = useState(null)
  const [pwStrength, setPwStrength] = useState(0)

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotErr, setForgotErr] = useState('')
  const [forgotMsg, setForgotMsg] = useState(null)

  // Show/hide password
  const [showPw, setShowPw] = useState({ signIn: false, signUp: false, confirm: false })

  const inputStyle = (err) => ({ width: '100%', border: `1.5px solid ${err ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, padding: '11px 14px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', background: 'white', color: 'var(--black)' })

  const setSignPw = (v) => {
    setSignUp(p => ({ ...p, password: v })); setSignUpErr(p => ({ ...p, password: '' }))
    const s = v.length >= 12 ? 4 : v.length >= 8 ? 3 : v.length >= 6 ? 2 : v.length > 0 ? 1 : 0
    setPwStrength(s)
  }

  const handleSignIn = async () => {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signIn.email)) e.email = 'Enter a valid email'
    if (!signIn.password) e.password = 'Password is required'
    setSignInErr(e)
    if (Object.keys(e).length) return
    try {
      await signInWithEmail(signIn.email, signIn.password)
      setSignInMsg({ type: 'success', text: 'Welcome back! Signing you in...' })
      setTimeout(() => router.push('/'), 1200)
    } catch (err) {
      setSignInMsg({ type: 'error', text: err.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Sign in failed. Please try again.' })
    }
  }

  const handleSignUp = async () => {
    const e = {}
    if (!signUp.firstName.trim()) e.firstName = 'Required'
    if (!signUp.lastName.trim()) e.lastName = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUp.email)) e.email = 'Enter a valid email'
    if (signUp.password.length < 8) e.password = 'Minimum 8 characters'
    if (signUp.password !== signUp.confirm) e.confirm = 'Passwords do not match'
    setSignUpErr(e)
    if (Object.keys(e).length) return
    try {
      await signUpWithEmail(signUp.email, signUp.password, signUp.firstName, signUp.lastName)
      setSignUpMsg({ type: 'success', text: 'Account created! Redirecting...' })
      setTimeout(() => router.push('/'), 1200)
    } catch (err) {
      setSignUpMsg({ type: 'error', text: err.code === 'auth/email-already-in-use' ? 'An account with this email already exists' : 'Sign up failed. Please try again.' })
    }
  }

  const handleForgot = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setForgotErr('Enter a valid email'); return }
    try {
      await resetPassword(forgotEmail)
      setForgotErr('')
      setForgotMsg({ type: 'success', text: `Reset link sent to ${forgotEmail}. Check your inbox.` })
    } catch (err) {
      setForgotErr('Could not send reset email. Check the address and try again.')
    }
  }
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'var(--red)', 'var(--yellow)', '#3b82f6', 'var(--green)']

  const Logo = () => (
    <Link href="/" style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 3, display: 'block', marginBottom: 32, color: 'var(--black)' }}>
      STR<span style={{ color: 'var(--accent)' }}>I</span>DE
    </Link>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left — brand panel */}
      <div style={{ background: 'var(--black)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'radial-gradient(circle,rgba(255,77,28,0.3) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 48, color: 'white', letterSpacing: 3, marginBottom: 8 }}>STR<span style={{ color: 'var(--accent)' }}>I</span>DE</div>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px,5vw,72px)', color: 'white', lineHeight: 0.95, letterSpacing: 2, marginBottom: 24 }}>YOUR PERFECT<br />RUN STARTS<br /><span style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>HERE</span></h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, fontWeight: 300, maxWidth: 380 }}>AI-powered shoe recommendations tailored to your foot type, gait, and running goals.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48 }}>
          {[['🤖', 'AI-powered shoe matching'], ['🚚', 'Free delivery over R500'], ['↩️', '30-day hassle-free returns']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 64px', background: 'var(--grey)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Logo />

          {/* ── SIGN IN ── */}
          {mode === 'signin' && (
            <div>
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 32 }}>
                {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: mode === m ? 'var(--black)' : 'var(--mid)', borderBottom: `3px solid ${mode === m ? 'var(--accent)' : 'transparent'}`, marginBottom: -2, transition: 'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>

              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 24 }}>WELCOME BACK</h2>

              {signInMsg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: signInMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: signInMsg.type === 'success' ? 'var(--green)' : 'var(--red)', fontSize: 13, fontWeight: 500 }}>{signInMsg.text}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <Label>Email Address</Label>
                  <input style={inputStyle(signInErr.email)} type="email" value={signIn.email} onChange={e => { setSignIn(p => ({ ...p, email: e.target.value })); setSignInErr(p => ({ ...p, email: '' })) }} placeholder="jane@example.com" />
                  <Err msg={signInErr.email} />
                </div>
                <div>
                  <Label>Password</Label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle(signInErr.password), paddingRight: 44 }} type={showPw.signIn ? 'text' : 'password'} value={signIn.password} onChange={e => { setSignIn(p => ({ ...p, password: e.target.value })); setSignInErr(p => ({ ...p, password: '' })) }} placeholder="••••••••" />
                    <button onClick={() => setShowPw(p => ({ ...p, signIn: !p.signIn }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--mid)' }}>
                      {showPw.signIn ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <Err msg={signInErr.password} />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: 8, marginBottom: 24 }}>
                <button onClick={() => setMode('forgot')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans' }}>Forgot password?</button>
              </div>

              <button onClick={async () => {
                try {
                  await signInWithGoogle()
                  router.push('/')
                } catch (err) {
                  setSignInMsg({ type: 'error', text: 'Google sign in failed.' })
                }
              }} style={{ width: '100%', background: 'white', color: 'var(--black)', border: '1.5px solid var(--border)', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <img src="https://www.google.com/favicon.ico" width={16} height={16} /> Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--mid)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>


              <button onClick={handleSignIn} style={{ width: '100%', background: 'var(--black)', color: 'white', border: 'none', padding: '15px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >Sign In →</button>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--mid)', marginTop: 20 }}>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans', fontSize: 13 }}>Create one free →</button>
              </p>
            </div>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && (
            <div>
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 32 }}>
                {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: mode === m ? 'var(--black)' : 'var(--mid)', borderBottom: `3px solid ${mode === m ? 'var(--accent)' : 'transparent'}`, marginBottom: -2, transition: 'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>

              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 24 }}>CREATE ACCOUNT</h2>

              {signUpMsg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: '#dcfce7', color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>{signUpMsg.text}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><Label>First Name</Label><input style={inputStyle(signUpErr.firstName)} value={signUp.firstName} onChange={e => { setSignUp(p => ({ ...p, firstName: e.target.value.replace(/[^a-zA-Z\s\-']/g, '') })); setSignUpErr(p => ({ ...p, firstName: '' })) }} /><Err msg={signUpErr.firstName} /></div>
                  <div><Label>Last Name</Label><input style={inputStyle(signUpErr.lastName)} value={signUp.lastName} onChange={e => { setSignUp(p => ({ ...p, lastName: e.target.value.replace(/[^a-zA-Z\s\-']/g, '') })); setSignUpErr(p => ({ ...p, lastName: '' })) }} /><Err msg={signUpErr.lastName} /></div>
                </div>
                <div><Label>Email Address</Label><input style={inputStyle(signUpErr.email)} type="email" value={signUp.email} onChange={e => { setSignUp(p => ({ ...p, email: e.target.value })); setSignUpErr(p => ({ ...p, email: '' })) }} placeholder="jane@example.com" /><Err msg={signUpErr.email} /></div>
                <div>
                  <Label>Password</Label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle(signUpErr.password), paddingRight: 44 }} type={showPw.signUp ? 'text' : 'password'} value={signUp.password} onChange={e => setSignPw(e.target.value)} placeholder="Min 8 characters" />
                    <button onClick={() => setShowPw(p => ({ ...p, signUp: !p.signUp }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--mid)' }}>{showPw.signUp ? '🙈' : '👁️'}</button>
                  </div>
                  {signUp.password && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', width: `${pwStrength * 25}%`, background: strengthColor[pwStrength], borderRadius: 2, transition: 'all 0.3s' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</div>
                    </div>
                  )}
                  <Err msg={signUpErr.password} />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle(signUpErr.confirm), paddingRight: 44 }} type={showPw.confirm ? 'text' : 'password'} value={signUp.confirm} onChange={e => { setSignUp(p => ({ ...p, confirm: e.target.value })); setSignUpErr(p => ({ ...p, confirm: '' })) }} placeholder="••••••••" />
                    <button onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--mid)' }}>{showPw.confirm ? '🙈' : '👁️'}</button>
                  </div>
                  <Err msg={signUpErr.confirm} />
                </div>
              </div>


              <button onClick={async () => {
                try {
                  await signInWithGoogle()
                  router.push('/')
                } catch (err) {
                  setSignInMsg({ type: 'error', text: 'Google sign in failed.' })
                }
              }} style={{ width: '100%', background: 'white', color: 'var(--black)', border: '1.5px solid var(--border)', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, marginBottom: 12 }}>
                <img src="https://www.google.com/favicon.ico" width={16} height={16} /> Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--mid)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <button onClick={handleSignUp} style={{ width: '100%', background: 'var(--black)', color: 'white', border: 'none', padding: 15, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',  transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >Create Account →</button>
            </div>
          )}

          {/* ── FORGOT ── */}
          {mode === 'forgot' && (
            <div>
              <button onClick={() => setMode('signin')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--mid)', marginBottom: 32, fontFamily: 'DM Sans' }}>← Back to Sign In</button>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 1, marginBottom: 8 }}>RESET PASSWORD</h2>
              <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 28, lineHeight: 1.6 }}>Enter your email and we'll send you a link to reset your password.</p>

              {forgotMsg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: '#dcfce7', color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>{forgotMsg.text}</div>}

              <div style={{ marginBottom: 24 }}>
                <Label>Email Address</Label>
                <input style={inputStyle(forgotErr)} type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setForgotErr('') }} placeholder="jane@example.com" />
                <Err msg={forgotErr} />
              </div>

              <button onClick={handleForgot} style={{ width: '100%', background: 'var(--black)', color: 'white', border: 'none', padding: 15, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >Send Reset Link →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}