import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Building2, Settings, Search, FileText,
  ChevronDown, ChevronUp, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { users } from '@/data/mockData'

const BRAND        = '#5C8A70'
const SIDEBAR_BG   = '#2D3A33'
const SIDEBAR_TEXT = '#E8F0EC'
const BORDER       = '#DDE5E0'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch]               = useState('')
  const [viewMode, setViewMode]           = useState<'tantosha' | 'zentai'>('tantosha')
  const [alertCollapsed, setAlertCollapsed] = useState(false)

  const alertUsers    = users.filter(u => u.status === 'expired' || u.status === 'warning')
  const filteredUsers = search
    ? users.filter(u => u.name.includes(search) || u.kana.includes(search))
    : []

  function isActive(path: string, exact = false) {
    return exact ? location.pathname === path : location.pathname.startsWith(path)
  }

  function linkStyle(path: string, exact = false) {
    const active = isActive(path, exact)
    return {
      className: cn(
        'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all mb-0.5 border-l-4',
        active ? '' : 'hover:bg-white/10'
      ),
      style: {
        color: SIDEBAR_TEXT,
        borderLeftColor: active ? BRAND : 'transparent',
        backgroundColor: active ? 'rgba(92,138,112,0.2)' : undefined,
      } as React.CSSProperties,
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F7F6F3' }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-5 py-3 bg-white flex-shrink-0 z-10"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND }}>
            <FileText size={15} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: BRAND }}>PAPER for ケアマネ</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:block" style={{ color: '#6B7C74' }}>さくら居宅介護支援事業所</span>

          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: BORDER }}>
            <button
              onClick={() => setViewMode('tantosha')}
              className="px-3 py-1.5 text-sm font-semibold transition-colors"
              style={viewMode === 'tantosha'
                ? { backgroundColor: BRAND, color: 'white' }
                : { color: '#6B7C74' }}
            >担当</button>
            <button
              onClick={() => setViewMode('zentai')}
              className="px-3 py-1.5 text-sm font-semibold transition-colors"
              style={viewMode === 'zentai'
                ? { backgroundColor: BRAND, color: 'white' }
                : { color: '#6B7C74' }}
            >全体</button>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: '#EAF3EE', color: BRAND }}>石</div>
            <span className="text-sm font-semibold hidden sm:block" style={{ color: '#2D3A33' }}>石橋 圭介</span>
            <ChevronDown size={13} style={{ color: '#6B7C74' }} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── (hidden on mobile, icon-only on md, full on xl) */}
        <aside
          className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto md:w-[60px] xl:w-[200px]"
          style={{ backgroundColor: SIDEBAR_BG }}
        >

          {/* 要対応の利用者 */}
          <div className="px-2 pt-4 pb-2">
            <button
              className="flex items-center justify-between w-full px-2 py-1.5 mb-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: SIDEBAR_TEXT, opacity: 0.55 }}
              onClick={() => setAlertCollapsed(!alertCollapsed)}
            >
              <span className="text-xs font-bold uppercase tracking-wider hidden xl:block">要対応の利用者</span>
              <Users size={14} className="xl:hidden mx-auto" />
              {alertCollapsed
                ? <ChevronDown size={11} className="hidden xl:block" />
                : <ChevronUp size={11} className="hidden xl:block" />}
            </button>

            {!alertCollapsed && alertUsers.map(u => {
              const l = linkStyle(`/users/${u.id}`, true)
              return (
                <Link key={u.id} to={`/users/${u.id}`} className={l.className} style={l.style}>
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0',
                    u.status === 'expired' ? 'bg-red-400' : 'bg-yellow-400')} />
                  <span className="hidden xl:block flex-1 font-semibold text-sm truncate">{u.name}</span>
                  <span className={cn(
                    'text-xs font-bold px-1.5 py-0.5 rounded-full hidden xl:block whitespace-nowrap',
                    u.status === 'expired'
                      ? 'bg-red-500/25 text-red-300'
                      : 'bg-yellow-500/25 text-yellow-300'
                  )}>
                    {u.status === 'expired' ? '認定切れ' : '期限間近'}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Search */}
          <div className="px-2 py-3 border-t border-white/10">
            <div className="relative hidden xl:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: SIDEBAR_TEXT, opacity: 0.5 }} />
              <input
                type="text"
                placeholder="利用者を探す"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:bg-white/15 transition-colors"
                style={{ color: SIDEBAR_TEXT }}
              />
            </div>
            <button className="xl:hidden flex justify-center w-full py-2 hover:bg-white/10 rounded-xl transition-colors"
              style={{ color: SIDEBAR_TEXT, opacity: 0.6 }}>
              <Search size={16} />
            </button>

            {search && filteredUsers.length > 0 && (
              <div className="mt-1 bg-white rounded-xl shadow-md overflow-hidden absolute z-20 w-44">
                {filteredUsers.map(u => (
                  <Link key={u.id} to={`/users/${u.id}`} onClick={() => setSearch('')}
                    className="block px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 font-medium text-gray-800"
                  >{u.name}</Link>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/users')}
              className="mt-2 w-full text-xs py-2 rounded-xl font-semibold hover:bg-white/10 transition-colors border border-white/10 hidden xl:flex items-center justify-center gap-1.5"
              style={{ color: SIDEBAR_TEXT }}
            >
              <Users size={13} />全利用者一覧
            </button>
          </div>

          {/* Bottom nav items */}
          <div className="mt-auto border-t border-white/10 p-2 space-y-0.5">
            {(() => {
              const homeL = linkStyle('/', true)
              return (
                <Link to="/" className={homeL.className} style={homeL.style}>
                  <Home size={17} className="flex-shrink-0" />
                  <span className="hidden xl:block">ホーム</span>
                </Link>
              )
            })()}
            {(() => {
              const adminL = linkStyle('/admin', true)
              return (
                <Link to="/admin" className={adminL.className} style={adminL.style}>
                  <Building2 size={17} className="flex-shrink-0" />
                  <span className="hidden xl:block">事業所</span>
                </Link>
              )
            })()}
            {(() => {
              const settingsL = linkStyle('/settings')
              return (
                <Link to="/settings" className={settingsL.className} style={settingsL.style}>
                  <Settings size={17} className="flex-shrink-0" />
                  <span className="hidden xl:block">設定</span>
                </Link>
              )
            })()}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden flex items-center justify-around bg-white flex-shrink-0 fixed bottom-0 left-0 right-0 z-20"
        style={{ borderTop: `1px solid ${BORDER}`, paddingBottom: 'env(safe-area-inset-bottom, 8px)', paddingTop: '8px' }}>
        <Link to="/" className="flex flex-col items-center gap-0.5 px-5 py-1">
          <Home size={20} style={{ color: location.pathname === '/' ? BRAND : '#6B7C74' }} />
          <span className="text-xs font-medium" style={{ color: location.pathname === '/' ? BRAND : '#6B7C74' }}>ホーム</span>
        </Link>
        <Link to="/users" className="flex flex-col items-center gap-0.5 px-5 py-1">
          <Users size={20} style={{ color: location.pathname.startsWith('/users') ? BRAND : '#6B7C74' }} />
          <span className="text-xs font-medium" style={{ color: location.pathname.startsWith('/users') ? BRAND : '#6B7C74' }}>利用者</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center gap-0.5 px-5 py-1">
          <Settings size={20} style={{ color: location.pathname.startsWith('/settings') ? BRAND : '#6B7C74' }} />
          <span className="text-xs font-medium" style={{ color: location.pathname.startsWith('/settings') ? BRAND : '#6B7C74' }}>設定</span>
        </Link>
      </nav>
    </div>
  )
}
