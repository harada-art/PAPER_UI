import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { users } from '@/data/mockData'
import { cn } from '@/lib/utils'

const BRAND = '#3C3489'

export function UsersListPage() {
  const navigate = useNavigate()
  const statusMap: Record<string, { label: string; className: string }> = {
    expired: { label: '認定切れ', className: 'bg-red-100 text-red-700' },
    warning: { label: '期限間近', className: 'bg-yellow-100 text-yellow-700' },
    inprogress: { label: '対応中', className: 'bg-blue-100 text-blue-700' },
    active: { label: '利用中', className: 'bg-green-100 text-green-700' },
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">全利用者一覧</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-50">
        {users.map(user => {
          const s = statusMap[user.status]
          return (
            <div key={user.id} onClick={() => navigate(`/users/${user.id}`)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: BRAND }}>
                {user.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400">{user.kana} ／ {user.careLevel} ／ 担当：{user.manager}</p>
              </div>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", s.className)}>{s.label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
