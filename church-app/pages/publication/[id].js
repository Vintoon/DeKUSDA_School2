import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase, getYouTubeId } from '../../lib/supabase'
import { HiDownload, HiArrowLeft, HiShare, HiHeart, HiChat, HiPaperAirplane, HiExternalLink } from 'react-icons/hi'
import toast from 'react-hot-toast'

const CAT = { sermon:'bg-blue-100 text-blue-700', devotional:'bg-purple-100 text-purple-700', testimony:'bg-green-100 text-green-700', study:'bg-amber-100 text-amber-700', news:'bg-rose-100 text-rose-700', general:'bg-slate-100 text-slate-700' }

export default function PubPage({ user, profile }) {
  const router = useRouter()
  const { id } = router.query
  const [pub, setPub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [form, setForm] = useState({ name:'', email:'', body:'' })
  const [posting, setPosting] = useState(false)

  useEffect(() => { if (id) load() }, [id, user])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('publications')
      .select('*, profiles(full_name), publication_images(*)')
      .eq('id', id)
      .eq('status','approved')
      .maybeSingle()
    if (error || !data) { router.push('/'); return }
    setPub(data)
    setLikeCount(data.like_count || 0)
    setLoading(false)
    supabase.from('publications').update({ views:(data.views||0)+1 }).eq('id',id).then(()=>{})
    loadComments()
    checkLiked()
    loadRelated(data.category)
  }

  async function loadComments() {
    const { data } = await supabase.from('comments').select('*').eq('publication_id',id).eq('status','approved').order('created_at',{ascending:true})
    setComments(data||[])
  }

  async function loadRelated(category) {
    const { data } = await supabase.from('publications').select('id,title,category,cover_image_url,author_name,profiles(full_name)').eq('status','approved').eq('category',category).neq('id',id).limit(3)
    setRelated(data||[])
  }

  async function checkLiked() {
    if (user) {
      const { data } = await supabase.from('likes').select('id').eq('publication_id',id).eq('user_id',user.id).maybeSingle()
      setLiked(!!data)
    } else {
      try { const l = JSON.parse(localStorage.getItem('liked')||'[]'); setLiked(l.includes(id)) } catch{}
    }
  }

  async function handleLike() {
    if (liked) {
      if (user) await supabase.from('likes').delete().eq('publication_id',id).eq('user_id',user.id)
      else { try { const l=JSON.parse(localStorage.getItem('liked')||'[]'); localStorage.setItem('liked',JSON.stringify(l.filter(x=>x!==id))) } catch{} }
      setLiked(false); setLikeCount(c=>Math.max(0,c-1))
    } else {
      if (user) {
        const { error } = await supabase.from('likes').insert({ publication_id:id, user_id:user.id })
        if (error) { toast.error('Already liked or error'); return }
      } else {
        const key = 'anon_'+Math.random().toString(36).slice(2)+'_'+Date.now()
        const { error } = await supabase.from('likes').insert({ publication_id:id, anon_key:key })
        if (error && error.code!=='23505') { toast.error('Could not like'); return }
        try { const l=JSON.parse(localStorage.getItem('liked')||'[]'); localStorage.setItem('liked',JSON.stringify([...l,id])) } catch{}
      }
      setLiked(true); setLikeCount(c=>c+1)
    }
  }

  async function handleComment(e) {
    e.preventDefault()
    const name = user ? (profile?.full_name||user.email.split('@')[0]) : form.name.trim()
    const body = form.body.trim()
    if (!name) { toast.error('Enter your name'); return }
    if (!body) { toast.error('Write a comment'); return }
    setPosting(true)
    const { error } = await supabase.from('comments').insert({ publication_id:id, author_id:user?.id||null, author_name:name, author_email:user?user.email:form.email||null, body, status:'approved' })
    setPosting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Comment posted! 🙏'); setForm({name:'',email:'',body:''}); loadComments()
  }

  function share() {
    if (navigator.share) navigator.share({ title:pub.title, url:window.location.href })
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }
  }

  if (loading) return (
    <>
      <Navbar user={user} profile={profile}/>
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-24 mb-6"/>
        <div className="h-56 bg-slate-200 rounded-2xl mb-5"/>
        <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-4 bg-slate-100 rounded" style={{width:`${90-i*7}%`}}/>)}</div>
      </div>
    </>
  )
  if (!pub) return null

  const author = pub.profiles?.full_name || pub.author_name || 'Anonymous'
  const initials = author.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
  const date = new Date(pub.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})
  const ytId = getYouTubeId(pub.youtube_url)

  return (
    <>
      <Head>
        <title>{pub.title} — Three Angels Publications</title>
        <meta name="description" content={pub.summary||pub.title}/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        {pub.cover_image_url && <meta property="og:image" content={pub.cover_image_url}/>}
      </Head>
      <Navbar user={user} profile={profile}/>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-1.5 font-ui text-sm text-slate-500 hover:text-brand-600 mb-5 transition-colors">
          <HiArrowLeft size={14}/> Back
        </Link>

        <article className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Cover */}
          {pub.cover_image_url && (
            <div className="relative w-full" style={{height:'220px'}}>
              <Image src={pub.cover_image_url} alt={pub.title} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 768px"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
            </div>
          )}

          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-ui font-bold px-2.5 py-1 rounded-full capitalize ${CAT[pub.category]||CAT.general}`}>
                {pub.category==='study'?'Bible Study':pub.category}
              </span>
              {pub.featured && <span className="text-xs font-ui font-bold px-2.5 py-1 rounded-full bg-yellow-400 text-white">★ Featured</span>}
              {pub.pdf_url && <span className="text-xs font-ui font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">📄 PDF</span>}
              {ytId && <span className="text-xs font-ui font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">▶ Video</span>}
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-4">{pub.title}</h1>

            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">{initials}</div>
              <div>
                <div className="font-ui font-semibold text-sm text-slate-800">{author}</div>
                <div className="font-ui text-xs text-slate-400">{date}{pub.views>0 && ` · ${pub.views} views`}</div>
              </div>
            </div>

            {/* Action buttons — wrappable on mobile */}
            <div className="flex flex-wrap gap-2">
              <button onClick={share} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-ui text-xs font-semibold transition-all">
                <HiShare size={13}/> Share
              </button>
              {pub.pdf_url && (
                <a href={pub.pdf_url} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-ui text-xs font-semibold">
                  <HiExternalLink size={13}/> View PDF
                </a>
              )}
              {pub.allow_download && pub.pdf_url && (
                <a href={pub.pdf_url} download target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-ui text-xs font-semibold shadow-sm">
                  <HiDownload size={13}/> Download PDF
                </a>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            {pub.summary && <p className="font-body text-lg text-slate-600 italic leading-relaxed mb-6 pb-6 border-b border-slate-100">{pub.summary}</p>}

            {/* Inline images */}
            {pub.publication_images?.length > 0 && (
              <div className={`grid gap-3 mb-6 ${pub.publication_images.length===1?'grid-cols-1':'grid-cols-2'}`}>
                {pub.publication_images.map(img=>(
                  <div key={img.id} className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                    <Image src={img.url} alt={img.caption||''} fill className="object-cover" sizes="(max-width:640px) 50vw, 300px"/>
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            {pub.content && (
              <div className="prose-article mb-6">
                {pub.content.split('\n').filter(p=>p.trim()).map((p,i)=>(
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {/* YouTube */}
            {ytId && (
              <div className="mb-6">
                <h3 className="font-display font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs">▶</span> Video
                </h3>
                <div className="relative rounded-xl overflow-hidden bg-black shadow-md" style={{paddingBottom:'56.25%',height:0}}>
                  <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${ytId}?rel=0`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                </div>
              </div>
            )}

            {/* PDF banner */}
            {pub.pdf_url && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="text-3xl flex-shrink-0">📄</div>
                <div className="flex-1 min-w-0">
                  <div className="font-ui font-bold text-sm text-slate-800">{pub.pdf_filename||'Attached Document'}</div>
                  <div className="font-ui text-xs text-slate-500">PDF attached to this publication</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a href={pub.pdf_url} target="_blank" rel="noopener" className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-ui text-xs font-semibold">View</a>
                  {pub.allow_download && <a href={pub.pdf_url} download className="px-3 py-1.5 bg-white border border-brand-200 text-brand-700 rounded-lg font-ui text-xs font-semibold flex items-center gap-1"><HiDownload size={12}/>Download</a>}
                </div>
              </div>
            )}

            {/* LIKE BUTTON */}
            <div className="flex items-center gap-4 py-4 border-t border-b border-slate-100 mb-6">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-ui font-bold text-sm transition-all active:scale-95 ${liked?'bg-red-500 text-white shadow-md':'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}>
                <HiHeart size={17} className={liked?'fill-white':''}/>
                {liked?'Liked':'Like'} · {likeCount}
              </button>
              <div className="flex items-center gap-1.5 text-slate-400 font-ui text-sm">
                <HiChat size={16}/> {comments.length}
              </div>
            </div>

            {/* COMMENTS */}
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 mb-4">Comments ({comments.length})</h3>

              {comments.length === 0 ? (
                <div className="text-center py-7 bg-slate-50 rounded-2xl mb-5">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="font-ui text-sm text-slate-400">No comments yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {comments.map(c=>(
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        {c.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-ui font-bold text-sm text-slate-800">{c.author_name}</span>
                          <span className="font-ui text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                        </div>
                        <p className="font-body text-slate-700 text-base leading-relaxed">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment form */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h4 className="font-ui font-bold text-sm text-slate-700 mb-3">Leave a Comment</h4>
                <form onSubmit={handleComment} className="space-y-3">
                  {!user && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                        placeholder="Your name *" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-ui text-sm bg-white outline-none focus:border-brand-400"/>
                      <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                        placeholder="Email (optional)" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-ui text-sm bg-white outline-none focus:border-brand-400"/>
                    </div>
                  )}
                  {user && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 font-ui text-sm text-slate-500">
                      <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">{(profile?.full_name||'U').charAt(0).toUpperCase()}</div>
                      Commenting as <strong className="text-slate-800 ml-1">{profile?.full_name||user.email.split('@')[0]}</strong>
                    </div>
                  )}
                  <textarea value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))}
                    placeholder="Write your comment…" required rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-ui text-sm bg-white outline-none focus:border-brand-400 resize-none"/>
                  <button type="submit" disabled={posting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-ui text-sm font-semibold transition-all disabled:opacity-60 active:scale-95">
                    <HiPaperAirplane size={14}/> {posting?'Posting…':'Post Comment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-4">More to Read</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(r=>(
                <Link key={r.id} href={`/publication/${r.id}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="relative h-28 bg-gradient-to-br from-brand-700 to-brand-900">
                    {r.cover_image_url && <Image src={r.cover_image_url} alt={r.title} fill className="object-cover opacity-80" sizes="(max-width:640px) 100vw, 33vw"/>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{r.title}</h3>
                    <p className="font-ui text-xs text-slate-400 mt-1">{r.profiles?.full_name||r.author_name||'Anonymous'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="hero-pattern text-white mt-8 py-5 text-center">
        <p className="font-ui text-xs text-blue-300">© {new Date().getFullYear()} Three Angels Publications · <Link href="/" className="hover:text-white">Home</Link></p>
      </footer>
    </>
  )
}
