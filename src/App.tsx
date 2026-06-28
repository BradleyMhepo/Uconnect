import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES, CAT_GRADIENT, type Pack } from './data/packs'
import { fetchPacks, type DbPack } from './lib/supabase'

function dbPackToPack(p: DbPack): Pack {
  return {
    id:         p.id,
    slug:       p.slug,
    name:       p.name,
    category:   p.category,
    region:     p.region,
    records:    p.lead_count,
    price:      p.price,
    available:  p.available,
    tagline:    p.tagline,
    fields:     ['Business Name', 'City', 'Phone', 'Address', 'Problem Found', 'Pitch Angle'],
    sampleRows: [],
  }
}

// ─── Responsive hook ────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}
// breakpoints
const BP_MOBILE = 640
const BP_TABLET = 1024

// ─── Design tokens ─────────────────────────────────────────────────────────
const BG       = '#1A1A1A'
const SURFACE  = '#242424'
const BORDER   = 'rgba(255,255,255,0.08)'
const TEXT_1   = '#FFFFFF'
const TEXT_2   = 'rgba(255,255,255,0.5)'
const TEXT_3   = 'rgba(255,255,255,0.25)'

// ─── Typewriter ──────────────────────────────────────────────────────────────
function Typewriter({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!active) { setDisplayed(''); return }
    let i = 0
    setDisplayed('')
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 22)
    return () => clearInterval(interval)
  }, [active, text])

  return (
    <span>
      {displayed}
      {active && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          style={{ display: 'inline-block', width: 1, height: '0.85em', background: 'currentColor', marginLeft: 1, verticalAlign: 'text-bottom' }}
        />
      )}
    </span>
  )
}

// ─── Pack Card ──────────────────────────────────────────────────────────────
function PackCard({
  pack,
  index = 0,
  isSpotlit,
  onEnter,
  onLeave,
}: {
  pack: Pack
  index?: number
  isSpotlit: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const [g1, g2] = CAT_GRADIENT[pack.category] ?? ['#555', '#333']
  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
      onHoverStart={onEnter}
      onHoverEnd={onLeave}
      style={{
        position: 'relative',
        cursor: 'pointer',
        zIndex: isSpotlit ? 50 : 1,
      }}
    >
      <Link to={`/pack/${pack.slug}`} style={{ display: 'block', textDecoration: 'none' }}>

        {/* ── Folder tab ear ── */}
        <div style={{ height: 13, marginBottom: -1 }}>
          <div style={{
            width: 60,
            height: '100%',
            borderRadius: '6px 6px 0 0',
            background: `linear-gradient(90deg, ${g1}, ${g2})`,
          }} />
        </div>

        {/* ── Folder body ── */}
        <motion.div
          animate={{
            backgroundColor: isSpotlit ? '#131313' : '#1e1e1e',
            boxShadow: isSpotlit
              ? `0 28px 60px rgba(0,0,0,0.8), 0 0 0 1px ${g1}55`
              : `0 2px 8px rgba(0,0,0,0.35), 0 0 0 1px ${g1}28`,
          }}
          transition={{ duration: 0.2 }}
          style={{
            borderRadius: '0 10px 10px 10px',
            backgroundImage: `linear-gradient(150deg, ${g1}28 0%, ${g2}12 55%, transparent 100%)`,
            border: `1px solid ${g1}38`,
            padding: '18px 18px 16px',
            height: 150,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: g1, letterSpacing: '0.05em', marginBottom: 7 }}>
              {pack.category.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_1, lineHeight: 1.35, letterSpacing: '-0.02em' }}>
              {pack.name}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 11, color: TEXT_3 }}>{pack.records.toLocaleString()} records</span>
              <span style={{ fontSize: 11, color: TEXT_2 }}>{pack.region}</span>
            </div>
            {pack.available
              ? <span style={{ fontSize: 19, fontWeight: 800, color: TEXT_1, fontFamily: 'monospace', letterSpacing: '-0.03em' }}>${pack.price}</span>
              : <span style={{ fontSize: 12, color: TEXT_3, fontStyle: 'italic' }}>Coming soon</span>
            }
          </div>
        </motion.div>

        {/* ── Description — floats below, no layout impact ── */}
        <motion.div
          initial={false}
          animate={{ opacity: isSpotlit ? 1 : 0, y: isSpotlit ? 0 : 10 }}
          transition={{ duration: 0.2, ease }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            marginTop: 10,
            pointerEvents: 'none',
            padding: '12px 14px',
            borderRadius: 10,
            backgroundColor: '#222',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p style={{ fontSize: 12.5, color: TEXT_2, lineHeight: 1.6, margin: 0, letterSpacing: '-0.01em' }}>
            <Typewriter text={pack.tagline} active={isSpotlit} />
          </p>
        </motion.div>

      </Link>
    </motion.div>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const w = useWindowWidth()
  const mobile = w < BP_MOBILE
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: BG,
      borderBottom: `1px solid ${BORDER}`,
      padding: '0 20px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT_1, letterSpacing: '-0.02em' }}>
          Uconnect
        </span>
      </Link>

      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink to="#">FAQ</NavLink>
          <a href="#" style={{
            marginLeft: 8, padding: '7px 14px',
            background: TEXT_1, color: BG, borderRadius: 8,
            fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            Request Pack
          </a>
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        padding: '6px 12px',
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        color: TEXT_2,
        textDecoration: 'none',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { (e.target as HTMLElement).style.color = TEXT_1; (e.target as HTMLElement).style.background = SURFACE }}
      onMouseLeave={e => { (e.target as HTMLElement).style.color = TEXT_2; (e.target as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </Link>
  )
}

// ─── Category Tabs (Framer pill style) ──────────────────────────────────────
function CategoryTabs({ active, onChange }: { active: string; onChange: (c: string) => void }) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      overflowX: 'auto',
      paddingBottom: 2,
      scrollbarWidth: 'none',
    }}>
      {CATEGORIES.map(cat => {
        const isActive = active === cat
        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              background: isActive ? TEXT_1 : 'transparent',
              color: isActive ? BG : TEXT_2,
              border: isActive ? 'none' : `1px solid ${BORDER}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '-0.01em',
              transition: 'background 0.15s, color 0.15s, border 0.15s',
            }}
            whileHover={!isActive ? { color: TEXT_1, borderColor: 'rgba(255,255,255,0.2)' } : {}}
            whileTap={{ scale: 0.97 }}
          >
            {cat}
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Live Feed ───────────────────────────────────────────────────────────────
const FIRST = ['James','Sophia','Marcus','Aisha','Tyler','Priya','Luca','Naomi','Ethan','Zoe','Derek','Fatima','Connor','Yuki','Brandon','Leila','Jordan','Amara','Owen','Chloe']
const LAST  = ['Rivera','Kim','Thompson','Okafor','Chen','Patel','Russo','Williams','Nguyen','Müller','Santos','Ahmed','O\'Brien','Tanaka','Kowalski','Dubois','Osei','Lindqvist','Ferreira','Hassan']

type FeedItem = { id: number; name: string; pack: string; price: number; ts: number }

let _feedId = 0
function makeFeedItem(): FeedItem {
  const p    = packs[Math.floor(Math.random() * packs.length)]
  const first = FIRST[Math.floor(Math.random() * FIRST.length)]
  const last  = LAST[Math.floor(Math.random() * LAST.length)]
  return { id: _feedId++, name: `${first} ${last[0]}.`, pack: p.name, price: p.price, ts: Date.now() }
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)  return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function addItem() {
      const item = makeFeedItem()
      // Keep max 2 — remove oldest if needed
      setItems(prev => [...prev.slice(-1), item])
      // Each item lives 10–14s then dissolves out
      const life = 10000 + Math.random() * 4000
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== item.id))
      }, life)
      // Next one arrives in 18–35s
      timeout = setTimeout(addItem, 18000 + Math.random() * 17000)
    }

    // First event after 6–10s
    timeout = setTimeout(addItem, 6000 + Math.random() * 4000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      borderLeft: `1px solid ${BORDER}`,
      padding: '24px 16px',
      position: 'relative',
      overflowY: 'auto',
    }}>

      <div style={{ position: 'absolute', bottom: 80, left: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_1 }}>{item.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', fontFamily: 'monospace' }}>${item.price}</span>
              </div>
              <div style={{ fontSize: 11, color: TEXT_2, lineHeight: 1.4, marginBottom: 5 }}>
                {item.pack}
              </div>
              <div style={{ fontSize: 10, color: TEXT_3 }}>just now</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  )
}

// ─── Themed sections ─────────────────────────────────────────────────────────
const THEMED_SECTIONS = [
  { label: 'Trending',          sub: 'Most purchased this week',           categories: ['Restaurants', 'Auto Shops', 'Salons', 'Contractors'] },
  { label: 'Health & Wellness', sub: 'Fitness, chiro, and aesthetics',     categories: ['Gyms', 'Chiropractors', 'Med Spas'] },
  { label: 'Eating Out',        sub: 'Restaurants and food businesses',    categories: ['Restaurants'] },
  { label: 'Home & Property',   sub: 'Contractors and real estate',        categories: ['Contractors', 'Real Estate'] },
  { label: 'Legal & Finance',   sub: 'Law firms and professional services',categories: ['Law Firms'] },
  { label: 'Look & Feel',       sub: 'Salons, spas, and beauty',           categories: ['Salons', 'Med Spas'] },
  { label: 'Automotive',        sub: 'Auto shops and mechanics',           categories: ['Auto Shops'] },
  { label: 'Healthcare',        sub: 'Dentists and medical practices',     categories: ['Dentists', 'Chiropractors'] },
]

// ─── Pack Grid helper ────────────────────────────────────────────────────────
function PackGrid({ packs: list, spotlitId, setSpotlitId, dim }: {
  packs: Pack[]
  spotlitId: string | null
  setSpotlitId: (id: string | null) => void
  dim?: boolean
}) {
  const w      = useWindowWidth()
  const mobile = w < BP_MOBILE
  const tablet = w < BP_TABLET
  const cols   = mobile ? 2 : tablet ? 3 : 5
  const colW   = mobile ? '1fr' : '220px'
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${colW})`,
      gap: mobile ? 12 : 18,
      justifyContent: 'space-between',
      opacity: dim ? 0.35 : 1,
    }}>
      {list.map((pack, i) => (
        <PackCard
          key={pack.id} pack={pack} index={i}
          isSpotlit={spotlitId === pack.id}
          onEnter={() => setSpotlitId(pack.id)}
          onLeave={() => setSpotlitId(null)}
        />
      ))}
    </div>
  )
}

// ─── Filter Sidebar ──────────────────────────────────────────────────────────
const ALL_REGIONS = ['All', ...Array.from(new Set(packs.map(p => p.region))).sort()]
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'records-desc', label: 'Most Records' },
]

function Divider() {
  return <div style={{ height: 1, background: BORDER, margin: '18px 0' }} />
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          marginBottom: open ? 12 : 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_1, letterSpacing: '-0.01em' }}>{label}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke={TEXT_3} strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PriceInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 8, padding: '7px 10px', fontSize: 13, color: TEXT_1,
        outline: 'none', letterSpacing: '-0.01em',
      }}
    />
  )
}

// ─── Home page ───────────────────────────────────────────────────────────────
function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery]                   = useState('')
  const [region, setRegion]                 = useState('All')
  const [sort, setSort]                     = useState('default')
  const [minPrice, setMinPrice]             = useState('')
  const [maxPrice, setMaxPrice]             = useState('')
  const [spotlitId, setSpotlitId]           = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [packs, setPacks]                   = useState<Pack[]>([])
  const [loading, setLoading]               = useState(true)
  const w       = useWindowWidth()
  const mobile  = w < BP_MOBILE
  const tablet  = w < BP_TABLET

  useEffect(() => {
    fetchPacks()
      .then(data => setPacks(data.map(dbPackToPack)))
      .catch(() => {/* keep empty — static fallback would go here */})
      .finally(() => setLoading(false))
  }, [])

  const filtered = packs
    .filter(p => {
      const matchCat    = activeCategory === 'All' || p.category === activeCategory
      const matchQ      = query === '' || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())
      const matchRegion = region === 'All' || p.region === region
      const matchMin    = minPrice === '' || p.price >= Number(minPrice)
      const matchMax    = maxPrice === '' || p.price <= Number(maxPrice)
      return matchCat && matchQ && matchRegion && matchMin && matchMax
    })
    .sort((a, b) => {
      if (sort === 'price-asc')     return a.price - b.price
      if (sort === 'price-desc')    return b.price - a.price
      if (sort === 'records-desc')  return b.records - a.records
      return 0
    })

  const available = filtered.filter(p => p.available)
  const coming    = filtered.filter(p => !p.available)

  const hasFilters = region !== 'All' || minPrice !== '' || maxPrice !== '' || sort !== 'default'

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Full-page dim overlay ── */}
      <motion.div
        initial={false}
        animate={{ opacity: spotlitId ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', zIndex: 40, pointerEvents: 'none' }}
      />

      {/* ── Hero header ── */}
      <div style={{ display: 'flex' }}>
        {!mobile && !tablet && <div style={{ width: 220, flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0, padding: mobile ? '20px 16px 16px' : '36px 24px 28px', borderBottom: `1px solid ${BORDER}` }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 16 }}>
            {!mobile && <div style={{ fontSize: 12, color: TEXT_3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Marketplace</div>}
            <h1 style={{ fontSize: mobile ? 22 : 30, fontWeight: 700, color: TEXT_1, letterSpacing: '-0.03em', marginBottom: 4 }}>Prospect Packs</h1>
            {!mobile && (
              <p style={{ fontSize: 13.5, color: TEXT_2, lineHeight: 1.5 }}>
                Pre-filtered lead lists for freelancers and agencies. Buy once, download instantly.
              </p>
            )}
          </motion.div>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: '0 14px', height: 42,
              width: '100%', maxWidth: mobile ? '100%' : 520,
              boxSizing: 'border-box',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search packs…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: TEXT_1, letterSpacing: '-0.01em' }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_3, fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>
          </motion.div>

          {/* Category pills + filter button on mobile */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
            </div>
            {(mobile || tablet) && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: 'transparent', color: TEXT_2,
                  border: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
                }}
              >
                Filters
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Mobile filter drawer backdrop ── */}
      {(mobile || tablet) && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60 }}
        />
      )}

      {/* ── Body: sidebar + content ── */}
      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 272px)', overflow: 'hidden' }}>

        {/* ── Left sidebar — drawer on mobile/tablet ── */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          padding: '24px 20px',
          overflowY: 'auto',
          ...(mobile || tablet ? {
            position: 'fixed',
            top: 52,
            left: 0,
            bottom: 0,
            zIndex: 61,
            background: BG,
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)',
            height: '100%',
          } : {}),
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_1, letterSpacing: '-0.01em' }}>Filters</span>
            {hasFilters && (
              <button
                onClick={() => { setRegion('All'); setMinPrice(''); setMaxPrice(''); setSort('default') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: TEXT_3, padding: 0 }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort by */}
          <FilterSection label="Sort by">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  style={{
                    background: sort === opt.value ? `rgba(255,255,255,0.06)` : 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '7px 10px', borderRadius: 7,
                    fontSize: 13, color: sort === opt.value ? TEXT_1 : TEXT_2,
                    fontWeight: sort === opt.value ? 500 : 400,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <Divider />

          {/* Price */}
          <FilterSection label="Price">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <PriceInput value={minPrice} onChange={setMinPrice} placeholder="Min" />
              <span style={{ fontSize: 12, color: TEXT_3 }}>to</span>
              <PriceInput value={maxPrice} onChange={setMaxPrice} placeholder="Max" />
            </div>
          </FilterSection>

          <Divider />

          {/* Region */}
          <FilterSection label="Region">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ALL_REGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  style={{
                    background: region === r ? `rgba(255,255,255,0.06)` : 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '7px 10px', borderRadius: 7,
                    fontSize: 13, color: region === r ? TEXT_1 : TEXT_2,
                    fontWeight: region === r ? 500 : 400,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* ── Main content ── */}
        <div style={{ flex: 1, padding: '24px 24px', minWidth: 0, overflowY: 'auto' }}>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + region + sort + minPrice + maxPrice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 220px)', gap: 20, paddingTop: 8 }}>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.07 }}
                      style={{ height: 150, borderRadius: 10, background: SURFACE, border: `1px solid ${BORDER}` }}
                    />
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: TEXT_3, fontSize: 14 }}>
                  No packs match your filters.
                </div>
              )}

              {/* When a specific category is selected — flat grid */}
              {!loading && activeCategory !== 'All' && available.length > 0 && (
                <PackGrid packs={available} spotlitId={spotlitId} setSpotlitId={setSpotlitId} />
              )}

              {/* When All — themed sections */}
              {!loading && activeCategory === 'All' && THEMED_SECTIONS.map(section => {
                const group = available.filter(p => section.categories.includes(p.category))
                const capped = section.label === 'Trending' ? group.slice(0, 10) : group
                if (capped.length === 0) return null
                return (
                  <div key={section.label} style={{ marginBottom: 44 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 19, fontWeight: 700, color: TEXT_1, letterSpacing: '-0.02em' }}>
                        {section.label}
                      </div>
                      {section.sub && (
                        <div style={{ fontSize: 12, color: TEXT_3, marginTop: 3 }}>{section.sub}</div>
                      )}
                    </div>
                    <PackGrid packs={capped} spotlitId={spotlitId} setSpotlitId={setSpotlitId} />
                  </div>
                )
              })}

              {coming.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_3, letterSpacing: '-0.02em', marginBottom: 16 }}>
                    Coming soon
                  </div>
                  <PackGrid packs={coming} spotlitId={spotlitId} setSpotlitId={setSpotlitId} dim />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right panel: live activity feed — desktop only ── */}
        {!mobile && !tablet && <LiveFeed />}

      </div>
    </div>
  )
}

// ─── Pack Detail page ────────────────────────────────────────────────────────
function PackDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const pack = packs.find(p => p.slug === slug)

  if (!pack) return (
    <div style={{ padding: 40, color: TEXT_2, textAlign: 'center' }}>
      Pack not found. <button onClick={() => navigate('/')} style={{ color: TEXT_1, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Go back</button>
    </div>
  )

  const [g1, g2] = CAT_GRADIENT[pack.category] ?? ['#444', '#222']
  const related  = packs.filter(p => p.id !== pack.id && p.category === pack.category && p.available).slice(0, 3)
  const w        = useWindowWidth()
  const mobile   = w < BP_MOBILE

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: mobile ? '20px 16px' : '28px 24px' }}
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: TEXT_2, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 320px', gap: mobile ? 24 : 40 }}>

        {/* Left */}
        <div>
          {/* Hero cover — gradient banner */}
          <div style={{
            height: 180,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`,
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', padding: '0 24px', letterSpacing: '-0.02em', textShadow: '0 2px 16px rgba(0,0,0,0.3)', lineHeight: 1.3 }}>
              {pack.name}
            </div>
            <div style={{ position: 'absolute', bottom: 12, right: 14, fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
              {pack.records.toLocaleString()} RECORDS
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT_1, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {pack.name}
          </h1>
          <p style={{ fontSize: 14, color: TEXT_2, lineHeight: 1.6, marginBottom: 24 }}>
            {pack.tagline}
          </p>

          {/* Fields */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Fields in every record
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pack.fields.map(f => (
                <span key={f} style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  fontSize: 12,
                  color: TEXT_2,
                  fontFamily: 'monospace',
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Sample table */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Sample data — 5 of {pack.records.toLocaleString()} records
            </div>
            {pack.sampleRows.length > 0 ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: SURFACE }}>
                        {Object.keys(pack.sampleRows[0]).map(k => (
                          <th key={k} style={{ padding: '10px 12px', textAlign: 'left', color: TEXT_3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10, whiteSpace: 'nowrap', borderBottom: `1px solid ${BORDER}` }}>
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pack.sampleRows.map((row, i) => (
                        <tr
                          key={i}
                          style={{
                            filter: i >= 2 ? 'blur(4px)' : 'none',
                            userSelect: i >= 2 ? 'none' : 'auto',
                            borderBottom: `1px solid ${BORDER}`,
                          }}
                        >
                          {Object.values(row).map((v, j) => (
                            <td key={j} style={{ padding: '9px 12px', color: TEXT_2, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {v || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                  background: `linear-gradient(to top, ${BG}, transparent)`,
                  pointerEvents: 'none',
                }} />
              </div>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: TEXT_3, fontSize: 13, border: `1px dashed ${BORDER}`, borderRadius: 10 }}>
                Sample available when this pack launches.
              </div>
            )}
          </div>
        </div>

        {/* Right: buy card */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              position: 'sticky',
              top: 72,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            {/* Gradient accent top */}
            <div style={{ height: 3, borderRadius: '12px 12px 0 0', background: `linear-gradient(90deg, ${g1}, ${g2})`, margin: '-20px -20px 20px' }} />

            <div style={{ fontSize: 32, fontWeight: 800, color: TEXT_1, fontFamily: 'monospace', letterSpacing: '-0.03em', marginBottom: 4 }}>
              {pack.available ? `$${pack.price}` : '—'}
            </div>
            <div style={{ fontSize: 12, color: TEXT_2, marginBottom: 20 }}>
              One-time · No subscription · Instant download
            </div>

            {pack.available ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${g1}, ${g2})`,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: 10,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Buy Now — ${pack.price}
                </motion.button>
                <button style={{
                  width: '100%',
                  padding: '11px 0',
                  borderRadius: 10,
                  background: 'transparent',
                  color: TEXT_2,
                  fontWeight: 500,
                  fontSize: 13,
                  border: `1px solid ${BORDER}`,
                  cursor: 'pointer',
                }}>
                  Download Free Sample
                </button>
              </>
            ) : (
              <button style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: 10,
                background: SURFACE,
                color: TEXT_2,
                fontWeight: 500,
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                cursor: 'pointer',
              }}>
                Notify Me When Available
              </button>
            )}

            {/* Meta */}
            <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Records', `${pack.records.toLocaleString()}`],
                ['Industry', pack.category],
                ['Region', pack.region],
                ...(pack.available ? [['Verified within', '90 days']] : []),
                ['Format', 'CSV / XLSX'],
                ['License', 'Single user'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: TEXT_3 }}>{label}</span>
                  <span style={{ color: TEXT_2, fontFamily: label === 'Records' || label === 'Format' ? 'monospace' : 'inherit' }}>{value}</span>
                </div>
              ))}
            </div>

            {pack.available && (
              <p style={{ marginTop: 14, fontSize: 11, color: TEXT_3, lineHeight: 1.5 }}>
                If more than 10% of records are invalid, we replace the pack for free.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            More in {pack.category}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {related.map((p, i) => <PackCard key={p.id} pack={p} index={i} />)}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Background wave ─────────────────────────────────────────────────────────
function BackgroundWave() {
  const blobs = [
    { color: '#4361EE', top: '10%',  left: '20%',  size: 600, anim: 'wave-a', dur: '18s' },
    { color: '#F72585', top: '55%',  left: '65%',  size: 500, anim: 'wave-b', dur: '22s' },
    { color: '#06D6A0', top: '75%',  left: '10%',  size: 420, anim: 'wave-c', dur: '26s' },
    { color: '#FFB703', top: '25%',  left: '80%',  size: 380, anim: 'wave-b', dur: '20s' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color}22 0%, transparent 70%)`,
            animation: `${b.anim} ${b.dur} ease-in-out infinite`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: BG, color: TEXT_1, position: 'relative' }}>
        <BackgroundWave />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pack/:slug" element={<PackDetail />} />
        </Routes>
        <footer style={{
          borderTop: `1px solid ${BORDER}`,
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: TEXT_3,
        }}>
          <span style={{ fontWeight: 700, color: TEXT_2 }}>Uconnect</span>
          <span>© 2026 · Prospect data · No subscription</span>
        </footer>
        </div>
      </div>
    </BrowserRouter>
  )
}
