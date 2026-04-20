import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  HiCheckCircle, HiXCircle, HiEye, HiTrash, HiRefresh,
  HiBadgeCheck, HiUsers, HiDocumentText, HiChevronDown
} from 'react-icons/hi'

const PUB_TABS = [
  { key: 'pending',  label: 'Pending',  dot: 'bg-amber-400' },
  { key: 'approved', label: 'Approved', dot: 'bg-green-400' },
  { key: 'rejected', label: 'Rejected', dot: 'bg-red-400' },
  { key: 'all',      label: 'All',      dot: 'bg-slate-400' },
]

const ROLE_COLORS = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
  admin:      'bg-blue-100 text-blue-700 border-blue-200',
  member:     'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminPage({ user, profile, refreshProfile }) {
  const router = useRouter()
  const [section, setSection]         = useState('publications') // 'publications' | 'users'
  const [pubTab, setPubTab]           = useState('pending')
  const [pubs, setPubs]               = useState([])
  const [users, setUsers]             = useState([])
  const [pubLoading, setPubLoading]   = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [counts, setCounts]           = useState({})
  const [previewPub, setPreviewPub]   = useState(null)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

  useEffect(() => {
    if (profile && !isAdmin) { toast.error('Access denied.'); router.push('/') }
  }, [profile])

  useEffect(() => { if (isAdmin) loadPublications(pubTab) }, [pubTab, isAdmin])

  // ── Publications ──
  async function loadPublications(status) {
    setPubLoading(true)
    let q = supabase
      .from('publications')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    if (status !== 'all') q = q.eq('status', status)
    const { data } = await q
    setPubs(data || [])
    setPubLoading(false)
    loadCounts()
  }

  async function loadCounts() {
    const { data } = await supabase.from('publications').select('status')
    const c = { pending: 0, approved: 0, rejected: 0, all: 0 }
    data?.forEach(p => { c[p.status] = (c[p.status] || 0) + 1; c.all++ })
    setCounts(c)
  }

  async function review(id, status) {
    const { error } = await supabase.from('publications').update({
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(`Publication ${status}! ✓`)
    loadPublications(pubTab)
  }

  async function deletePub(id) {
    if (!confirm('Permanently delete this publication?')) return
    const { error } = await supabase.from('publications').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted.')
    loadPublications(pubTab)
  }

  // ── Users ──
  async function loadUsers() {
    setUserLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true })
    if (error) { toast.error(error.message); setUserLoading(false); return }
    setUsers(data || [])
    setUserLoading(false)
  }

  async function changeRole(userId, newRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    if (error) { toast.error('Failed: ' + error.message); return }
    toast.success(`User role updated to ${newRole}! ✓`)
    loadUsers()
    // Refresh own profile if changing self
    if (userId === user?.id) refreshProfile?.()
  }

  if (!user || !isAdmin) return (
    <>
      <Navbar user={user} profile={profile} />
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-display text-2xl font-bold mb-2">Admin Access Only</h2>
          <p className="font-ui text-slate-500 mb-6">You must be signed in as an administrator.</p>
          <Link href="/" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-ui font-semibold text-sm">Back to Home</Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin Panel — Three Angels Publications</title></Head>
      <Navbar user={user} profile={profile} />

      {/* Header */}
      <div className="hero-pattern py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">🛡 Admin Panel</h1>
            <p className="font-ui text-blue-200 text-sm mt-1">
              Signed in as <strong className="text-white">{profile?.full_name}</strong>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${ROLE_COLORS[profile?.role] || ''}`}>
                {profile?.role}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            {/* Stats */}
            <div className="flex gap-5">
              {PUB_TABS.slice(0, 3).map(t => (
                <div key={t.key} className="text-center">
                  <div className={`font-display text-2xl font-bold ${t.key === 'pending' ? 'text-gold-400' : t.key === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                    {counts[t.key] ?? '—'}
                  </div>
                  <div className="font-ui text-xs text-blue-300 uppercase tracking-wide">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section switcher */}
      <div className="bg-brand-800 border-b border-brand-700">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => { setSection('publications'); loadPublications(pubTab) }}
            className={`flex items-center gap-2 px-5 py-3 font-ui text-sm font-semibold border-b-2 transition-all ${
              section === 'publications'
                ? 'border-white text-white'
                : 'border-transparent text-blue-300 hover:text-white'
            }`}>
            <HiDocumentText size={16} /> Publications
            {counts.pending > 0 && (
              <span className="bg-amber-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {counts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => { setSection('users'); loadUsers() }}
            className={`flex items-center gap-2 px-5 py-3 font-ui text-sm font-semibold border-b-2 transition-all ${
              section === 'users'
                ? 'border-white text-white'
                : 'border-transparent text-blue-300 hover:text-white'
            }`}>
            <HiUsers size={16} /> Manage Users
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── PUBLICATIONS SECTION ── */}
        {section === 'publications' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap items-center">
              {PUB_TABS.map(t => (
                <button key={t.key} onClick={() => setPubTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-ui text-sm font-semibold transition-all ${
                    pubTab === t.key
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                  {t.label}
                  {counts[t.key] > 0 && (
                    <span className={`text-xs font-bold ${pubTab === t.key ? 'text-blue-200' : 'text-slate-400'}`}>
                      {counts[t.key]}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={() => loadPublications(pubTab)} className="ml-auto p-2 text-slate-400 hover:text-brand-600 transition-colors" title="Refresh">
                <HiRefresh size={18} />
              </button>
            </div>

            {pubLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />)}
              </div>
            ) : pubs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="font-display text-xl font-bold text-slate-600">No {pubTab} publications</h3>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        {['Title', 'Author', 'Category', 'Date', 'Status', 'Media', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pubs.map(pub => {
                        const authorName = pub.profiles?.full_name || pub.author_name || 'Guest'
                        const date = new Date(pub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                        return (
                          <tr key={pub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-ui font-semibold text-sm text-slate-800 max-w-[180px] truncate">{pub.title}</div>
                              {pub.summary && <div className="font-ui text-xs text-slate-400 truncate max-w-[180px]">{pub.summary}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-ui text-sm text-slate-700 font-medium">{authorName}</div>
                              {pub.author_email && <div className="font-ui text-xs text-slate-400">{pub.author_email}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-ui text-xs font-semibold capitalize bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
                                {pub.category === 'study' ? 'Bible Study' : pub.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-ui text-xs text-slate-500 whitespace-nowrap">{date}</td>
                            <td className="px-4 py-3">
                              <span className={`font-ui text-xs font-bold px-2.5 py-1 rounded-full border badge-${pub.status}`}>
                                {pub.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 text-base">
                                {pub.pdf_url && <span title="Has PDF">📄</span>}
                                {pub.youtube_url && <span title="Has Video">▶️</span>}
                                {pub.cover_image_url && <span title="Has Cover">🖼️</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Link href={`/publication/${pub.id}`} target="_blank"
                                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Preview">
                                  <HiEye size={15} />
                                </Link>
                                {pub.status !== 'approved' && (
                                  <button onClick={() => review(pub.id, 'approved')} title="Approve"
                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <HiCheckCircle size={15} />
                                  </button>
                                )}
                                {pub.status !== 'rejected' && (
                                  <button onClick={() => review(pub.id, 'rejected')} title="Reject"
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <HiXCircle size={15} />
                                  </button>
                                )}
                                <button onClick={() => deletePub(pub.id)} title="Delete"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <HiTrash size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── USERS SECTION ── */}
        {section === 'users' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slate-800">All Users ({users.length})</h2>
              <button onClick={loadUsers} className="p-2 text-slate-400 hover:text-brand-600 transition-colors" title="Refresh">
                <HiRefresh size={18} />
              </button>
            </div>

            {userLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      {['User', 'Email', 'Role', 'Change Role'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {(u.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="font-ui font-semibold text-sm text-slate-800">
                              {u.full_name || '—'}
                              {u.id === user?.id && <span className="ml-2 text-xs text-brand-500 font-normal">(you)</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-ui text-sm text-slate-500">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`font-ui text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.member}`}>
                            {u.role || 'member'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {u.role !== 'admin' && u.role !== 'superadmin' && (
                              <button onClick={() => changeRole(u.id, 'admin')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-ui text-xs font-semibold transition-colors">
                                <HiBadgeCheck size={14} /> Make Admin
                              </button>
                            )}
                            {u.role === 'admin' && u.id !== user?.id && (
                              <button onClick={() => changeRole(u.id, 'member')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-ui text-xs font-semibold transition-colors">
                                Remove Admin
                              </button>
                            )}
                            {profile?.role === 'superadmin' && u.role !== 'superadmin' && (
                              <button onClick={() => changeRole(u.id, 'superadmin')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-ui text-xs font-semibold transition-colors">
                                Make Superadmin
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl font-ui text-sm text-slate-600">
              <strong className="text-brand-800">Role levels:</strong>
              <span className="ml-2">Member → can submit articles.</span>
              <span className="ml-2">Admin → can approve/reject + manage users.</span>
              <span className="ml-2">Superadmin → full access including promoting admins.</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
