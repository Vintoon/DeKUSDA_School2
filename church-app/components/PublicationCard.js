import Image from 'next/image'
import Link from 'next/link'
import { HiDownload, HiPlay, HiCalendar, HiHeart, HiChat } from 'react-icons/hi'
import { getYouTubeThumbnail } from '../lib/supabase'

const CAT = {
  sermon:     { label:'Sermon',      color:'bg-blue-100 text-blue-700' },
  devotional: { label:'Devotional',  color:'bg-purple-100 text-purple-700' },
  testimony:  { label:'Testimony',   color:'bg-green-100 text-green-700' },
  study:      { label:'Bible Study', color:'bg-amber-100 text-amber-700' },
  news:       { label:'News',        color:'bg-rose-100 text-rose-700' },
  general:    { label:'General',     color:'bg-slate-100 text-slate-700' },
}

export default function PublicationCard({ pub }) {
  const cat = CAT[pub.category] || CAT.general
  const date = new Date(pub.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
  const author = pub.profiles?.full_name || pub.author_name || 'Anonymous'
  const initials = author.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
  const ytThumb = pub.youtube_url ? getYouTubeThumbnail(pub.youtube_url) : null

  return (
    <article className="pub-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Thumbnail */}
      <Link href={`/publication/${pub.id}`} className="block relative bg-gradient-to-br from-brand-800 to-brand-600 overflow-hidden flex-shrink-0" style={{height:'180px'}}>
        {pub.cover_image_url
          ? <Image src={pub.cover_image_url} alt={pub.title} fill className="object-cover" sizes="(max-width:640px) 100vw, 50vw"/>
          : ytThumb
            ? <>
                <Image src={ytThumb} alt={pub.title} fill className="object-cover opacity-75" sizes="(max-width:640px) 100vw, 50vw"/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <HiPlay className="text-brand-700 ml-0.5" size={20}/>
                  </div>
                </div>
              </>
            : <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <img src="/logo.png" alt="" className="w-16 h-16 object-contain"/>
              </div>
        }
        {pub.featured && <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-ui font-bold px-2 py-0.5 rounded-full">★ Featured</div>}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {pub.pdf_url && <span className="bg-white/90 text-xs font-ui font-bold px-1.5 py-0.5 rounded text-slate-700">PDF</span>}
          {pub.youtube_url && <span className="bg-red-600 text-white text-xs font-ui font-bold px-1.5 py-0.5 rounded">▶</span>}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-ui font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cat.color}`}>{cat.label}</span>
          <span className="text-xs font-ui text-slate-400 flex items-center gap-1"><HiCalendar size={10}/> {date}</span>
        </div>

        <Link href={`/publication/${pub.id}`}>
          <h3 className="font-display text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2 hover:text-brand-700 transition-colors">
            {pub.title}
          </h3>
        </Link>

        {pub.summary && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1 font-ui">{pub.summary}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-brand-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <span className="font-ui text-xs text-slate-600 font-medium truncate">{author}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {(pub.like_count > 0 || pub.comment_count > 0) && (
              <div className="flex items-center gap-1.5 text-slate-400">
                {pub.like_count > 0 && <span className="flex items-center gap-0.5 text-xs font-ui"><HiHeart size={11} className="text-red-400"/>{pub.like_count}</span>}
                {pub.comment_count > 0 && <span className="flex items-center gap-0.5 text-xs font-ui"><HiChat size={11}/>{pub.comment_count}</span>}
              </div>
            )}
            <Link href={`/publication/${pub.id}`}
              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-ui text-xs font-semibold transition-colors whitespace-nowrap">
              Read →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
