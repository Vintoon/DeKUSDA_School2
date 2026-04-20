import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import PublicationCard from '../components/PublicationCard'
import { supabase } from '../lib/supabase'
import { HiSearch, HiChevronRight } from 'react-icons/hi'

const CATEGORIES = ['all','sermon','devotional','testimony','study','news','general']

const CAT_LABELS = {
  all:'All', sermon:'Sermons', devotional:'Devotionals',
  testimony:'Testimonies', study:'Bible Studies', news:'Church News', general:'General'
}

const RESOURCES = [
  { icon:'📖', name:'Bible Gateway',     url:'https://www.biblegateway.com',           desc:'Multiple Bible versions' },
  { icon:'✍️', name:'EGW Writings',      url:'https://egwwritings.org',                desc:'Ellen G. White Estate' },
  { icon:'🏛️', name:'White Estate',      url:'https://whiteestate.org',               desc:'Official EGW resources' },
  { icon:'📗', name:'YouVersion',        url:'https://www.youversion.com',             desc:'Bible with reading plans' },
  { icon:'🎓', name:'Adventist Learning', url:'https://circle.adventistlearningcommunity.com/browse/161', desc:'SDA Online Courses' },
  { icon:'📘', name:'Amazing Facts',     url:'https://www.amazingfacts.org/bible-study/bible-study-guides', desc:'Bible study guides' },
]

const SCRIPTURES = [
  { text:'Your word is a lamp to my feet and a light to my path.', ref:'Psalm 119:105' },
  { text:'Then I saw another angel flying in mid-air, and he had the eternal gospel to proclaim to those who live on the earth.', ref:'Revelation 14:6' },
  { text:'Go therefore and make disciples of all nations.', ref:'Matthew 28:19' },
  { text:'The grass withers and the flowers fall, but the word of our God endures forever.', ref:'Isaiah 40:8' },
]

export default function Home({ user, profile }) {
  const [publications, setPublications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [category, setCategory]         = useState('all')
  const [search, setSearch]             = useState('')
  const [stats, setStats]               = useState({ total:0, sermons:0, contributors:0 })
  const verse = SCRIPTURES[new Date().getDate() % SCRIPTURES.length]

  const loadPublications = useCallback(async (cat) => {
    setLoading(true)
    try {
      // Always query for approved publications — no auth filter needed
      let q = supabase
        .from('publications')
        .select('id, title, summary, category, cover_image_url, pdf_url, youtube_url, allow_download, author_name, featured, like_count, comment_count, created_at, profiles(full_name), publication_images(id, url)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (cat && cat !== 'all') {
        q = q.eq('category', cat)
      }

      const { data, error } = await q

      if (error) {
        console.error('Publications fetch error:', error)
        setPublications([])
      } else {
        setPublications(data || [])
      }
    } catch (e) {
      console.error('Unexpected error:', e)
      setPublications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPublications('all')
  }, [loadPublications])

  async function loadStats() {
    try {
      const { data } = await supabase
        .from('publications')
        .select('category, author_id')
        .eq('status', 'approved')
      if (!data) return
      setStats({
        total: data.length,
        sermons: data.filter(p => p.category === 'sermon').length,
        contributors: new Set(data.map(p => p.author_id).filter(Boolean)).size,
      })
    } catch(e) {}
  }

  useEffect(() => { loadStats() }, [])

  function handleCategory(cat) {
    setCategory(cat)
    loadPublications(cat)
  }

  const filtered = search.trim()
    ? publications.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.summary?.toLowerCase().includes(search.toLowerCase())
      )
    : publications

  return (
    <>
      <Head>
        <title>Three Angels Publications</title>
        <meta name="description" content="Church publications, sermons, devotionals and more." />
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar user={user} profile={profile} />

      {/* HERO */}
      <section className="hero-pattern text-white overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-ui font-medium text-blue-200 mb-5">
                ✞ Three Angels Church Ministry
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight mb-5">
                Proclaiming<br /><span className="text-gold-400">God's Word</span><br />to the World
              </h1>
              <p className="font-body text-lg text-blue-200 leading-relaxed mb-7 max-w-lg">
                Sermons, devotionals, testimonies and Bible studies — reviewed, trusted, and freely shared.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a href="#publications" className="px-5 py-2.5 bg-white text-brand-800 font-ui font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm">
                  Browse Publications
                </a>
                <Link href="/submit" className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-ui font-bold rounded-xl transition-all shadow-lg text-sm">
                  Submit Article
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-60 h-48 drop-shadow-2xl">
                <Image src="/logo.png" alt="Three Angels" fill className="object-contain" />
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-5 max-w-sm text-center">
                <p className="font-body text-base italic text-white/90 leading-relaxed mb-2">"{verse.text}"</p>
                <p className="font-ui text-xs font-bold text-gold-400 tracking-widest uppercase">{verse.ref}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6 justify-center sm:justify-start">
          {[{label:'Publications',val:stats.total},{label:'Sermons',val:stats.sermons},{label:'Contributors',val:stats.contributors}].map(s=>(
            <div key={s.label} className="text-center sm:text-left">
              <div className="font-display text-2xl font-bold text-gold-400">{s.val}</div>
              <div className="font-ui text-xs text-blue-300 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div id="publications" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_290px] gap-10">
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search publications…"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl font-ui text-sm bg-white focus:border-brand-400 outline-none"
              />
            </div>

            {/* Category tabs — scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full font-ui text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {CAT_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Publication grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {[...Array(4)].map((_,i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-slate-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-5 bg-slate-100 rounded w-4/5" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📜</div>
                <h3 className="font-display text-xl font-bold text-slate-700 mb-2">No publications found</h3>
                <p className="font-ui text-slate-400 text-sm">{search ? 'Try a different search term.' : 'Be the first to submit one!'}</p>
                <Link href="/submit" className="inline-block mt-5 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-ui font-semibold text-sm">
                  Submit Article
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {filtered.map(pub => <PublicationCard key={pub.id} pub={pub} />)}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="hero-pattern px-5 py-4">
                <h3 className="font-display text-white font-bold text-base">📚 Study Resources</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {RESOURCES.map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors group">
                    <span className="text-xl">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-ui font-semibold text-sm text-slate-800 truncate">{r.name}</div>
                      <div className="font-ui text-xs text-slate-400 truncate">{r.desc}</div>
                    </div>
                    <HiChevronRight className="text-slate-300 group-hover:text-brand-500 flex-shrink-0" size={15} />
                  </a>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100">
                <Link href="/resources" className="block text-center font-ui text-xs font-bold text-brand-600 hover:underline py-1">
                  View All Resources →
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white text-center">
              <div className="text-3xl mb-2">✍️</div>
              <h3 className="font-display text-base font-bold mb-1.5">Share Your Message</h3>
              <p className="font-ui text-xs text-blue-200 mb-4">Submit your sermon, testimony, or devotional.</p>
              <Link href="/submit" className="block px-4 py-2 bg-white text-brand-700 rounded-xl font-ui font-bold text-sm hover:bg-blue-50 transition-colors">
                Submit Now
              </Link>
            </div>

            {/* Reading settings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-ui font-bold text-xs text-slate-500 mb-3 uppercase tracking-wide">Reading Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-ui text-xs text-slate-400 mb-1">Font</label>
                  <select onChange={e=>document.documentElement.style.setProperty('--font-body',e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-ui text-xs outline-none">
                    <option value="'Crimson Pro',serif">Crimson Pro</option>
                    <option value="'Georgia',serif">Georgia</option>
                    <option value="'DM Sans',sans-serif">DM Sans</option>
                    <option value="'Cinzel',serif">Cinzel</option>
                  </select>
                </div>
                <div className="flex gap-1.5">
                  {['A−','A','A+','A++'].map((s,i)=>(
                    <button key={s} onClick={()=>{ const sz=['15px','17px','19px','22px']; document.documentElement.style.fontSize=sz[i] }}
                      className="flex-1 py-1.5 border border-slate-200 rounded-lg font-ui text-xs font-medium hover:border-brand-400 hover:text-brand-600 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="hero-pattern text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
              <div>
                <div className="font-display font-bold text-sm">Three Angels</div>
                <div className="font-ui text-xs text-blue-300">Publications Ministry</div>
              </div>
            </div>
            <p className="font-ui text-sm text-blue-300">Spreading the everlasting gospel to every nation, tribe, tongue and people.</p>
          </div>
          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-wide text-gold-400 mb-3">Quick Links</h4>
            <ul className="space-y-1.5 font-ui text-sm text-blue-200">
              <li><Link href="/" className="hover:text-white">Publications</Link></li>
              <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              <li><Link href="/submit" className="hover:text-white">Submit Article</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-wide text-gold-400 mb-3">Scripture</h4>
            <p className="font-body italic text-blue-200 text-sm leading-relaxed">"Fear God and give him glory, because the hour of his judgment has come."</p>
            <p className="font-ui text-xs text-gold-400 mt-2">— Revelation 14:7</p>
          </div>
        </div>
        <div className="border-t border-white/10 text-center py-3 text-xs font-ui text-blue-400">
          © {new Date().getFullYear()} Three Angels Publications Ministry. All rights reserved.
        </div>
      </footer>
    </>
  )
}
