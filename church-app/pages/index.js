import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import PublicationCard from '../components/PublicationCard'
import { supabase } from '../lib/supabase'
import { HiSearch, HiChevronRight } from 'react-icons/hi'

const CATS = ['all','sermon','devotional','testimony','study','news','general']
const CAT_LABELS = { all:'All', sermon:'Sermons', devotional:'Devotionals', testimony:'Testimonies', study:'Bible Studies', news:'Church News', general:'General' }

const RESOURCES = [
  { icon:'📖', name:'Bible Gateway',          url:'https://www.biblegateway.com',           desc:'Read the Bible in 200+ versions' },
  { icon:'✍️', name:'EGW Writings',           url:'https://egwwritings.org',                desc:'Ellen G. White Estate' },
  { icon:'🎓', name:'Adventist Learning',     url:'https://circle.adventistlearningcommunity.com/browse/161', desc:'SDA Online Courses' },
  { icon:'📘', name:'Amazing Facts',          url:'https://www.amazingfacts.org/bible-study/bible-study-guides', desc:'Free Bible study guides' },
  { icon:'✝️', name:'Truth: Sabbath',         url:'https://www.adventist.org/sabbath/',     desc:'Biblical Sabbath study' },
  { icon:'🔥', name:'Truth: Hell',            url:'https://www.adventist.org/the-dead/',   desc:'State of the dead study' },
]

const VERSES = [
  { text:'Your word is a lamp to my feet and a light to my path.', ref:'Psalm 119:105' },
  { text:'I saw another angel flying in mid-air, and he had the eternal gospel to proclaim to those who live on the earth.', ref:'Revelation 14:6' },
  { text:'The grass withers and the flowers fall, but the word of our God endures forever.', ref:'Isaiah 40:8' },
]

export default function Home({ user, profile }) {
  const [pubs, setPubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ total:0, sermons:0 })
  const verse = VERSES[new Date().getDate() % VERSES.length]

  const fetchPubs = useCallback(async (c) => {
    setLoading(true)
    try {
      let q = supabase
        .from('publications')
        .select('id,title,summary,category,cover_image_url,pdf_url,youtube_url,allow_download,author_name,featured,like_count,comment_count,created_at,profiles(full_name),publication_images(id,url)')
        .eq('status','approved')
        .order('created_at',{ascending:false})
      if (c && c !== 'all') q = q.eq('category', c)
      const { data, error } = await q
      if (error) { console.error(error); setPubs([]) }
      else setPubs(data || [])
    } catch(e) { console.error(e); setPubs([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPubs('all') }, [fetchPubs])
  useEffect(() => {
    supabase.from('publications').select('category').eq('status','approved').then(({data})=>{
      if (!data) return
      setStats({ total: data.length, sermons: data.filter(p=>p.category==='sermon').length })
    })
  }, [])

  function handleCat(c) { setCat(c); fetchPubs(c) }

  const filtered = search.trim()
    ? pubs.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.summary?.toLowerCase().includes(search.toLowerCase()))
    : pubs

  return (
    <>
      <Head>
        <title>Three Angels Publications</title>
        <meta name="description" content="Church publications — sermons, devotionals, testimonies and Bible studies." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Navbar user={user} profile={profile} />

      {/* HERO */}
      <section className="hero-pattern text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16 relative">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between lg:items-center gap-8">
            <div className="flex-1 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-ui font-medium text-blue-200 mb-4">
                ✞ Three Angels Church Ministry
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                Proclaiming<br/><span className="text-yellow-400">God's Word</span>
              </h1>
              <p className="font-ui text-base text-blue-200 leading-relaxed mb-6">
                Sermons, devotionals, testimonies and Bible studies — reviewed and freely shared.
              </p>
              <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
                <a href="#publications" className="px-5 py-2.5 bg-white text-brand-800 font-ui font-bold rounded-xl hover:bg-blue-50 transition-all shadow-md text-sm">Browse Publications</a>
                <Link href="/submit" className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-ui font-bold rounded-xl transition-all shadow-md text-sm">Submit Article</Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <div className="relative w-44 h-36 sm:w-56 sm:h-44 drop-shadow-2xl">
                <Image src="/logo.png" alt="Three Angels" fill className="object-contain" priority/>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-xs text-center">
                <p className="font-body text-sm italic text-white/90 leading-relaxed mb-1">"{verse.text}"</p>
                <p className="font-ui text-xs font-bold text-yellow-400 tracking-wide uppercase">{verse.ref}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 justify-center sm:justify-start">
          <div className="text-center sm:text-left">
            <div className="font-display text-xl font-bold text-yellow-400">{stats.total}</div>
            <div className="font-ui text-xs text-blue-300 uppercase tracking-wide">Publications</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="font-display text-xl font-bold text-yellow-400">{stats.sermons}</div>
            <div className="font-ui text-xs text-blue-300 uppercase tracking-wide">Sermons</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div id="publications" className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Left: publications */}
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search publications…"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl font-ui text-sm bg-white focus:border-brand-400 outline-none"
              />
            </div>

            {/* Category tabs — horizontal scroll, no wrap */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none -mx-1 px-1">
              {CATS.map(c => (
                <button key={c} onClick={()=>handleCat(c)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-ui text-xs font-semibold transition-all ${
                    cat===c ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
                  }`}>
                  {CAT_LABELS[c]}
                </button>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-slate-100"/>
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/3"/>
                      <div className="h-5 bg-slate-100 rounded w-4/5"/>
                      <div className="h-3 bg-slate-100 rounded w-full"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-5xl mb-3">📜</div>
                <h3 className="font-display text-lg font-bold text-slate-700 mb-1">No publications found</h3>
                <p className="font-ui text-slate-400 text-sm">{search ? 'Try a different search.' : 'Be the first to submit!'}</p>
                <Link href="/submit" className="inline-block mt-5 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-ui font-semibold text-sm">Submit Article</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(pub => <PublicationCard key={pub.id} pub={pub}/>)}
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <aside className="space-y-4 lg:block">
            {/* Resources */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="hero-pattern px-4 py-3">
                <h3 className="font-display text-white font-bold text-sm">📚 Study Resources</h3>
              </div>
              {RESOURCES.map(r=>(
                <a key={r.name} href={r.url} target="_blank" rel="noopener"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors border-b border-slate-50 last:border-0 group">
                  <span className="text-lg flex-shrink-0">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-ui font-semibold text-sm text-slate-800 truncate">{r.name}</div>
                    <div className="font-ui text-xs text-slate-400 truncate">{r.desc}</div>
                  </div>
                  <HiChevronRight className="text-slate-300 group-hover:text-brand-500 flex-shrink-0" size={14}/>
                </a>
              ))}
              <div className="p-3 border-t border-slate-100">
                <Link href="/resources" className="block text-center font-ui text-xs font-bold text-brand-600 hover:underline">View All →</Link>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white text-center">
              <div className="text-3xl mb-2">✍️</div>
              <h3 className="font-display text-base font-bold mb-1">Share Your Message</h3>
              <p className="font-ui text-xs text-blue-200 mb-3">Submit your sermon, testimony, or devotional.</p>
              <Link href="/submit" className="block py-2 bg-white text-brand-700 rounded-xl font-ui font-bold text-sm hover:bg-blue-50 transition-colors">Submit Now</Link>
            </div>

            {/* Font controls */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-ui font-bold text-xs text-slate-500 mb-3 uppercase tracking-wide">Reading Settings</h3>
              <select onChange={e=>document.documentElement.style.setProperty('--font-body',e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-ui text-xs outline-none mb-2">
                <option value="'Crimson Pro',serif">Crimson Pro (Classic)</option>
                <option value="'Georgia',serif">Georgia</option>
                <option value="'DM Sans',sans-serif">DM Sans (Modern)</option>
              </select>
              <div className="flex gap-1.5">
                {[['A−','15px'],['A','17px'],['A+','19px'],['A++','22px']].map(([label,size])=>(
                  <button key={label} onClick={()=>document.documentElement.style.fontSize=size}
                    className="flex-1 py-1.5 border border-slate-200 rounded-lg font-ui text-xs font-medium hover:border-brand-400 hover:text-brand-600 transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="hero-pattern text-white mt-10">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="" className="h-8 w-auto"/>
              <div>
                <div className="font-display font-bold text-sm">Three Angels</div>
                <div className="font-ui text-xs text-blue-300">Publications Ministry</div>
              </div>
            </div>
            <p className="font-ui text-xs text-blue-300 leading-relaxed">Spreading the everlasting gospel to every nation, tribe, tongue and people.</p>
          </div>
          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-wide text-yellow-400 mb-3">Links</h4>
            <ul className="space-y-1.5 font-ui text-sm text-blue-200">
              <li><Link href="/" className="hover:text-white">Publications</Link></li>
              <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              <li><Link href="/submit" className="hover:text-white">Submit</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-ui font-bold text-xs uppercase tracking-wide text-yellow-400 mb-3">Scripture</h4>
            <p className="font-body italic text-blue-200 text-sm leading-relaxed">"Fear God and give him glory, because the hour of his judgment has come."</p>
            <p className="font-ui text-xs text-yellow-400 mt-1">— Revelation 14:7</p>
          </div>
        </div>
        <div className="border-t border-white/10 text-center py-3 text-xs font-ui text-blue-400">
          © {new Date().getFullYear()} Three Angels Publications Ministry
        </div>
      </footer>
    </>
  )
}
