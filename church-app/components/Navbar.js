import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { HiMenu, HiX } from 'react-icons/hi'
import AuthModal from './AuthModal'

export default function Navbar({ user, profile, refreshProfile }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const firstName = displayName.split(' ')[0]
  const initial = firstName.charAt(0).toUpperCase()

  async function signOut() {
    await supabase.auth.signOut(); toast.success('Signed out.'); router.push('/')
  }

  const links = [
    { href:'/',          label:'Publications' },
    { href:'/resources', label:'Resources' },
    { href:'/submit',    label:'Submit' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-8 h-8"><Image src="/logo.png" alt="Logo" fill className="object-contain" /></div>
            <div className="hidden sm:block">
              <div className="font-display text-brand-900 font-bold text-base leading-none">Three Angels</div>
              <div className="font-ui text-brand-500 text-xs tracking-widest">PUBLICATIONS</div>
            </div>
            <div className="sm:hidden font-display text-brand-900 font-bold text-sm leading-none">Three Angels</div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-lg font-ui text-sm font-medium transition-all ${router.pathname===l.href?'bg-brand-50 text-brand-700':'text-slate-600 hover:bg-slate-50 hover:text-brand-700'}`}>
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin"
                className={`px-3 py-2 rounded-lg font-ui text-sm font-semibold transition-all ${router.pathname==='/admin'?'bg-brand-600 text-white':'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}>
                🛡 Admin
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">{initial}</div>
                  <span className="font-ui text-sm font-semibold text-brand-800">{firstName}</span>
                  {isAdmin && <span className="text-xs text-brand-500">· {profile.role}</span>}
                </div>
                <button onClick={signOut} className="px-3 py-1.5 text-sm font-ui text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={()=>{setAuthMode('login');setShowAuth(true)}} className="px-3 py-2 font-ui text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-lg transition-all">Sign In</button>
                <button onClick={()=>{setAuthMode('register');setShowAuth(true)}} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-ui text-sm font-semibold rounded-lg transition-all shadow-sm">Register</button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">{initial}</div>
            )}
            <button onClick={()=>setOpen(!open)} className="p-2 text-slate-600 rounded-lg hover:bg-slate-100">
              {open ? <HiX size={20}/> : <HiMenu size={20}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border-b border-brand-100">
                <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">{initial}</div>
                <div>
                  <div className="font-ui font-semibold text-sm text-slate-800">{displayName}</div>
                  <div className="font-ui text-xs text-slate-500 capitalize">{profile?.role || 'member'}</div>
                </div>
              </div>
            )}
            <div className="p-3 space-y-1">
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl font-ui text-sm font-medium transition-all ${router.pathname===l.href?'bg-brand-50 text-brand-700':'text-slate-700 hover:bg-slate-50'}`}>
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" onClick={()=>setOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl font-ui text-sm font-semibold text-brand-700 bg-brand-50">
                  🛡 Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100 mt-2">
                {user ? (
                  <button onClick={()=>{signOut();setOpen(false)}} className="w-full text-left px-4 py-3 font-ui text-sm font-medium text-red-600 rounded-xl hover:bg-red-50">Sign Out</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={()=>{setAuthMode('login');setShowAuth(true);setOpen(false)}} className="flex-1 py-2.5 border border-brand-200 text-brand-700 rounded-xl font-ui text-sm font-semibold text-center">Sign In</button>
                    <button onClick={()=>{setAuthMode('register');setShowAuth(true);setOpen(false)}} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-ui text-sm font-semibold">Register</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {showAuth && <AuthModal mode={authMode} onClose={()=>setShowAuth(false)} onSwitch={setAuthMode}/>}
    </>
  )
}
