'use client'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <>
            {/* HERO */}
            <section style={{
                minHeight: 'calc(70vh - 64px)',
                background: 'var(--black)',
                display: 'flex',
                alignItems: 'center',
                padding: '80px 48px',
                position: 'relative',
                overflow: 'hidden',
                marginTop: 'var(--nav-h)',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(255,77,28,0.12) 0%, transparent 60%)' }} />
                <div style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24 }}>
                        Our Story
                    </p>
                    <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(64px,8vw,120px)', lineHeight: 0.92, letterSpacing: 2, color: 'white', marginBottom: 32 }}>
                        BUILT FOR<br />
                        <span style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>RUNNERS</span><br />
                        BY RUNNERS
                    </h1>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', maxWidth: 520, fontWeight: 300 }}>
                        STRIDE was born out of frustration — too many runners buying the wrong shoes. We built a smarter way to shop, powered by AI and a genuine love for the sport.
                    </p>
                </div>
            </section>

            {/* IMAGE BANNER 1 — Full width */}
            <div style={{
                width: '100%',
                height: 480,
                background: 'var(--grey)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* 🖼️ REPLACE: Add a wide action shot of runners here */}
                <img src="https://res.cloudinary.com/dytwnm405/image/upload/v1772406821/50a715379ec98bd6aad589f4da4cfc74_mymu3z.jpg" alt="..." style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* MISSION */}
            <section style={{ padding: '96px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', maxWidth: 1400, margin: '0 auto' }}>
                <div>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>Our Mission</p>
                    <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(40px,5vw,72px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 28 }}>
                        THE RIGHT SHOE<br />
                        <span style={{ WebkitTextStroke: '2px var(--black)', color: 'transparent' }}>CHANGES</span><br />
                        EVERYTHING
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--mid)', fontWeight: 300, marginBottom: 20 }}>
                        A wrong shoe isn't just uncomfortable — it causes injuries, kills motivation, and wastes money. We built STRIDE to solve that with technology that actually understands running.
                    </p>
                    <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--mid)', fontWeight: 300, marginBottom: 36 }}>
                        Our AI-powered platform considers your arch type, terrain, training goals, and budget — then recommends shoes that actually suit you. No guesswork. No pushy sales staff.
                    </p>
                    <Link href="/ai-advisor" style={{ background: 'var(--black)', color: 'white', padding: '16px 36px', borderRadius: 4, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.5px' }}>
                        Try the AI Advisor →
                    </Link>
                </div>

                {/* 🖼️ REPLACE: Add a close-up product or lifestyle image */}
                <div style={{
                    aspectRatio: '4/5',
                    background: 'var(--grey)',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    <img src="https://res.cloudinary.com/dytwnm405/image/upload/v1772406122/6eabb1e6a0d7cd80030c7822c67ad52d_s0tnrw.jpg" alt="..." style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                </div>
            </section>

            {/* STATS BAR */}
            <div style={{ background: 'var(--black)', padding: '64px 48px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                    {[
                        ['200+', 'Shoe Models'],
                        ['15K+', 'Runners Matched'],
                        ['8', 'Top Brands'],
                        ['98%', 'Satisfaction Rate'],
                    ].map(([num, label]) => (
                        <div key={label}>
                            <div style={{ fontFamily: 'Bebas Neue', fontSize: 56, letterSpacing: 2, color: 'var(--accent)', lineHeight: 1 }}>{num}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 8, fontFamily: 'DM Mono' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* WHAT MAKES US DIFFERENT */}
            <section style={{ padding: '96px 48px', maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>Why STRIDE</p>
                    <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(40px,5vw,64px)', letterSpacing: 2 }}>WHAT MAKES US DIFFERENT</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                    {[
                        {
                            icon: <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2835 8.75 11.25C8.75 12.2165 9.5335 13 10.5 13Z" /></svg>,
                            title: 'AI-Powered Matching',
                            desc: 'Our Gemini-powered search understands natural language. Tell us what you need in plain English and we\'ll find the perfect match from our curated catalogue.',
                        },
                        {
                            icon: <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M1.5 3.5H3.5L5 1H11L12.5 3.5H14.5H16V5V12.5C16 13.8807 14.8807 15 13.5 15H2.5C1.11929 15 0 13.8807 0 12.5V5V3.5H1.5ZM4.78624 4.27174L5.84929 2.5H10.1507L11.2138 4.27174L11.6507 5H12.5H14.5V12.5C14.5 13.0523 14.0523 13.5 13.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V5H3.5H4.34929L4.78624 4.27174ZM9.75 8.5C9.75 9.4665 8.9665 10.25 8 10.25C7.0335 10.25 6.25 9.4665 6.25 8.5C6.25 7.5335 7.0335 6.75 8 6.75C8.9665 6.75 9.75 7.5335 9.75 8.5ZM11.25 8.5C11.25 10.2949 9.79493 11.75 8 11.75C6.20507 11.75 4.75 10.2949 4.75 8.5C4.75 6.70507 6.20507 5.25 8 5.25C9.79493 5.25 11.25 6.70507 11.25 8.5Z" /></svg>,
                            title: 'Visual Search',
                            desc: 'See a shoe you love? Upload a photo. Our AI analyses the style, construction, and type — then finds the closest match in our store instantly.',
                        },
                        {
                            icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM707-253q93-93 93-227t-93-227q-93-93-227-93t-227 93q-93 93-93 227t93 227q93 93 227 93t227-93Zm-397-57q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Zm283-57q47-47 47-113t-47-113q-47-47-113-47t-113 47q-47 47-47 113t47 113q47 47 113 47t113-47Zm-169.5-56.5Q400-447 400-480t23.5-56.5Q447-560 480-560t56.5 23.5Q560-513 560-480t-23.5 56.5Q513-400 480-400t-56.5-23.5Z" /></svg>,
                            title: 'Running Profile',
                            desc: 'Complete our 6-question advisor once and every future visit is personalised. Your arch type, terrain preference, and training goals shape what we show you.',
                        },
                        {
                            icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>,
                            title: 'Expert Curation',
                            desc: 'We only stock shoes we believe in — from the world\'s leading running brands. Every product in our catalogue is selected for performance, not margin.',
                        },
                        {
                            icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-280h280v-80H240v80Zm400 0h80v-400h-80v400ZM240-440h280v-80H240v80Zm0-160h280v-80H240v80Zm-80 480q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Zm0-80h640v-560H160v560Zm0 0v-560 560Z" /></svg>,
                            title: 'Detailed Specs',
                            desc: 'Every product card shows the specs that actually matter — arch support, heel drop, terrain type, and weight — so you can compare at a glance.',
                        },
                        {
                            icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" /></svg>,
                            title: 'AI Product Summaries',
                            desc: 'Not sure if a shoe is right for you? Click "AI Summary" on any product page and get an instant expert breakdown of who it\'s best for and who should look elsewhere.',
                        },
                    ].map(card => (
                        <div key={card.title} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 32, transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                        >
                            <div style={{ width: 52, height: 52, background: 'var(--grey)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{card.icon}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{card.title}</h3>
                            <p style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.7, fontWeight: 300 }}>{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* IMAGE GRID — 3 images */}
            <section style={{ padding: '0 48px 96px', maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

                    {/* 🖼️ REPLACE: Add store/brand image */}
                    <div style={{ aspectRatio: '3/4', background: 'var(--grey)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="https://res.cloudinary.com/dytwnm405/image/upload/v1772406542/6d394fbed9c8862ad406bb88a1b63368_orqcde.jpg" alt="..." style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                    {/* 🖼️ REPLACE: Add runner lifestyle image */}
                    <div style={{ aspectRatio: '3/4', background: 'var(--grey)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 48 }}>
                        <img src="https://res.cloudinary.com/dytwnm405/image/upload/v1772406541/1c53e037aea3cb1502ff2c7f6f8b730b_jxz4u3.jpg" alt="..." style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                    {/* 🖼️ REPLACE: Add team or brand image */}
                    <div style={{ aspectRatio: '3/4', background: 'var(--grey)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="https://res.cloudinary.com/dytwnm405/image/upload/v1772406542/9b92e1be031638fccc45ce09f661b2f2_lwffpf.jpg" alt="..." style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    </div>

                </div>
            </section>

            {/* BRANDS */}
            <section style={{ padding: '64px 48px', background: 'var(--grey)' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--mid)', marginBottom: 8 }}>Our Partners</p>
                    <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 2 }}>BRANDS WE TRUST</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, maxWidth: 900, margin: '0 auto' }}>
                    {['Nike', 'ASICS', 'Brooks', 'Hoka', 'Adidas', 'New Balance', 'Puma', 'Saucony'].map(brand => (
                        <div key={brand} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '0.5px' }}>
                            {brand}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA BANNER */}
            <div style={{ margin: '80px 48px', background: 'var(--black)', borderRadius: 24, padding: '64px 80px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 48, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(255,77,28,0.1) 0%, transparent 60%)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>✦ Find your match</p>
                    <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 56, color: 'white', lineHeight: 1, letterSpacing: 2, marginBottom: 16 }}>READY TO FIND<br />YOUR PERFECT RUN?</h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 440, lineHeight: 1.6, fontWeight: 300 }}>Let our AI match you to the right shoe in under 2 minutes.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
                    <Link href="/ai-advisor" style={{ background: 'var(--accent)', color: 'white', padding: '18px 40px', borderRadius: 4, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                        Start AI Consultation →
                    </Link>
                    <Link href="/products" style={{ background: 'transparent', color: 'white', padding: '16px 40px', borderRadius: 4, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block', textAlign: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
                        Browse All Shoes
                    </Link>
                </div>
            </div>
        </>
    )
}