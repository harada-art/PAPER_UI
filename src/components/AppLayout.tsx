import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Building2, Settings, Search, FileText, ChevronDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { users } from '@/data/mockData'

const BRAND = '#3C3489'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'tantosha' | 'zentai'>('tantosha')

  const alertUsers = users.filter(u => u.status === 'expired' || u.status === 'warning')
  const filteredUsers = search
    ? users.filter(u => u.name.includes(search) || u.kana.includes(search))
    : []

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F4F5F9' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND }}>
            <FileText size={17} className="text-white" />
          </div>
          <span className="font-bold text-base text-gray-900 tracking-tight">PAPER for ケアマネ</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-base text-gray-600 font-medium">さくら居宅介護支援事業所</span>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('tantosha')}
              className={cn('px-4 py-2 text-base font-semibold transition-colors',
                viewMode === 'tantosha' ? 'text-white' : 'text-gray-600 hover:bg-gray-50')}
              style={viewMode === 'tantosha' ? { backgroundColor: BRAND } : {}}
            >担当</button>
            <button
              onClick={() => setViewMode('zentai')}
              className={cn('px-4 py-2 text-base font-semibold transition-colors',
                viewMode === 'zentai' ? 'text-white' : 'text-gray-600 hover:bg-gray-50')}
              style={viewMode === 'zentai' ? { backgroundColor: BRAND } : {}}
            >全体</button>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-700">石</div>
            <span className="text-base text-gray-800 font-semibold">石橋 圭介</span>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-68 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto" style={{ width: '272px' }}>
          <nav className="p-3 pb-1">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-colors',
                location.pathname === '/'
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
              style={location.pathname === '/' ? { backgroundColor: BRAND } : {}}
            >
              <Home size={18} />
              ホーム
            </Link>
          </nav>

          {/* Alert users */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">要対応の利用者</p>
            {alertUsers.map(u => (
              <Link
                key={u.id}
                to={`/users/${u.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-gray-50',
                  location.pathname === `/users/${u.id}` ? 'bg-purple-50' : ''
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0',
                  u.status === 'expired' ? 'bg-red-500' : 'bg-yellow-400')} />
                <span className="flex-1 font-bold text-gray-900 text-base">{u.name}</span>
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  u.status === 'expired'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                )}>
                  {u.status === 'expired' ? '認定切れ' : '期限間近'}
                </span>
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="px-3 py-3 border-t border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="利用者を探す"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-colors"
              />
            </div>
            {search && filteredUsers.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
                {filteredUsers.map(u => (
                  <Link
                    key={u.id}
                    to={`/users/${u.id}`}
                    onClick={() => setSearch('')}
                    className="block px-4 py-3 text-base hover:bg-gray-50 border-b border-gray-50 last:border-0 font-medium text-gray-800"
                  >{u.name}</Link>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/users')}
              className="mt-2 w-full text-base py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-gray-200"
            >
              <Users size={15} />
              全利用者一覧
            </button>
          </div>

          {/* Bottom nav */}
          <div className="mt-auto border-t border-gray-100 p-3 space-y-1">
            <Link
              to="/admin"
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors',
                location.pathname === '/admin' ? 'bg-gray-50 font-bold' : ''
              )}
            >
              <Building2 size={18} />事業所
            </Link>
            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors',
                location.pathname.startsWith('/settings') ? 'bg-gray-50 font-bold' : ''
              )}
            >
              <Settings size={18} />設定
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
