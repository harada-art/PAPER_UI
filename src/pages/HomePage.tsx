import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, CheckCircle, ChevronRight, Users,
  Clock, CalendarDays, RefreshCw, ClipboardList, X,
} from 'lucide-react'
import { users, tasks, isThreeSetComplete, type TaskPriority } from '@/data/mockData'
import { useEvents, type KasanTask, EVENT_TYPE_META } from '@/contexts/EventContext'

const BRAND        = '#2ECC71'
const BRAND_LIGHT  = '#E8FAF0'
const TEXT         = '#2D3A33'
const TEXT_SUB     = '#6B7C74'
const BORDER       = '#DDE5E0'
const ALERT_RED    = '#D94F4F'
const ALERT_YELLOW = '#E8A838'

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
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <h3 className="font-semibold" style={{ color: TEXT }}>加算対応を記録</h3>
          <button onClick={onClose} style={{ color: TEXT_SUB }}><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: BRAND_LIGHT }}>
            <p className="text-xs mb-0.5" style={{ color: TEXT_SUB }}>加算名</p>
            <p className="text-sm font-semibold" style={{ color: TEXT }}>{task.kasanName}</p>
            <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{task.userName}</p>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: TEXT_SUB }}>対応日</label>
            <input type="date"
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-[#2ECC71]"
              style={{ borderColor: BORDER }}
              value={doneAt} onChange={e => setDoneAt(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: TEXT_SUB }}>対応内容</label>
            <textarea
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-[#2ECC71] resize-none"
              style={{ borderColor: BORDER }}
              rows={4} placeholder="例）○○病院の担当者に電話にて情報提供"
              value={content} onChange={e => setContent(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: BORDER }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border text-sm font-semibold hover:bg-gray-50"
            style={{ borderColor: BORDER, color: TEXT_SUB }}>キャンセル</button>
          <button
            onClick={() => { if (doneAt) { onResolve(doneAt, content); onClose() } }}
            disabled={!doneAt}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: BRAND }}
          >記録する</button>
        </div>
      </div>
    </div>
  )
}

// ── Schedule modal ────────────────────────────────────────────────────────
function ScheduleModal({ onClose }: { onClose: () => void }) {
  const monitoringSchedule = [
    { date: '2026年6月10日', user: '石橋 孝明' },
    { date: '2026年6月12日', user: '木梨 憲武' },
    { date: '2026年6月15日', user: '濱田 正敏' },
    { date: '2026年6月18日', user: '原田 和将' },
    { date: '2026年6月22日', user: '上田 洋一' },
  ]
  const kaigiSchedule = [
    { date: '2026年6月20日', user: '石橋 孝明' },
    { date: '2026年6月25日', user: '木梨 憲武' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <h3 className="font-semibold" style={{ color: TEXT }}>📅 今月のスケジュール</h3>
          <button onClick={onClose} style={{ color: TEXT_SUB }}><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: TEXT_SUB }}>モニタリング訪問予定</p>
            <div className="space-y-1.5">
              {monitoringSchedule.map(s => (
                <div key={s.date + s.user} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg" style={{ backgroundColor: BRAND_LIGHT }}>
                  <span style={{ color: TEXT_SUB }}>{s.date}</span>
                  <span className="font-semibold" style={{ color: TEXT }}>{s.user}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: TEXT_SUB }}>担当者会議予定</p>
            <div className="space-y-1.5">
              {kaigiSchedule.map(s => (
                <div key={s.date + s.user} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg" style={{ backgroundColor: '#FFFBF0' }}>
                  <span style={{ color: TEXT_SUB }}>{s.date}</span>
                  <span className="font-semibold" style={{ color: TEXT }}>{s.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Priority badge ─────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map = {
    urgent:    { Icon: AlertTriangle, label: '緊急',  bg: '#FFF0F0', color: ALERT_RED,    border: '#FBBFBF' },
    thisweek:  { Icon: Clock,         label: '今週中', bg: '#FFFBF0', color: ALERT_YELLOW, border: '#FCD34D' },
    thismonth: { Icon: CalendarDays,  label: '今月中', bg: '#FFFBF0', color: ALERT_YELLOW, border: '#FCD34D' },
    inprogress:{ Icon: RefreshCw,     label: '対応中', bg: BRAND_LIGHT, color: BRAND,     border: '#A3DDB7' },
  }
  const c = map[priority]
  return (
    <div className="flex flex-col items-center justify-center w-[56px] h-[56px] rounded-xl flex-shrink-0 border-2"
      style={{ backgroundColor: c.bg, borderColor: c.border }}>
      <c.Icon size={16} style={{ color: c.color }} />
      <span className="text-xs font-bold mt-0.5" style={{ color: c.color }}>{c.label}</span>
    </div>
  )
}

// ── User status badge ──────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; Icon: React.FC<{ size?: number; className?: string }>; bg: string; color: string; border: string }> = {
  expired:    { label: '認定切れ', Icon: AlertTriangle, bg: '#FFF0F0', color: ALERT_RED,    border: '#FBBFBF' },
  warning:    { label: '期限間近', Icon: Clock,         bg: '#FFFBF0', color: ALERT_YELLOW, border: '#FCD34D' },
  inprogress: { label: '対応中',   Icon: RefreshCw,     bg: BRAND_LIGHT, color: BRAND,     border: '#A3DDB7' },
  active:     { label: '利用中',   Icon: CheckCircle,   bg: BRAND_LIGHT, color: BRAND,     border: '#A3DDB7' },
}

const avatarColors = [BRAND, '#27AE60', '#6B7C74', '#E8A838', '#D94F4F']

export function HomePage() {
  const navigate = useNavigate()
  const { kasanTasks, resolveKasanTask } = useEvents()
  const [resolveTarget, setResolveTarget] = useState<KasanTask | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: TEXT }}>ホーム</h1>
          <p className="text-sm mt-0.5" style={{ color: TEXT_SUB }}>アラートとタスクを確認して、次の対応を進めましょう。</p>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg font-semibold border hover:opacity-85 transition-opacity"
          style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#A3DDB7' }}
        >
          📅 スケジュール
        </button>
      </div>

      {/* ── 今日の状況バー ── */}
      <div className="flex items-center justify-around rounded-xl mb-5 px-6"
        style={{ backgroundColor: BRAND_LIGHT, height: '64px', border: `1px solid #A3DDB7` }}>
        {[
          { value: '5', unit: '名',   label: '担当利用者',         color: TEXT },
          { value: `${visitedCount}/${totalMonitoring}`, unit: '', label: '今月のモニタリング', color: visitedCount === totalMonitoring ? BRAND : TEXT },
          { value: '2', unit: '件',   label: '期限切れ書類',       color: ALERT_RED },
          { value: String(daysUntilEnd), unit: '日', label: '月末まで残り',   color: isNearMonthEnd ? ALERT_RED : TEXT },
        ].map((item, i, arr) => (
          <div key={item.label} className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-bold leading-none" style={{ fontSize: '22px', color: item.color }}>
                {item.value}<span className="text-xs font-semibold ml-0.5" style={{ color: TEXT_SUB }}>{item.unit}</span>
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: TEXT_SUB }}>{item.label}</p>
            </div>
            {i < arr.length - 1 && <div className="w-px h-7" style={{ backgroundColor: '#A3DDB7' }} />}
          </div>
        ))}
      </div>

      {/* ── 2カラム：タスク＋進捗 ── */}
      <div className="grid grid-cols-3 gap-5 mb-5">

        {/* 今日・今週やること（2/3幅） */}
        <div className="col-span-2 bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: BORDER, boxShadow: '0 1px 4px rgba(45,58,51,0.08)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
            <h2 className="font-semibold text-lg" style={{ color: TEXT }}>⚡ 今日・今週やること</h2>
            <span className="text-xs" style={{ color: TEXT_SUB }}>優先度順 / クリックで対応画面へ</span>
          </div>
          <div className="p-4 space-y-2.5">
            {isNearMonthEnd && remainingCount > 0 && (
              <div
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: '#FFF0F0', borderLeft: `4px solid ${ALERT_RED}` }}
                onClick={() => navigate('/users/1?maintab=kiroku')}
              >
                <div className="flex flex-col items-center justify-center w-[56px] h-[56px] rounded-xl flex-shrink-0 border-2"
                  style={{ backgroundColor: '#FFF0F0', borderColor: '#FBBFBF' }}>
                  <AlertTriangle size={16} style={{ color: ALERT_RED }} />
                  <span className="text-xs font-bold mt-0.5" style={{ color: ALERT_RED }}>緊急</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm" style={{ color: ALERT_RED }}>未訪問 {remainingCount}名</span>
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>今月のモニタリング訪問が未完了</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>月末まで残り{daysUntilEnd}日</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold flex-shrink-0" style={{ color: ALERT_RED }}>
                  モニタリングへ<ChevronRight size={14} />
                </span>
              </div>
            )}

            {pendingKasanTasks.map(kt => (
              <div key={kt.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                style={{ backgroundColor: '#FFFBF0', borderLeft: `4px solid ${ALERT_YELLOW}` }}>
                <PriorityBadge priority={kt.priority} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>{kt.userName}</span>
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>{kt.kasanName}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{getKasanTaskDetail(kt)}</p>
                </div>
                <button onClick={() => setResolveTarget(kt)}
                  className="flex items-center gap-1 text-xs font-bold flex-shrink-0 hover:opacity-70 transition-opacity"
                  style={{ color: BRAND }}>
                  対応済みとして記録する<ChevronRight size={13} />
                </button>
              </div>
            ))}

            {users.filter(u => !isThreeSetComplete(u.id)).map(u => (
              <div key={`threeset-${u.id}`}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: '#FFFBF0', borderLeft: `4px solid ${ALERT_YELLOW}` }}
                onClick={() => navigate(`/users/${u.id}?maintab=shorui&tab=jibun`)}>
                <PriorityBadge priority="thismonth" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-base" style={{ color: TEXT }}>{u.name.split(' ')[1]}さん</span>
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>ケアプラン更新</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>三点セットが未完了です</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold flex-shrink-0" style={{ color: ALERT_YELLOW }}>
                  書類タブへ<ChevronRight size={14} />
                </span>
              </div>
            ))}

            {tasks.map(task => (
              <div key={task.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: 'white', border: `1px solid ${BORDER}` }}
                onClick={() => navigate(task.link)}>
                <PriorityBadge priority={task.priority} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-base" style={{ color: TEXT }}>{task.userName}</span>
                    <span className="font-semibold text-sm" style={{ color: TEXT }}>{task.title}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{task.detail}</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold flex-shrink-0" style={{ color: BRAND }}>
                  {task.action}<ChevronRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 今月の進捗（1/3幅） */}
        <div className="bg-white rounded-xl border p-6"
          style={{ borderColor: BORDER, boxShadow: '0 1px 4px rgba(45,58,51,0.08)' }}>
          <h2 className="font-semibold text-base mb-5" style={{ color: TEXT }}>今月の進捗</h2>
          <div className="space-y-5">
            {[
              { label: 'モニタリング実施率', value: `${visitedCount}/5`, width: '0%',   color: '#DDE5E0' },
              { label: '書類期限管理',       value: '2/4',              width: '50%',  color: BRAND     },
              { label: 'コンプライアンス',   value: '100%',             width: '100%', color: BRAND     },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium" style={{ color: TEXT_SUB }}>{item.label}</span>
                  <span className="font-semibold" style={{ color: TEXT }}>{item.value}</span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ backgroundColor: '#EEF1EF' }}>
                  <div className="h-2.5 rounded-full transition-all" style={{ width: item.width, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* モニタリング詳細 */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={15} style={{ color: BRAND }} />
              <span className="text-sm font-semibold" style={{ color: TEXT }}>今月のモニタリング</span>
            </div>
            <p className="text-xs mb-2" style={{ color: TEXT_SUB }}>
              残り <span className="font-bold" style={{ color: TEXT }}>{remainingCount}名</span>
              月末まで <span className="font-bold" style={{ color: isNearMonthEnd ? ALERT_RED : TEXT }}>{daysUntilEnd}日</span>
            </p>
            <button
              onClick={() => navigate('/users/1?maintab=kiroku')}
              className="flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-70"
              style={{ color: BRAND }}>
              モニタリング一覧へ<ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 利用者ステータス一覧 ── */}
      <div className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: BORDER, boxShadow: '0 1px 4px rgba(45,58,51,0.08)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: BRAND }} />
            <h2 className="font-semibold text-base" style={{ color: TEXT }}>利用者ステータス一覧</h2>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {users.map((user, idx) => {
            const sc = statusConfig[user.status]
            return (
              <div key={user.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F7FAF8] cursor-pointer transition-colors"
                onClick={() => navigate(`/users/${user.id}`)}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}>
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: TEXT }}>{user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>{user.careLevel} ／ 担当：{user.manager}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border"
                  style={{ backgroundColor: sc.bg, color: sc.color, borderColor: sc.border }}>
                  <sc.Icon size={12} />{sc.label}
                </span>
                <ChevronRight size={16} style={{ color: BORDER }} />
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
    {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}
    </>
  )
}
