'use client'
import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { PRODUCTS } from '@/lib/products'

const PILLS = ['All','Road','Trail','Track','Gym']
const ARCH_TYPES = ['Neutral','Stability','Motion Control']
const BRANDS = ['Nike','ASICS','Brooks','Hoka','Adidas','New Balance','On Running','Saucony']

function ProductsContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const [activePill, setActivePill]     = useState('All')
  const [checkedArch, setCheckedArch]   = useState([])
  const [checkedBrand, setCheckedBrand] = useState([])
  const [priceMin, setPriceMin]         = useState('')
  const [priceMax, setPriceMax]         = useState('')
  const [sort, setSort]                 = useState('popular')

  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(v=>v!==val) : [...prev,val])

  const clearAll = () => { setActivePill('All'); setCheckedArch([]); setCheckedBrand([]); setPriceMin(''); setPriceMax('') }

  const filtered = useMemo(() => {
    return PRODUCTS
      .filter(p => {
        if (activePill !== 'All' && p.category !== activePill.toLowerCase()) return false
        if (checkedArch.length  && !checkedArch.includes(p.arch))   return false
        if (checkedBrand.length && !checkedBrand.includes(p.brand)) return false
        if (priceMin !== '' && p.price < Number(priceMin)) return false
        if (priceMax !== '' && p.price > Number(priceMax)) return false
        if (q && !`${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase())) return false
        return true
      })
      .sort((a,b) => sort==='price-asc'?a.price-b.price:sort==='price-desc'?b.price-a.price:0)
  }, [activePill, checkedArch, checkedBrand, priceMin, priceMax, sort, q])

  const CheckBox = ({checked, onClick}) => (
    <div onClick={onClick} style={{width:16,height:16,border:`2px solid ${checked?'var(--black)':'var(--border)'}`,borderRadius:4,background:checked?'var(--black)':'white',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'white',fontWeight:700}}>
      {checked?'✓':''}
    </div>
  )

  return (
    <div style={{paddingTop:'var(--nav-h)'}}>
      {/* Page header */}
      <div style={{padding:'32px 48px 0',display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div>
          <p style={{fontSize:12,color:'var(--mid)',fontFamily:'DM Mono',marginBottom:10}}>Home / <span style={{color:'var(--accent)'}}>All Shoes</span></p>
          <h1 style={{fontFamily:'Bebas Neue',fontSize:56,letterSpacing:2}}>ALL SHOES</h1>
        </div>
        <p style={{fontSize:13,color:'var(--mid)',fontFamily:'DM Mono',paddingBottom:8}}><strong style={{color:'var(--black)'}}>{filtered.length}</strong> products found</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:32,padding:'32px 48px 80px',alignItems:'start'}}>
        {/* SIDEBAR */}
        <aside style={{position:'sticky',top:88,background:'white',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px'}}>Filters</span>
            <button onClick={clearAll} style={{fontSize:11,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',fontFamily:'DM Sans'}}>Clear all</button>
          </div>

          {/* Category */}
          {[
            { title:'Category', items:[['Road Running','road',12],['Trail Running','trail',7],['Track & Speed','track',3],['Gym & Training','gym',5]] },
          ].map(sec=>(
            <div key={sec.title} style={{padding:'20px 24px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'var(--mid)',marginBottom:14}}>Category ▾</div>
              {sec.items.map(([label,val,count])=>(
                <label key={val} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:10}}>
                  <CheckBox checked={activePill.toLowerCase()===val} onClick={()=>setActivePill(label.split(' ')[0])}/>
                  <span style={{fontSize:13,flex:1}}>{label}</span>
                  <span style={{fontSize:11,color:'var(--mid)',fontFamily:'DM Mono'}}>{count}</span>
                </label>
              ))}
            </div>
          ))}

          {/* Arch Support */}
          <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'var(--mid)',marginBottom:14}}>Arch Support ▾</div>
            {ARCH_TYPES.map(a=>(
              <label key={a} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:10}}>
                <CheckBox checked={checkedArch.includes(a)} onClick={()=>toggle(checkedArch,setCheckedArch,a)}/>
                <span style={{fontSize:13}}>{a}</span>
              </label>
            ))}
          </div>

          {/* Brand */}
          <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'var(--mid)',marginBottom:14}}>Brand ▾</div>
            {BRANDS.map(b=>(
              <label key={b} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:10}}>
                <CheckBox checked={checkedBrand.includes(b)} onClick={()=>toggle(checkedBrand,setCheckedBrand,b)}/>
                <span style={{fontSize:13}}>{b}</span>
              </label>
            ))}
          </div>

          {/* Price */}
          <div style={{padding:'20px 24px'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'var(--mid)',marginBottom:14}}>Price Range ▾</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {[['Min',priceMin,setPriceMin,'0'],['Max',priceMax,setPriceMax,'5000']].map(([lbl,val,set,ph])=>(
                <div key={lbl} style={{flex:1,display:'flex',alignItems:'center',border:'1px solid var(--border)',borderRadius:8,background:'var(--grey)',overflow:'hidden'}}>
                  <span style={{padding:'8px 6px 8px 10px',fontSize:13,color:'var(--mid)'}}>R</span>
                  <input type="number" placeholder={ph} value={val} onChange={e=>set(e.target.value)}
                    style={{flex:1,border:'none',outline:'none',padding:'8px 10px 8px 0',fontSize:13,background:'transparent',width:'100%'}}/>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCTS AREA */}
        <div>
          {/* Toolbar */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <div style={{display:'flex',gap:8}}>
              {PILLS.map(p=>(
                <button key={p} onClick={()=>setActivePill(p)} style={{padding:'8px 20px',borderRadius:100,fontSize:13,fontWeight:500,cursor:'pointer',border:'1px solid var(--border)',background:activePill===p?'var(--black)':'white',color:activePill===p?'white':'var(--black)',transition:'all 0.2s'}}>
                  {p}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontSize:13,background:'white',cursor:'pointer',outline:'none'}}>
              <option value="popular">Sort: Most Popular</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>

          {/* Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {filtered.length === 0
              ? <div style={{gridColumn:'1/-1',textAlign:'center',padding:80}}><div style={{fontSize:56,marginBottom:16}}>🔍</div><h2 style={{fontFamily:'Bebas Neue',fontSize:32,marginBottom:8}}>NO RESULTS FOUND</h2><p style={{fontSize:14,color:'var(--mid)'}}>Try adjusting your filters or search term.</p></div>
              : filtered.map(p=><ProductCard key={p.id} product={p}/>)
            }
          </div>

          {/* Pagination */}
          <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:48}}>
            {['‹',1,2,3,'›'].map((n,i)=>(
              <button key={i} style={{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:n===1?13:16,fontWeight:500,cursor:'pointer',border:'1px solid var(--border)',background:n===1?'var(--black)':'white',color:n===1?'white':'var(--black)'}}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return <Suspense fallback={<div style={{padding:80,textAlign:'center'}}>Loading...</div>}><ProductsContent/></Suspense>
}