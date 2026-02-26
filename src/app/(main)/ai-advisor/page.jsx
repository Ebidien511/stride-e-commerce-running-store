'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fmt } from '@/lib/validation'
import { useProducts } from '@/app/hooks/useProducts'

const QUESTIONS = [
  {
    id: 'arch',
    question: 'What is your arch type?',
    sub: 'If you\'re unsure, wet your foot and step on paper — a full imprint means flat feet.',
    options: [
      { value: 'neutral', label: 'Neutral Arch', desc: 'Normal curve, most common', icon: '🦶' },
      { value: 'flat',    label: 'Flat Feet',    desc: 'Low or no arch (overpronation)', icon: '👣' },
      { value: 'high',    label: 'High Arch',    desc: 'Strong curve, underpronation', icon: '🩴' },
      { value: 'unsure',  label: 'Not Sure',     desc: 'We\'ll recommend something versatile', icon: '🤷' },
    ],
  },
  {
    id: 'terrain',
    question: 'Where do you mostly run?',
    sub: 'Your primary surface determines the outsole and grip you need.',
    options: [
      { value: 'road',     label: 'Road / Pavement', desc: 'Tarmac, concrete, urban', icon: '🏙️' },
      { value: 'trail',    label: 'Trail / Off-road', desc: 'Dirt, gravel, forest paths', icon: '🌲' },
      { value: 'treadmill',label: 'Treadmill',        desc: 'Indoor gym running', icon: '🏃' },
      { value: 'mixed',    label: 'Mixed surfaces',   desc: 'Bit of everything', icon: '🗺️' },
    ],
  },
  {
    id: 'experience',
    question: 'What is your running experience?',
    sub: 'This helps us match cushioning and support levels.',
    options: [
      { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out, < 6 months', icon: '🌱' },
      { value: 'intermediate', label: 'Intermediate', desc: '6 months – 2 years', icon: '🏃‍♂️' },
      { value: 'advanced',     label: 'Advanced',     desc: '2+ years, regular mileage', icon: '⚡' },
      { value: 'competitive',  label: 'Competitive',  desc: 'Racing, speed training', icon: '🏆' },
    ],
  },
  {
    id: 'cushion',
    question: 'How much cushioning do you prefer?',
    sub: 'More cushion = softer but heavier. Less = lighter but more ground feel.',
    options: [
      { value: 'minimal',  label: 'Minimal',   desc: 'Barefoot-like, max ground feel', icon: '🪨' },
      { value: 'moderate', label: 'Moderate',  desc: 'Balanced — responsive & protective', icon: '⚖️' },
      { value: 'maximum',  label: 'Maximum',   desc: 'Cloud-like, long distance comfort', icon: '☁️' },
      { value: 'unsure',   label: 'Not Sure',  desc: 'Recommend based on my other answers', icon: '🤔' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget?',
    sub: 'We\'ll only show shoes in your range. All prices include VAT.',
    options: [
      { value: '0-1500',   label: 'Under R1,500', desc: 'Great value options', icon: '💰' },
      { value: '1500-2500',label: 'R1,500 – R2,500', desc: 'Most popular range', icon: '💳' },
      { value: '2500-3500',label: 'R2,500 – R3,500', desc: 'Premium performance', icon: '💎' },
      { value: '3500+',    label: 'R3,500+', desc: 'Elite, no compromises', icon: '👑' },
    ],
  },
]

export default function AIAdvisorPage() {
  const { products, loading } = useProducts()  // 👈 add this
  const [phase, setPhase]     = useState('intro')   // intro | quiz | loading | results
  const [qIndex, setQIndex]   = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const router = useRouter()

  const currentQ = QUESTIONS[qIndex]
  const progress = ((qIndex + 1) / QUESTIONS.length) * 100

  const handleAnswer = (val) => setSelected(val)

  const next = () => {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(i => i + 1)
    } else {
      setPhase('loading')
      setTimeout(() => setPhase('results'), 2200)
    }
  }

  const back = () => {
    if (qIndex === 0) { setPhase('intro'); setSelected(null); return }
    setQIndex(i => i - 1)
    setSelected(answers[QUESTIONS[qIndex - 1].id] || null)
  }

  // Simple recommendation logic based on answers
  const getRecommendations = () => {
    const budget = answers.budget || '1500-2500'
    const [min, max] = budget === '3500+' ? [3500, 99999] : budget.split('-').map(Number)
    return products
      .filter(p => p.price >= min && (budget === '3500+' || p.price <= max))
      .slice(0, 3)
      .map((p, i) => ({ ...p, matchScore: 98 - i * 6, matchReason: i === 0 ? 'Best Match' : i === 1 ? 'Great Alternative' : 'Budget Pick' }))
  }

  const recommendations = phase === 'results' ? getRecommendations() : []

  // ── INTRO ──
  if (phase === 'intro') return (
    <div style={{minHeight:'calc(100vh - var(--nav-h))',display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 48px',background:'var(--grey)'}}>
      <div style={{maxWidth:680,textAlign:'center'}}>
        <div style={{width:80,height:80,background:'var(--black)',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 32px'}}>🤖</div>
        <p style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--accent)',marginBottom:16}}>AI-Powered</p>
        <h1 style={{fontFamily:'Bebas Neue',fontSize:'clamp(48px,6vw,80px)',letterSpacing:2,lineHeight:0.95,marginBottom:24}}>YOUR PERSONAL<br/>SHOE ADVISOR</h1>
        <p style={{fontSize:16,color:'var(--mid)',lineHeight:1.7,fontWeight:300,maxWidth:500,margin:'0 auto 48px'}}>Answer 5 quick questions about your foot type, running style, and goals. Our AI will recommend the perfect shoes for you — no running store visit needed.</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:48}}>
          {[['5 questions','Takes under 2 minutes'],['AI matching','Based on your profile'],['Free advice','No account needed']].map(([t,s])=>(
            <div key={t} style={{background:'white',borderRadius:12,padding:'20px 16px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{t}</div>
              <div style={{fontSize:12,color:'var(--mid)'}}>{s}</div>
            </div>
          ))}
        </div>

        <button onClick={()=>setPhase('quiz')} style={{background:'var(--black)',color:'white',border:'none',padding:'18px 48px',borderRadius:4,fontSize:16,fontWeight:700,cursor:'pointer',letterSpacing:'0.5px',transition:'all 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--accent)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--black)'}
        >
          Start Free Consultation →
        </button>
      </div>
    </div>
  )

  // ── QUIZ ──
  if (phase === 'quiz') return (
    <div style={{minHeight:'calc(100vh - var(--nav-h))',padding:'60px 48px',maxWidth:800,margin:'0 auto'}}>
      {/* Progress bar */}
      <div style={{marginBottom:48}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--mid)',fontFamily:'DM Mono',marginBottom:10}}>
          <span>Question {qIndex + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',background:'var(--accent)',borderRadius:2,width:`${progress}%`,transition:'width 0.4s ease'}}/>
        </div>
      </div>

      {/* Question */}
      <div style={{animation:'fadeUp 0.4s ease both'}}>
        <h2 style={{fontFamily:'Bebas Neue',fontSize:40,letterSpacing:1,marginBottom:8}}>{currentQ.question}</h2>
        <p style={{color:'var(--mid)',fontSize:14,marginBottom:36,fontWeight:300}}>{currentQ.sub}</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:40}}>
          {currentQ.options.map(opt => (
            <button key={opt.value} onClick={()=>handleAnswer(opt.value)}
              style={{padding:24,border:`2px solid ${selected===opt.value?'var(--black)':'var(--border)'}`,borderRadius:16,background:selected===opt.value?'#f7f5f2':'white',cursor:'pointer',textAlign:'left',transition:'all 0.2s',transform:selected===opt.value?'scale(1.01)':'scale(1)'}}>
              <div style={{fontSize:32,marginBottom:12}}>{opt.icon}</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{opt.label}</div>
              <div style={{fontSize:13,color:'var(--mid)',fontWeight:300}}>{opt.desc}</div>
              {selected===opt.value && <div style={{marginTop:12,fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1}}>✓ Selected</div>}
            </button>
          ))}
        </div>

        <div style={{display:'flex',gap:16,justifyContent:'space-between',alignItems:'center'}}>
          <button onClick={back} style={{padding:'14px 24px',border:'2px solid var(--border)',borderRadius:10,fontSize:14,fontWeight:600,background:'white',cursor:'pointer',color:'var(--mid)'}}>
            ← Back
          </button>
          <button onClick={next} disabled={!selected}
            style={{padding:'14px 40px',background:selected?'var(--black)':'var(--border)',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:selected?'pointer':'not-allowed',transition:'all 0.2s'}}>
            {qIndex < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Recommendations →'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── LOADING ──
  if (phase === 'loading') return (
    <div style={{minHeight:'calc(100vh - var(--nav-h))',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24}}>
      <div style={{width:72,height:72,border:'4px solid var(--grey)',borderTop:'4px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <h2 style={{fontFamily:'Bebas Neue',fontSize:32,letterSpacing:2}}>ANALYSING YOUR PROFILE</h2>
      <p style={{color:'var(--mid)',fontSize:14}}>Finding your perfect shoes...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

    if (phase === 'results' && loading) return (
    <div style={{minHeight:'calc(100vh - var(--nav-h))',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'var(--mid)'}}>Loading recommendations...</p>
    </div>
  )

  // ── RESULTS ──
  return (
    <div style={{padding:'60px 48px 80px',maxWidth:1200,margin:'0 auto'}}>
      <div style={{marginBottom:48}}>
        <p style={{fontFamily:'DM Mono',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--accent)',marginBottom:12}}>🤖 AI Recommendation</p>
        <h1 style={{fontFamily:'Bebas Neue',fontSize:'clamp(48px,6vw,72px)',letterSpacing:2,marginBottom:16}}>YOUR PERFECT MATCHES</h1>
        <p style={{fontSize:15,color:'var(--mid)',fontWeight:300,maxWidth:560,lineHeight:1.7}}>Based on your profile, we found {recommendations.length} shoes that match your arch type, terrain, and budget.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:32,alignItems:'start'}}>
        {/* Cards */}
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {recommendations.map((product, i) => (
            <div key={product.id} style={{background:'white',border:`2px solid ${i===0?'var(--accent)':'var(--border)'}`,borderRadius:20,padding:28,display:'grid',gridTemplateColumns:'120px 1fr auto',gap:24,alignItems:'center',position:'relative',overflow:'hidden',transition:'transform 0.2s,box-shadow 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.08)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}
            >
              {i === 0 && <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,var(--accent),var(--accent2))'}}/>}
              <div style={{width:120,height:120,background:'var(--grey)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>{product.emoji}</div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <span style={{fontFamily:'DM Mono',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:2,background:i===0?'var(--accent)':'var(--black)',color:'white',padding:'3px 10px',borderRadius:100}}>{product.matchReason}</span>
                  <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>{product.matchScore}% match</span>
                </div>
                <div style={{fontFamily:'DM Mono',fontSize:10,color:'var(--mid)',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>{product.brand}</div>
                <div style={{fontFamily:'Bebas Neue',fontSize:28,letterSpacing:1,marginBottom:8}}>{product.name}</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {[product.arch, product.terrain, product.drop, product.weight].map(tag=>(
                    <span key={tag} style={{fontSize:11,background:'var(--grey)',padding:'3px 10px',borderRadius:100,color:'var(--mid)'}}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:12,alignItems:'flex-end'}}>
                <div style={{fontFamily:'Bebas Neue',fontSize:28,letterSpacing:1}}>{fmt(product.price)}</div>
                <button onClick={()=>router.push(`/product/${product.id}`)}
                  style={{padding:'12px 24px',background:i===0?'var(--black)':'white',color:i===0?'white':'var(--black)',border:`2px solid ${i===0?'var(--black)':'var(--border)'}`,borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--accent)';e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='white'}}
                  onMouseLeave={e=>{e.currentTarget.style.background=i===0?'var(--black)':'white';e.currentTarget.style.borderColor=i===0?'var(--black)':'var(--border)';e.currentTarget.style.color=i===0?'white':'var(--black)'}}
                >View Details →</button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar — Your Profile */}
        <div style={{display:'flex',flexDirection:'column',gap:16,position:'sticky',top:88}}>
          <div style={{background:'white',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',background:'var(--black)'}}>
              <h3 style={{fontFamily:'Bebas Neue',fontSize:18,letterSpacing:1,color:'white'}}>YOUR PROFILE</h3>
            </div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
              {QUESTIONS.map(q=>(
                <div key={q.id} style={{display:'flex',justifyContent:'space-between',fontSize:13,paddingBottom:12,borderBottom:'1px solid var(--border)'}}>
                  <span style={{color:'var(--mid)',fontFamily:'DM Mono',fontSize:10,textTransform:'uppercase',letterSpacing:1}}>{q.id}</span>
                  <span style={{fontWeight:600,textTransform:'capitalize'}}>{answers[q.id] || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={()=>{setPhase('intro');setQIndex(0);setAnswers({});setSelected(null)}}
            style={{width:'100%',background:'none',border:'2px solid var(--border)',borderRadius:12,padding:14,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--black)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >🔄 Retake Quiz</button>

          <a href="/products" style={{display:'block',textAlign:'center',padding:14,background:'var(--grey)',borderRadius:12,fontSize:13,fontWeight:600,color:'var(--black)'}}>Browse All Shoes →</a>
        </div>
      </div>
    </div>
  )
}