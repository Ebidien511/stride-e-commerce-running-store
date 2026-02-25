'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { getProductById } from '@/lib/products'
import { fmt } from '@/lib/validation'
import { PRODUCTS } from '@/lib/products'
import ProductCard from '@/components/ProductCard'

const SIZES = ['5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11']
const SOLD_OUT = ['5','11']
const TABS = ['Description','Full Specs','🤖 AI Summary']

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = getProductById(id)
  const { addItem, openCart } = useCart()
  const router = useRouter()

  const [selectedSize, setSelectedSize] = useState('7')
  const [activeThumb, setActiveThumb] = useState(0)
  const [wished, setWished] = useState(false)
  const [activeTab, setActiveTab] = useState('Description')
  const [sizeError, setSizeError] = useState(false)

  if (!product) return (
    <div style={{padding:'80px 48px',textAlign:'center'}}>
      <h1>Product not found</h1>
      <button onClick={()=>router.push('/products')} style={{marginTop:16,padding:'12px 24px',background:'var(--black)',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}>← Back to Shop</button>
    </div>
  )

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return }
    addItem({ ...product, size: `UK ${selectedSize}`, meta: product.arch })
    openCart()
  }

  const related = PRODUCTS.filter(p=>p.id!==product.id).slice(0,4)

  return (
    <div style={{marginTop:'var(--nav-h)',padding:'40px 48px 80px',maxWidth:1400,margin:'var(--nav-h) auto 0'}}>
      {/* Breadcrumb */}
      <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:'DM Mono',fontSize:12,color:'var(--mid)',marginBottom:36}}>
        <a href="/" style={{color:'var(--mid)'}}>Home</a><span>/</span>
        <a href="/products" style={{color:'var(--mid)'}}>All Shoes</a><span>/</span>
        <span style={{color:'var(--black)',fontWeight:500}}>{product.brand} {product.name}</span>
      </div>

      {/* Layout */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'start'}}>
        {/* Gallery */}
        <div style={{position:'sticky',top:88,display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'var(--grey)',borderRadius:20,aspectRatio:'1/1',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',fontSize:180}}>
            {product.emoji}
            {product.tag && <span style={{position:'absolute',top:18,left:18,background:product.tag==='New'?'var(--accent2)':'var(--accent)',color:'white',fontSize:11,fontWeight:700,padding:'5px 14px',borderRadius:100,textTransform:'uppercase'}}>{product.tag}</span>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {[0,1,2,3].map(i=>(
              <div key={i} onClick={()=>setActiveThumb(i)} style={{aspectRatio:'1/1',background:'var(--grey)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:`2px solid ${activeThumb===i?'var(--black)':'transparent'}`,fontSize:40}}>
                {product.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{display:'flex',flexDirection:'column',gap:24,paddingTop:4}}>
          <div>
            <div style={{fontFamily:'DM Mono',fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:2,color:'var(--accent)',marginBottom:8}}>{product.brand}</div>
            <h1 style={{fontFamily:'Bebas Neue',fontSize:56,lineHeight:0.95,letterSpacing:1}}>{product.name}</h1>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <span style={{fontFamily:'Bebas Neue',fontSize:48,letterSpacing:1,lineHeight:1}}>{fmt(product.price)}</span>
            {product.originalPrice && <>
              <span style={{fontSize:18,color:'var(--mid)',textDecoration:'line-through'}}>{fmt(product.originalPrice)}</span>
              <span style={{background:'#dcfce7',color:'#16a34a',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:100}}>Save {fmt(product.originalPrice-product.price)}</span>
            </>}
          </div>

          <div style={{height:1,background:'var(--border)'}}/>

          {/* Specs */}
          <div>
            <p style={{fontFamily:'DM Mono',fontSize:10,fontWeight:500,textTransform:'uppercase',letterSpacing:2,color:'var(--mid)',marginBottom:12}}>Key Specs</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[['Arch Type',product.arch],['Terrain',product.terrain],['Heel Drop',product.drop],['Weight',product.weight],['Cushioning','Moderate'],['Level','All levels']].map(([k,v])=>(
                <div key={k} style={{background:'var(--grey)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'1.2px',color:'var(--mid)',fontWeight:600,marginBottom:4}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{height:1,background:'var(--border)'}}/>

          {/* Size picker */}
          <div>
            <p style={{fontFamily:'DM Mono',fontSize:10,fontWeight:500,textTransform:'uppercase',letterSpacing:2,color:'var(--mid)',marginBottom:12}}>Select Size (UK)</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {SIZES.map(size=>(
                <button key={size} disabled={SOLD_OUT.includes(size)}
                  onClick={()=>{setSelectedSize(size);setSizeError(false)}}
                  style={{minWidth:52,height:44,padding:'0 8px',border:`1.5px solid ${selectedSize===size?'var(--black)':'var(--border)'}`,borderRadius:8,background:selectedSize===size?'var(--black)':'white',color:selectedSize===size?'white':'var(--black)',fontSize:13,fontWeight:500,cursor:SOLD_OUT.includes(size)?'not-allowed':'pointer',opacity:SOLD_OUT.includes(size)?0.35:1,textDecoration:SOLD_OUT.includes(size)?'line-through':'none',transition:'all 0.15s'}}>
                  {size}
                </button>
              ))}
            </div>
            {sizeError && <p style={{fontSize:11,color:'var(--red)',marginTop:8,fontWeight:500}}>Please select a size before adding to cart</p>}
            <p style={{fontSize:11,color:'var(--mid)',marginTop:8,fontStyle:'italic'}}>Strikethrough sizes are currently unavailable</p>
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:12}}>
            <button onClick={handleAdd} style={{flex:1,background:'var(--black)',color:'white',border:'none',borderRadius:10,padding:'17px 24px',fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.2s',letterSpacing:'0.5px'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--accent)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--black)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Add to Cart
            </button>
            <button onClick={()=>setWished(v=>!v)} style={{width:56,height:56,border:`2px solid ${wished?'var(--accent)':'var(--border)'}`,borderRadius:10,background:wished?'#fff0ed':'white',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:wished?'var(--accent)':'inherit',transition:'all 0.2s'}}>
              {wished?'♥':'♡'}
            </button>
          </div>

          {/* Delivery */}
          <div style={{border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            {[['🚚','Free delivery on orders over R500','Estimated 3–5 business days'],['↩️','Free returns within 30 days','No questions asked'],['✅','100% authentic products','Official authorised retailer']].map(([icon,title,sub])=>(
              <div key={title} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:'1px solid var(--border)',fontSize:13}}>
                <span style={{fontSize:18}}>{icon}</span>
                <div><strong style={{display:'block',fontWeight:600,marginBottom:2}}>{title}</strong><span style={{color:'var(--mid)',fontSize:12}}>{sub}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{marginTop:80}}>
        <div style={{display:'flex',borderBottom:'2px solid var(--border)',gap:4,marginBottom:44}}>
          {TABS.map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:'14px 32px',fontSize:14,fontWeight:600,border:'none',background:'none',cursor:'pointer',color:activeTab===tab?'var(--black)':'var(--mid)',borderBottom:`3px solid ${activeTab===tab?'var(--accent)':'transparent'}`,marginBottom:-2,borderRadius:'4px 4px 0 0',transition:'all 0.2s'}}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab==='Description' && (
          <div style={{display:'grid',gridTemplateColumns:'1.1fr 0.9fr',gap:56,animation:'fadeUp 0.3s ease both'}}>
            <div style={{fontSize:15,lineHeight:1.85,color:'#444',fontWeight:300}}>
              <p style={{marginBottom:18}}>{product.description}</p>
              <p>Whether you're running on city pavement or a light trail path, this shoe handles it comfortably. A solid all-round choice that earns its place in any runner's rotation.</p>
            </div>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:14}}>
              {product.features.map(f=>(
                <li key={f} style={{display:'flex',alignItems:'flex-start',gap:12,fontSize:14,lineHeight:1.6}}>
                  <span style={{width:22,height:22,background:'var(--accent)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:800,flexShrink:0,marginTop:1}}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab==='Full Specs' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',animation:'fadeUp 0.3s ease both'}}>
            {[
              [['Brand',product.brand],['Model',product.name],['Category','Road Running'],['Arch Support',product.arch],['Cushioning','Moderate'],['Heel Drop',product.drop]],
              [['Weight',product.weight],['Midsole','Proprietary Foam'],['Outsole','Durable Rubber'],['Upper','Engineered Mesh'],['Experience Level','All levels'],['Best For','Daily training']],
            ].map((col,ci)=>(
              <div key={ci} style={ci===0?{borderRight:'1px solid var(--border)'}:{}}>
                {col.map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 24px',borderBottom:'1px solid var(--border)'}}>
                    <span style={{fontSize:13,color:'var(--mid)'}}>{k}</span>
                    <span style={{fontSize:13,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab==='🤖 AI Summary' && (
          <div style={{maxWidth:780,animation:'fadeUp 0.3s ease both'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:8,background:'#fff0ed',color:'var(--accent)',fontSize:11,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',padding:'7px 16px',borderRadius:100,border:'1px solid rgba(255,77,28,0.2)'}}>🤖 &nbsp; AI Generated Summary</span>
              <button style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'2px solid var(--border)',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:600,cursor:'pointer'}}>🔄 &nbsp; Regenerate</button>
            </div>
            <p style={{fontSize:15,lineHeight:1.9,color:'#333',fontWeight:300,marginBottom:28,padding:24,background:'var(--grey)',borderRadius:12,borderLeft:'3px solid var(--accent)'}}>
              The {product.brand} {product.name} is an excellent all-round road running shoe that suits {product.arch.toLowerCase()} runners looking for a reliable daily trainer. Its moderate cushioning strikes a sweet spot — enough protection for longer runs without feeling sluggish underfoot. At {fmt(product.price)} it represents strong value for a premium daily trainer.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {[{label:'✓  Great for',color:'#16a34a',items:['Neutral arch runners','Daily training & high mileage','Beginner to advanced','Road and light trail']},
                {label:'✗  Not ideal for',color:'#dc2626',items:['Flat feet or overpronation','Technical trail running','Minimal feel runners','Racing or speed work']}
              ].map(card=>(
                <div key={card.label} style={{background:'white',border:'1px solid var(--border)',borderRadius:14,padding:22}}>
                  <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:14,color:card.color}}>{card.label}</div>
                  {card.items.map(item=>(
                    <div key={item} style={{display:'flex',alignItems:'center',gap:10,fontSize:13,marginBottom:10}}>
                      <span style={{width:7,height:7,borderRadius:'50%',background:card.color,flexShrink:0}}/>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      <div style={{marginTop:88}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32}}>
          <h2 style={{fontFamily:'Bebas Neue',fontSize:44,letterSpacing:2}}>YOU MIGHT ALSO LIKE</h2>
          <a href="/products" style={{fontSize:13,fontWeight:600,borderBottom:'1px solid var(--black)',paddingBottom:2}}>View All →</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {related.map(p=><ProductCard key={p.id} product={p}/>)}
        </div>
      </div>
    </div>
  )
}