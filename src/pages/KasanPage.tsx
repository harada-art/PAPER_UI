import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { useEvents, EVENT_TYPE_META } from '@/contexts/EventContext'

const BRAND = '#5C8A70'
const LIGHT_GREEN = '#EAF3EE'

type KasanType = 'periodic' | 'event'
type KasanStatus = 'active' | 'inactive'

interface KasanEntry {
  id: string
  name: string
  type: KasanType
  status: KasanStatus
  requirements: string
  trigger?: string
  deadline?: number
}

interface MonthlyCheckRecord {
  checked: boolean
  checkedAt: string
  checkedBy: string
}

const INITIAL_KASAN: KasanEntry[] = [
  { id: 'p1', name: '特定事業所加算（Ⅰ）',           type: 'periodic', status: 'active',   requirements: '常勤専従の主任介護支援専門員を1名以上配置すること。\n介護支援専門員の数が3名以上であること。\n前6ヶ月間の新規利用者のうち要介護3以上が50%以上であること。' },
  { id: 'p2', name: '特定事業所加算（Ⅱ）',           type: 'periodic', status: 'inactive', requirements: '常勤専従の主任介護支援専門員を1名以上配置すること。\n介護支援専門員の数が2名以上であること。' },
  { id: 'p3', name: '特定事業所加算（Ⅲ）',           type: 'periodic', status: 'inactive', requirements: '常勤専従の主任介護支援専門員を1名以上配置すること。\n介護支援専門員の数が1名以上であること。' },
  { id: 'p4', name: '特定事業所加算（Ⅳ）',           type: 'periodic', status: 'inactive', requirements: '介護支援専門員を1名以上配置すること。\n24時間連絡体制を確保すること。' },
  { id: 'p5', name: '独居高齢者等加算',               type: 'periodic', status: 'active',   requirements: '担当する利用者のうち単身世帯・高齢者のみの世帯の割合が50%以上であること。' },
  { id: 'p6', name: '認知症専門ケア加算',             type: 'periodic', status: 'inactive', requirements: '認知症ケアに関する専門研修を修了した介護支援専門員が配置されていること。' },
  { id: 'p7', name: '特別地域加算',                   type: 'periodic', status: 'inactive', requirements: '特別地域（離島・中山間地域等）に所在する事業所であること。' },
  { id: 'p8', name: '中山間地域等小規模事業所加算',   type: 'periodic', status: 'inactive', requirements: '中山間地域等に所在する小規模事業所であること。' },
  { id: 'e1', name: '初回加算',                       type: 'event',    status: 'active',   requirements: '新規に居宅サービス計画を作成する利用者に対して行うこと。',            trigger: '新規利用者登録' },
  { id: 'e2', name: '入院時情報提供加算',             type: 'event',    status: 'active',   requirements: '入院3日以内に病院への情報提供を行うこと。',                           trigger: '入院',    deadline: 3 },
  { id: 'e3', name: '退院・退所加算',                 type: 'event',    status: 'active',   requirements: '退院・退所時にカンファレンスへの参加または情報収集を行うこと。',       trigger: '退院' },
  { id: 'e4', name: '通院時情報連携加算',             type: 'event',    status: 'inactive', requirements: '通院同行により医療機関との情報連携を行うこと。',                       trigger: '通院同行' },
  { id: 'e5', name: '緊急時等居宅カンファレンス加算', type: 'event',    status: 'active',   requirements: '急変時等に2日以内に居宅カンファレンスを開催すること。',                trigger: '急変',    deadline: 2 },
  { id: 'e6', name: 'ターミナルケアマネジメント加算', type: 'event',    status: 'inactive', requirements: '終末期において医師や看護師等との連携のもとサービスを提供すること。',   trigger: '終末期' },
]

function StatusBadge({ status }: { status: KasanStatus }) {
  return status === 'active'
    ? <span className="text-sm px-3 py-1 rounded-full font-bold whitespace-nowrap text-white" style={{ backgroundColor: '#5C8A70' }}>算定中</span>
    : <span className="text-sm px-3 py-1 rounded-full font-semibold whitespace-nowrap" style={{ backgroundColor: '#F3F6F4', color: '#6B7C74', border: '1px solid #DDE5E0' }}>対象外</span>
}

interface EditModalProps {
  entry: KasanEntry
  isNew: boolean
  onSave: (entry: KasanEntry) => void
  onClose: () => void
}

function EditModal({ entry, isNew, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<KasanEntry>({ ...entry })

  function set<K extends keyof KasanEntry>(key: K, value: KasanEntry[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const typeOptions: Array<[KasanType, string]> = [['periodic', '定期チェック型'], ['event', 'イベント連動型']]
  const statusOptions: Array<[KasanStatus, string]> = [['active', '算定中'], ['inactive', '対象外']]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{isNew ? '加算を追加' : '加算を編集'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* 加算名 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">加算名</label>
            <input
              type="text"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#5C8A70]"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* 種別 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">種別</label>
            <div className="flex gap-5">
              {typeOptions.map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="kasan-type" style={{ accentColor: '#5C8A70' }} checked={form.type === val} onChange={() => set('type', val)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 状態 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">状態</label>
            <div className="flex gap-5">
              {statusOptions.map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="kasan-status" style={{ accentColor: '#5C8A70' }} checked={form.status === val} onChange={() => set('status', val)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 要件説明 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">要件説明</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#5C8A70] resize-none"
              rows={4}
              placeholder="例）常勤専従の主任ケアマネが1名以上配置されていること"
              value={form.requirements}
              onChange={e => set('requirements', e.target.value)}
            />
          </div>

          {/* イベント連動型の場合のみ */}
          {form.type === 'event' && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-400 mb-3">
                イベント連動設定
                <span className="ml-1.5 text-[11px] text-gray-300 font-normal">（Phase 2 で本実装予定）</span>
              </p>
              <div className="space-y-3 opacity-50 pointer-events-none select-none">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">トリガーイベント</label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white"
                    value={form.trigger ?? ''}
                    placeholder="例）入院、退院、急変..."
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">期限（○日以内）</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-20 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-center"
                      value={form.deadline ?? ''}
                      readOnly
                    />
                    <span className="text-sm text-gray-400">日以内</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50">
            キャンセル
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: BRAND }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export function KasanPage() {
  const navigate = useNavigate()
  const [kasanList, setKasanList] = useState<KasanEntry[]>(INITIAL_KASAN)
  const [editTarget, setEditTarget] = useState<KasanEntry | null>(null)
  const [monthlyChecks, setMonthlyChecks] = useState<Record<string, MonthlyCheckRecord>>({})
  const [eventTab, setEventTab] = useState<'list' | 'history'>('list')
  const { kasanRecords } = useEvents()

  const today = new Date()
  const yearMonth = `${today.getFullYear()}年${today.getMonth() + 1}月`
  const CHECKER = '石橋 圭介'

  const periodicKasan = kasanList.filter(k => k.type === 'periodic')
  const eventKasan = kasanList.filter(k => k.type === 'event')

  function handleMonthlyCheck(kasanId: string, checked: boolean) {
    if (checked) {
      const now = new Date()
      const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
      setMonthlyChecks(prev => ({ ...prev, [kasanId]: { checked: true, checkedAt: dateStr, checkedBy: CHECKER } }))
    } else {
      setMonthlyChecks(prev => { const next = { ...prev }; delete next[kasanId]; return next })
    }
  }

  function saveEntry(entry: KasanEntry) {
    setKasanList(prev => {
      if (entry.id.startsWith('new_')) return [...prev, { ...entry, id: `k_${Date.now()}` }]
      return prev.map(k => k.id === entry.id ? entry : k)
    })
    setEditTarget(null)
  }

  function addNew() {
    setEditTarget({ id: `new_${Date.now()}`, name: '新規加算', type: 'periodic', status: 'inactive', requirements: '' })
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={15} />設定に戻る
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">加算管理</h1>
            <p className="text-sm text-gray-400 mt-1">各加算の算定状況・要件・月次チェックを管理します</p>
          </div>
          <button
            onClick={addNew}
            className="flex items-center gap-2 text-base px-5 font-bold text-white hover:opacity-85 transition-opacity rounded-xl"
            style={{ backgroundColor: BRAND, minHeight: '48px' }}
          >
            <Plus size={16} />加算を追加
          </button>
        </div>
      </div>

      {/* 今月の加算チェック */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">💰 {yearMonth}の加算チェック</h2>
          <p className="text-sm text-gray-600 mt-0.5">定期チェック型の加算について今月の要件充足を確認してください</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3.5 font-bold">加算名</th>
              <th className="text-center px-4 py-3.5 font-bold w-28">要件充足</th>
              <th className="text-left px-4 py-3.5 font-bold w-40">最終確認日</th>
              <th className="text-left px-4 py-3.5 font-bold w-32">確認者</th>
            </tr>
          </thead>
          <tbody>
            {periodicKasan.map(k => {
              const check = monthlyChecks[k.id]
              return (
                <tr
                  key={k.id}
                  className="border-b border-gray-50 last:border-0 transition-colors"
                  style={{ backgroundColor: check?.checked ? LIGHT_GREEN : undefined }}
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 text-base">{k.name}</span>
                    {k.status === 'active' && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: '#5C8A70' }}>算定中</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#5C8A70' }}
                      checked={check?.checked ?? false}
                      onChange={e => handleMonthlyCheck(k.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-4 text-gray-700 text-sm font-medium">{check?.checkedAt ?? '—'}</td>
                  <td className="px-4 py-4 text-gray-700 text-sm font-medium">{check?.checkedBy ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 加算一覧 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">加算一覧</h2>
        </div>

        {/* 定期チェック型 */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-600">定期チェック型</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600 border-b border-gray-200">
              <th className="text-left px-6 py-3.5 font-bold">加算名</th>
              <th className="text-left px-4 py-3.5 font-bold">種別</th>
              <th className="text-left px-4 py-3.5 font-bold">状態</th>
              <th className="px-4 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {periodicKasan.map(k => (
              <tr key={k.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 text-base">{k.name}</td>
                <td className="px-4 py-4">
                  <span className="text-sm px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border-2 border-blue-200 font-bold whitespace-nowrap">定期チェック型</span>
                </td>
                <td className="px-4 py-4"><StatusBadge status={k.status} /></td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => setEditTarget(k)}
                    className="text-sm px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-[#5C8A70] hover:text-[#5C8A70] transition-colors"
                  >編集</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* イベント連動型 */}
        <div className="border-t border-gray-100 mt-1">
          <div className="px-6 py-3 flex items-center justify-between bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">イベント連動型</span>
              <span className="text-xs text-gray-400">（Phase 2 で本実装予定）</span>
            </div>
            <div className="flex gap-1">
              {(['list', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setEventTab(tab)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  style={eventTab === tab
                    ? { backgroundColor: BRAND, color: 'white' }
                    : { backgroundColor: '#F3F4F6', color: '#6B7280' }}
                >
                  {tab === 'list' ? '加算一覧' : '算定履歴'}
                </button>
              ))}
            </div>
          </div>

          {eventTab === 'list' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left px-6 py-2.5 font-semibold">加算名</th>
                  <th className="text-left px-4 py-2.5 font-semibold">トリガー</th>
                  <th className="text-left px-4 py-2.5 font-semibold">状態</th>
                  <th className="px-4 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {eventKasan.map(k => (
                  <tr key={k.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors opacity-80">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{k.name}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {k.trigger}{k.deadline ? `・${k.deadline}日以内` : ''}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={k.status} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setEditTarget(k)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-700 transition-colors"
                      >編集</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {eventTab === 'history' && (
            kasanRecords.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400">算定履歴はありません</p>
                <p className="text-xs text-gray-300 mt-1">利用者のイベント記録から加算対応を完了すると、ここに表示されます</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-2.5 font-semibold">利用者名</th>
                    <th className="text-left px-4 py-2.5 font-semibold">イベント種別</th>
                    <th className="text-left px-4 py-2.5 font-semibold">発生日</th>
                    <th className="text-left px-4 py-2.5 font-semibold">対応日</th>
                    <th className="text-left px-4 py-2.5 font-semibold">対応内容</th>
                    <th className="px-4 py-2.5 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {kasanRecords.map(r => {
                    const et = EVENT_TYPE_META[r.eventType]
                    return (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-3.5 font-medium text-gray-900">{r.userName}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">
                          <span className="mr-1">{et.emoji}</span>{et.label}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{r.eventDate}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{r.doneAt}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[200px] truncate">{r.doneContent || '—'}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap text-white" style={{ backgroundColor: '#5C8A70' }}>算定済み</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {editTarget && (
        <EditModal
          entry={editTarget}
          isNew={editTarget.id.startsWith('new_')}
          onSave={saveEntry}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
