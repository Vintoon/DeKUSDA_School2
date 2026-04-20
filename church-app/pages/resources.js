import Head from 'next/head'
import Navbar from '../components/Navbar'
import { HiExternalLink } from 'react-icons/hi'

const RESOURCES = [
  {
    category: 'Bible Study',
    icon: '📖',
    gradient: 'from-brand-600 to-brand-800',
    items: [
      { icon:'📖', name:'Bible Gateway',     url:'https://www.biblegateway.com',            desc:'Read the Bible in over 200 versions and 70 languages. Includes commentary, devotionals, and study tools.' },
      { icon:'📗', name:'YouVersion Bible',  url:'https://www.youversion.com',              desc:'Free Bible app with reading plans, audio Bible, and community features.' },
      { icon:'📘', name:'Amazing Facts Bible Study', url:'https://www.amazingfacts.org/bible-study/bible-study-guides', desc:'Free Bible study guides covering prophecy, health, salvation, and more.' },
    ]
  },
  {
    category: 'EGW Estate',
    icon: '✍️',
    gradient: 'from-purple-600 to-purple-800',
    items: [
      { icon:'✍️', name:'EGW Writings',     url:'https://egwwritings.org',                 desc:'Official online library of all Ellen G. White\'s writings, fully searchable with cross-references.' },
      { icon:'🏛️', name:'White Estate',     url:'https://whiteestate.org',                 desc:'The official custodians of Ellen G. White\'s writings and legacy. Research resources and historical materials.' },
    ]
  },
  {
    category: 'Bible Truths',
    icon: '🔍',
    gradient: 'from-amber-600 to-amber-800',
    items: [
      { icon:'✝️', name:'Truth About the Sabbath', url:'https://www.adventist.org/sabbath/',    desc:'Biblical study on why Seventh-day Adventists worship on Saturday — the Seventh-day Sabbath.' },
      { icon:'🔥', name:'Truth About Hell',        url:'https://www.adventist.org/the-dead/',   desc:'What does the Bible really say about death and hell? A clear, scripture-based study.' },
      { icon:'🎓', name:'Adventist Learning Community', url:'https://circle.adventistlearningcommunity.com/browse/161', desc:'Official SDA online courses and in-depth Bible study programs. Browse over 160 courses.' },
      { icon:'🌙', name:'Sabbath Truth',           url:'https://www.sabbathtruth.com',           desc:'A comprehensive resource dedicated to the biblical Sabbath — history, scripture, and theology.' },
    ]
  },
  {
    category: 'Church Resources',
    icon: '🏛️',
    gradient: 'from-green-600 to-green-800',
    items: [
      { icon:'🌍', name:'Adventist.org',         url:'https://www.adventist.org',                    desc:'The official website of the Seventh-day Adventist world church. News, beliefs, and global mission.' },
      { icon:'📚', name:'AdventSource',          url:'https://www.adventsource.org',                  desc:'Ministry and leadership resources for Adventist churches.' },
      { icon:'📺', name:'It Is Written',         url:'https://www.itiswritten.com',                   desc:'Christian television ministry with free Bible study resources and video sermons.' },
      { icon:'📡', name:'Hope Channel',          url:'https://www.hopechannel.com',                   desc:'Christian television broadcasting Christ-centered content globally.' },
    ]
  },
  {
    category: 'Worship & Music',
    icon: '🎵',
    gradient: 'from-rose-600 to-rose-800',
    items: [
      { icon:'🎵', name:'SDA Hymnal',            url:'https://sdahymnal.net',                         desc:'The complete Seventh-day Adventist Hymnal available online with lyrics.' },
      { icon:'🎼', name:'Adventist Hymnal App',  url:'https://www.adventisthymnal.org',               desc:'Digital hymnal with audio recordings and worship aids.' },
    ]
  },
  {
    category: 'Research & Commentary',
    icon: '🔬',
    gradient: 'from-slate-600 to-slate-800',
    items: [
      { icon:'🔬', name:'Adventist Biblical Research', url:'https://adventistbiblicalresearch.org',   desc:'Deep academic Bible study resources from the Adventist Biblical Research Institute.' },
      { icon:'📰', name:'Ministry Magazine',     url:'https://www.ministrymagazine.org',              desc:'A journal for Adventist clergy and church workers with theological articles.' },
    ]
  },
]

export default function ResourcesPage({ user, profile }) {
  return (
    <>
      <Head><title>Resources — Three Angels Publications</title></Head>
      <Navbar user={user} profile={profile} />

      <div className="hero-pattern py-14 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-3">Study Resources</h1>
          <p className="font-ui text-blue-200">Curated tools to deepen your Bible study, prayer life, and understanding of Scripture and Adventist beliefs.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {RESOURCES.map(section => (
          <div key={section.category}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center text-xl shadow-sm`}>
                {section.icon}
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">{section.category}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener"
                  className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{r.icon}</span>
                    <HiExternalLink className="text-slate-300 group-hover:text-brand-500 transition-colors mt-1" size={17} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{r.name}</h3>
                  <p className="font-ui text-sm text-slate-500 leading-relaxed">{r.desc}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="font-ui text-xs font-bold text-brand-600 group-hover:underline">Visit resource →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="hero-pattern text-white mt-8 py-6 text-center">
        <p className="font-ui text-sm text-blue-300">
          © {new Date().getFullYear()} Three Angels Publications Ministry
        </p>
      </footer>
    </>
  )
}
