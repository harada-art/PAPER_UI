import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, CheckCircle, ChevronRight, Users,
  Clock, CalendarDays, RefreshCw, FileText, ClipboardList, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { users, tasks, isThreeSetComplete, type TaskPriority } from '@/data/mockData'
import { useEvents, type KasanTask, EVENT_TYPE_META } from '@/contexts/EventContext'

const BRAND = '#3C3489'

function getDaysElapsed(dateStr: string): number {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)))
}

function getKasanTaskDetail(task: KasanTask): string {
  const elapsed = getDaysElapsed(task.eventDate)
  if (task.deadlineDays) {
    const remaining = task.deadlineDays - elapsed
    const evtLabel = EVENT_TYPE_META[task.eventType]?.label ?? 'イベント'
    if (remaining <= 0) return `${evtLabel}から${elapsed}日経過・期限超過`
    return `${evtLabel}から${elapsed}日経過・期限まで残り${remaining}日`
  }
  if (task.eventType === 'taiin') return '退院前または退院後カンファレンスへの参加記録が必要です'
  if (task.eventType === 'tsuin') return '通院同行の記録が必要です'
  return ''
}

function KasanResolveModal({ task, onResolve, onClose }: { task: KasanTask; onResolve: (doneAt: string, content: string) => void; onClose: () => void }) {
  const today = new Date().toISOString().split('T')[0]
  const [doneAt, setDoneAt] = useState(today)
  const [content, setContent] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">加算対応を記録</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#EDE9FE' }}>
            <p className="text-xs text-gray-500 mb-0.5">加算名</p>
            <p className="text-sm font-semibold text-gray-900">{task.kasanName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{task.userName}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">対応日</label>
            <input
              type="date"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-300"
              value={doneAt}
              onChange={e => setDoneAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">対応内容</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-300 resize-none"
              rows={4}
              placeholder="例）○○病院の担当者に電話にて情報提供"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50">キャンセル</button>
          <button
            onClick={() => { if (doneAt) { onResolve(doneAt, content); onClose() } }}
            disabled={!doneAt}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: BRAND }}
          >記録する</button>
        </div>
      </div>
    </div>
  )
}

// ── Priority badge (icon + label stacked) ──────────────────────────────────
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map = {
    urgent:    { Icon: AlertTriangle, label: '緊急',  bg: '#FFF1F0', color: '#DC2626', border: '#FECACA' },
    thisweek:  { Icon: Clock,         label: '今週中', bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
    thismonth: { Icon: CalendarDays,  label: '今月中', bg: '#FEFCE8', color: '#A16207', border: '#FDE68A' },
    inprogress:{ Icon: RefreshCw,     label: '対応中', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  }
  const c = map[priority]
  return (
    <div
      className="flex flex-col items-center justify-center w-[64px] h-[64px] rounded-xl flex-shrink-0 border-2"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <c.Icon size={18} style={{ color: c.color }} />
      <span className="text-xs font-bold mt-0.5" style={{ color: c.color }}>{c.label}</span>
    </div>
  )
}

// ── User status badge ───────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; Icon: React.FC<{ size?: number; className?: string }>; bg: string; color: string; border: string }> = {
  expired:    { label: '認定切れ', Icon: AlertTriangle, bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' },
  warning:    { label: '期限間近', Icon: Clock,         bg: '#FEF3C7', color: '#B45309', border: '#FCD34D' },
  inprogress: { label: '対応中',   Icon: RefreshCw,     bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
  active:     { label: '利用中',   Icon: CheckCircle,   bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' },
}

// ── Avatar colors per user index ───────────────────────────────────────────
const avatarColors = ['#6B5BDB', '#4B7FE5', '#0D9488', '#D97706', '#059669']

export function HomePage() {
  const navigate = useNavigate()
  const { kasanTasks, resolveKasanTask } = useEvents()
  const [resolveTarget, setResolveTarget] = useState<KasanTask | null>(null)
  const pendingKasanTasks = kasanTasks.filter(t => t.status === 'pending')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const daysUntilEnd = Math.round((lastDayOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isNearMonthEnd = daysUntilEnd <= 5
  const visitedCount = 0
  const totalMonitoring = users.length
  const remainingCount = totalMonitoring - visitedCount

  return (
    <>
    <div className="p-6 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ホーム</h1>
        <p className="text-gray-500 text-sm mt-1">アラートとタスクを確認して、次の対応を進めましょう。</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 担当利用者 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDE9FE' }}>
            <Users size={26} style={{ color: BRAND }} />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold mb-0.5">担当利用者</p>
            <p className="font-black text-gray-900" style={{ fontSize: '32px', lineHeight: '1.1' }}>5<span className="text-base font-semibold text-gray-500 ml-1">名</span></p>
          </div>
        </div>

        {/* 期限切れ書類 */}
        <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-md flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEE2E2' }}>
            <FileText size={26} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold mb-0.5">期限切れ書類</p>
            <p className="font-black text-red-600" style={{ fontSize: '32px', lineHeight: '1.1' }}>2<span className="text-base font-semibold text-gray-500 ml-1">件</span></p>
          </div>
        </div>

        {/* 今月のモニタリング */}
        <div
          className={cn(
            'rounded-2xl p-6 border shadow-md transition-colors',
            isNearMonthEnd ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', isNearMonthEnd ? 'bg-red-100' : 'bg-gray-100')}>
              <ClipboardList size={22} className={isNearMonthEnd ? 'text-red-600' : 'text-gray-500'} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">今月のモニタリング</p>
              <p className={cn('font-black mt-0.5', isNearMonthEnd ? 'text-red-600' : 'text-gray-900')} style={{ fontSize: '32px', lineHeight: '1.1' }}>
                {visitedCount}<span className="text-base font-semibold text-gray-500 ml-1">/{totalMonitoring} 訪問済み</span>
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <p>残り <span className="font-bold text-gray-800">{remainingCount}名</span></p>
            <p>月末まで残り <span className={cn('font-bold', isNearMonthEnd ? 'text-red-600' : 'text-gray-800')}>{daysUntilEnd}日</span></p>
          </div>
          <button
            onClick={() => navigate('/users/1?maintab=kiroku')}
            className={cn('flex items-center gap-1 text-sm font-bold transition-colors hover:opacity-70', isNearMonthEnd ? 'text-red-600' : '')}
            style={!isNearMonthEnd ? { color: BRAND } : undefined}
          >
            モニタリング一覧へ
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* ── 近々のタスク ── */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h2 className="font-bold text-xl text-gray-900">⚡ 近々のタスク</h2>
            <span className="text-sm text-gray-500">優先度順 / クリックで対応画面へ</span>
          </div>
          <div className="p-4 space-y-3">
            {isNearMonthEnd && remainingCount > 0 && (
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-red-300 cursor-pointer hover:bg-red-100 transition-all"
                style={{ backgroundColor: '#FFF5F5' }}
                onClick={() => navigate('/users/1?maintab=kiroku')}
              >
                <div className="flex flex-col items-center justify-center w-[64px] h-[64px] rounded-xl flex-shrink-0 border-2 border-red-300" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertTriangle size={20} className="text-red-600" />
                  <span className="text-xs font-bold mt-0.5 text-red-600">緊急</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-base text-red-700">未訪問 {remainingCount}名</span>
                    <span className="font-bold text-base text-gray-800">今月のモニタリング訪問が未完了</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">月末まで残り{daysUntilEnd}日</p>
                </div>
                <span className="flex items-center gap-1 text-base font-bold flex-shrink-0 text-red-600">
                  モニタリングへ
                  <ChevronRight size={16} />
                </span>
              </div>
            )}
            {pendingKasanTasks.map(kt => (
              <div
                key={kt.id}
                className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-orange-200 transition-all"
                style={{ backgroundColor: '#FFFBEB' }}
              >
                <PriorityBadge priority={kt.priority} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-base text-gray-900">{kt.userName}</span>
                    <span className="font-bold text-base text-gray-800">{kt.kasanName}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{getKasanTaskDetail(kt)}</p>
                </div>
                <button
                  onClick={() => setResolveTarget(kt)}
                  className="flex items-center gap-1 text-sm font-bold flex-shrink-0 hover:opacity-70 transition-opacity"
                  style={{ color: BRAND }}
                >
                  対応済みとして記録する
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
            {/* 三点セット未完了アラート */}
            {users.filter(u => !isThreeSetComplete(u.id)).map(u => (
              <div
                key={`threeset-${u.id}`}
                className="flex items-center gap-4 px-5 py-4 rounded-xl border border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50/60 cursor-pointer transition-all"
                style={{ backgroundColor: '#FFFBEB' }}
                onClick={() => navigate(`/users/${u.id}?maintab=shorui&tab=jibun`)}
              >
                <PriorityBadge priority="thismonth" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg text-gray-900">{u.name.split(' ')[1]}さん</span>
                    <span className="font-bold text-base text-gray-800">ケアプラン更新</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">三点セットが未完了です</p>
                </div>
                <span
                  className="flex items-center gap-1 text-base font-bold flex-shrink-0"
                  style={{ color: '#A16207' }}
                >
                  書類タブへ
                  <ChevronRight size={16} />
                </span>
              </div>
            ))}
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-all"
                onClick={() => navigate(task.link)}
              >
                <PriorityBadge priority={task.priority} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg text-gray-900">{task.userName}</span>
                    <span className="font-bold text-base text-gray-800">{task.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{task.detail}</p>
                </div>
                <span
                  className="flex items-center gap-1 text-base font-bold flex-shrink-0"
                  style={{ color: BRAND }}
                >
                  {task.action}
                  <ChevronRight size={16} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 今月の進捗 ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <h2 className="font-bold text-xl text-gray-900 mb-5">今月の進捗</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-base mb-2">
                <span className="text-gray-700 font-medium">モニタリング実施率</span>
                <span className="font-bold text-gray-600">0/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gray-300" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-base mb-2">
                <span className="text-gray-700 font-medium">書類期限管理</span>
                <span className="font-bold text-gray-800">2/4</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full" style={{ width: '50%', backgroundColor: BRAND }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-base mb-2">
                <span className="text-gray-700 font-medium">コンプライアンス</span>
                <span className="font-bold text-green-700">100%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-green-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 利用者ステータス一覧 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-bold text-xl text-gray-900">利用者ステータス一覧</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {users.map((user, idx) => {
            const sc = statusConfig[user.status]
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                >
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{user.careLevel} ／ 担当：{user.manager}</p>
                </div>
                <span
                  className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl border-2"
                  style={{ backgroundColor: sc.bg, color: sc.color, borderColor: sc.border }}
                >
                  <sc.Icon size={13} />
                  {sc.label}
                </span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
    {resolveTarget && (
      <KasanResolveModal
        task={resolveTarget}
        onResolve={(doneAt, content) => resolveKasanTask(resolveTarget.id, doneAt, content)}
        onClose={() => setResolveTarget(null)}
      />
    )}
    </>
  )
}
