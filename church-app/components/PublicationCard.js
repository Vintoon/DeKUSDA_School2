import Image from 'next/image'
import Link from 'next/link'
import { HiPlay, HiBookOpen, HiHeart, HiChat, HiChevronRight } from 'react-icons/hi'
import { getYouTubeThumbnail } from '../lib/supabase'

const CATEGORIES = {
  sermon:     { label:'Sermon',      color:'bg-blue-100 text-blue-700' },
  devotional: { label:'Devotional',  color:'bg-purple-100 text-purple-700' },
  testimony:  { label:'Testimony',   color:'bg-green-100 text-green-700' },
  study:      { label:'Bible Study', color:'bg-amber-100 text-amber-700' },
  news:       { label:'Church News', color:'bg-rose-100 text-rose-700' },
  general:    { label:'General',     color:'bg-slate-100 text-slate-700' },
}

export default function PublicationCard({ pub }) {
  const cat = CATEGORIES[pub.category] || CATEGORIES.general
  const dateStr = new Date(pub.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
  const authorName = pub.profiles?.full_name || pub.author_name || 'Anonymous'
  const initials = authorName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
  const ytThumb = pub.youtube_url ? getYouTubeThumbnail(pub.youtube_url) : null

  /* ── Shared thumbnail block ── */
  const Thumb = ({ className }) => (
    <div className={`relative bg-gradient-to-br from-brand-800 to-brand-600 overflow-hidden flex-shrink-0 ${className}`}>
      {pub.cover_image_url ? (
        <Image src={pub.cover_image_url} alt={pub.title} fill className="object-cover" />
      ) : ytThumb ? (
        <>
          <Image src={ytThumb} alt={pub.title} fill className="object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <HiPlay className="text-brand-700 ml-0.5" size={16} />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img src="/logo.png" alt="" className="w-10 h-10 sm:w-20 sm:h-20 object-contain" />
        </div>
      )}
      {pub.featured && (
        <div className="absolute top-1.5 left-1.5 bg-gold-400 text-white text-[10px] font-ui font-bold px-1.5 py-0.5 rounded-full shadow-sm leading-none">★</div>
      )}
      {pub.youtube_url && (
        <div className="absolute bottom-1.5 right-1.5 bg-red-600/90 text-white text-[10px] font-ui font-bold px-1.5 py-0.5 rounded-full leading-none">▶</div>
      )}
    </div>
  )

  return (
    <article className="pub-card bg-white rounded-xl sm:rounded-2xl border border-slate-100 overflow-hidden shadow-sm active:scale-[0.98] transition-all">

      {/* ══ MOBILE: horizontal compact row ══ */}
      <Link href={`/publication/${pub.id}`} className="flex sm:hidden items-stretch gap-0">
        <Thumb className="w-24 h-24 rounded-none" />
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-ui font-bold px-1.5 py-0.5 rounded-full leading-none ${cat.color}`}>{cat.label}</span>
              {pub.pdf_url && <span className="text-[10px] text-slate-400">📄</span>}
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 leading-snug line-clamp-2">
              {pub.title}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{initials}</div>
              <span className="font-ui text-[11px] text-slate-500 truncate max-w-[80px]">{authorName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {pub.like_count > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-ui">
                  <HiHeart size={10} className="text-red-400" />{pub.like_count}
                </span>
              )}
              <HiChevronRight size={14} className="text-brand-400" />
            </div>
          </div>
        </div>
      </Link>

      {/* ══ DESKTOP: vertical card ══ */}
      <div className="hidden sm:flex flex-col h-full">
        <Link href={`/publication/${pub.id}`} className="block">
          <Thumb className="h-44 w-full" />
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-ui font-bold px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
            <span className="text-xs font-ui text-slate-400">{dateStr}</span>
          </div>
          <Link href={`/publication/${pub.id}`}>
            <h3 className="font-display text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2 hover:text-brand-700 transition-colors">
              {pub.title}
            </h3>
          </Link>
          {pub.summary && (
            <p className="font-body text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">{pub.summary}</p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
              <span className="font-ui text-xs text-slate-600 font-medium truncate max-w-[90px]">{authorName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-400">
                {pub.like_count > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-ui">
                    <HiHeart size={12} className="text-red-400" /> {pub.like_count}
                  </span>
                )}
                {pub.comment_count > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-ui">
                    <HiChat size={12} /> {pub.comment_count}
                  </span>
                )}
              </div>
              <Link href={`/publication/${pub.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-ui text-xs font-semibold transition-colors">
                <HiBookOpen size={12} /> Read
              </Link>
            </div>
          </div>
        </div>
      </div>

    </article>
  )
}
