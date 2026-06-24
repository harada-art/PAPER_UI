import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, FileText, Building2,
  X, CheckCircle, Zap, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { users, carePlans, consistencyChecks } from '@/data/mockData'
import { useEvents, type EventType, EVENT_TYPE_META } from '@/contexts/EventContext'

const BRAND = '#3C3489'
const LIGHT_GREEN = '#EAF3DE'
const LIGHT_ORANGE = '#FFF7ED'

function formatCarePlanDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return `${year}年${parseInt(month)}月`
}

// ── Helpers ────────────────────────────────────────────────────────────────

function RegBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-5 py-3 rounded-xl text-white font-bold hover:opacity-85 transition-opacity"
      style={{ backgroundColor: BRAND, minHeight: '48px' }}
    >登録</button>
  )
}
function ConfBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
      style={{ minHeight: '48px' }}
    >確認</button>
  )
}

function CertBadge({ certEnd }: { certEnd: string }) {
  const end = new Date(certEnd)
  const today = new Date(); today.setHours(0,0,0,0); end.setHours(0,0,0,0)
  const diff = Math.floor((today.getTime() - end.getTime()) / (1000*60*60*24))
  const fmtDate = `${end.getFullYear()}/${end.getMonth()+1}/${end.getDate()}`
  if (diff > 0) return (
    <span className="text-sm px-3 py-1 rounded-full font-bold border-2" style={{ backgroundColor:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5' }}>
      認定切れ {diff}日 （〜{fmtDate}）
    </span>
  )
  if (diff >= -60) return (
    <span className="text-sm px-3 py-1 rounded-full font-bold border-2" style={{ backgroundColor:'#FEF3C7', color:'#B45309', borderColor:'#FCD34D' }}>
      期限まで残り{-diff}日 （〜{fmtDate}）
    </span>
  )
  return (
    <span className="text-sm px-3 py-1 rounded-full font-bold border-2" style={{ backgroundColor:'#DCFCE7', color:'#15803D', borderColor:'#86EFAC' }}>
      認定 〜{fmtDate}
    </span>
  )
}

// ── イベント記録 ─────────────────────────────────────────────────────────
const EVENT_TYPE_LIST: Array<{ type: EventType; emoji: string; label: string }> = [
  { type: 'nyuin',  ...EVENT_TYPE_META.nyuin  },
  { type: 'taiin',  ...EVENT_TYPE_META.taiin  },
  { type: 'kyuhen', ...EVENT_TYPE_META.kyuhen },
  { type: 'tsuin',  ...EVENT_TYPE_META.tsuin  },
  { type: 'tanto',  ...EVENT_TYPE_META.tanto  },
  { type: 'other',  ...EVENT_TYPE_META.other  },
]


interface EventRecordModalProps {
  userId: string
  userName: string
  onRecord: (d: { userId: string; userName: string; type: EventType; date: string; place?: string; memo?: string }) => void
  onClose: () => void
}

function EventRecordModal({ userId, userName, onRecord, onClose }: EventRecordModalProps) {
  const [type, setType] = useState<EventType>('nyuin')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')

  const placeLabel: Partial<Record<EventType, string>> = {
    nyuin:  '入院先（病院名）',
    taiin:  '退院先（自宅・施設名等）',
    kyuhen: '搬送先・病院名',
    tsuin:  '通院先・病院名',
    other:  '場所・施設名',
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">イベントを記録する</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">イベント種別</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPE_LIST.map(et => (
                <button
                  key={et.type}
                  onClick={() => setType(et.type)}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                  style={type === et.type
                    ? { backgroundColor: '#EDE9FE', borderColor: BRAND, color: BRAND }
                    : { backgroundColor: 'white', borderColor: '#E5E7EB', color: '#4B5563' }}
                >
                  <span className="text-2xl">{et.emoji}</span>
                  {et.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">発生日</label>
            <input
              type="date"
              className="w-full text-base border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-purple-300"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          {type !== 'tanto' && (
            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">{placeLabel[type] ?? '場所・施設名'}（任意）</label>
              <input
                type="text"
                className="w-full text-base border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-purple-300"
                value={place}
                onChange={e => setPlace(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-2 block">メモ（任意）</label>
            <textarea
              className="w-full text-base border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-purple-300 resize-none"
              rows={3}
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-base text-gray-700 font-bold hover:bg-gray-50 transition-colors">キャンセル</button>
          <button
            onClick={() => { onRecord({ userId, userName, type, date, place: place || undefined, memo: memo || undefined }); onClose() }}
            disabled={!date}
            className="flex-1 py-3.5 rounded-xl text-white text-base font-bold disabled:opacity-40 hover:opacity-85 transition-opacity"
            style={{ backgroundColor: BRAND }}
          >記録する</button>
        </div>
      </div>
    </div>
  )
}

// ── 整合性インジケーター ─────────────────────────────────────────────────
function ConsistencyRow({ documentName, userId }: { documentName: string; userId: string }) {
  const check = consistencyChecks.find(c => c.userId === userId && c.documentName === documentName)
  if (!check) return null
  const isOk = check.status === 'consistent'
  return (
    <div
      className="px-5 py-2 border-b flex items-center gap-2 text-xs"
      style={{ backgroundColor: isOk ? '#F0FDF4' : '#FFF7ED', borderColor: '#F3F4F6' }}
    >
      <span className="text-gray-500">ケアプラン期間：<strong className="text-gray-700">{check.carePlanPeriod}</strong></span>
      <span className="text-gray-400 mx-0.5">／</span>
      <span className="text-gray-500">書類期間：<strong className="text-gray-700">{check.documentPeriod}</strong></span>
      <span className="ml-auto font-semibold" style={{ color: isOk ? '#16A34A' : '#EA580C' }}>
        {isOk ? '✅ 整合' : '⚠️ 要確認'}
      </span>
    </div>
  )
}

// ── 全書類一覧タブ ───────────────────────────────────────────────────────
function AllDocumentsTab() {
  return (
    <div className="p-6 space-y-5">
      {/* 介護保険証 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">介護保険証（コピー）</span>
            <span className="text-gray-400 text-xs">認定更新ごと</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-red-50 text-red-500 border-red-200">△ 期限切れ</span>
        </div>
        <div className="px-5 py-2 border-b border-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-gray-500 font-medium">
            <span>認定期間</span><span>保存日</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5">
            <span className="text-sm text-gray-900">〜2026年1月31日</span>
            <span className="text-xs text-red-400">期限切れ 128日</span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-red-50 text-red-500 border-red-200 font-semibold">△ 要更新</span>
            <RegBtn />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5" style={{ backgroundColor: LIGHT_GREEN }}>
            <span className="text-sm text-gray-900">〜2023年1月31日</span>
            <span className="text-xs text-gray-500">2023/2/1</span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold">⊙ 保存済</span>
            <ConfBtn />
          </div>
        </div>
      </div>

      {/* 通所介護計画書 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">通所介護計画書</span>
            <span className="text-gray-400 text-xs">ツーショ ／ 6ヶ月</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-orange-50 text-orange-500 border-orange-200">△ 未着 1件</span>
        </div>
        <ConsistencyRow documentName="通所介護計画書" userId="1" />
        <div className="px-5 py-2 border-b border-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-gray-500 font-medium">
            <span>ケアプラン期間</span><span>受取日 / 期限</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5">
            <span className="text-sm text-gray-900">2026年7月〜12月</span>
            <span className="text-xs text-red-400">期限 2026/7/1</span>
            <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap" style={{ backgroundColor: '#FFF1F0', color: '#DC2626', borderColor: '#FECDD3' }}>🔴 未着</span>
            <RegBtn />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5" style={{ backgroundColor: LIGHT_GREEN }}>
            <span className="text-sm text-gray-900">2026年1月〜6月</span>
            <span className="text-xs text-gray-500">2026/1/15</span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold whitespace-nowrap">✅ 整合・受取済</span>
            <ConfBtn />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5" style={{ backgroundColor: LIGHT_GREEN }}>
            <span className="text-sm text-gray-900">2025年7月〜12月</span>
            <span className="text-xs text-gray-500">2025/7/3</span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold">⊙ 受取済</span>
            <ConfBtn />
          </div>
        </div>
      </div>

      {/* 個別機能訓練計画書 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">個別機能訓練計画書</span>
            <span className="text-gray-400 text-xs">ツーショ ／ 3ヶ月</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderColor: '#FED7AA' }}>⚠️ 要確認</span>
        </div>
        <ConsistencyRow documentName="個別機能訓練計画書" userId="1" />
        <div className="px-5 py-2 border-b border-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-gray-500 font-medium">
            <span>ケアプラン期間</span><span>受取日 / 期限</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5" style={{ backgroundColor: LIGHT_ORANGE }}>
            <span className="text-sm text-gray-900">2026年4月〜6月</span>
            <span className="text-xs text-amber-500">期限 2026/6/30</span>
            <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap" style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderColor: '#FED7AA' }}>⚠️ 期限間近</span>
            <RegBtn />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5" style={{ backgroundColor: LIGHT_GREEN }}>
            <span className="text-sm text-gray-900">2026年1月〜3月</span>
            <span className="text-xs text-gray-500">2026/3/15</span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold">⊙ 受取済</span>
            <ConfBtn />
          </div>
        </div>
      </div>

      {/* アセスメントシート */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">アセスメントシート</span>
            <span className="text-gray-400 text-xs">ケアマネ作成</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-blue-50 text-blue-500 border-blue-200">↻ 対応中 1/3</span>
        </div>
        <div className="px-5 py-2 border-b border-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-gray-500 font-medium">
            <span>書類名</span><span>保存日</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { name: 'アセスメントシート（課題分析）', date: '未提出', ok: false },
            { name: '主治医意見書（写し）',           date: '未提出', ok: false },
            { name: '再アセスメントシート',           date: '2026/4/24', ok: true },
          ].map(row => (
            <div
              key={row.name}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.ok ? { backgroundColor: LIGHT_GREEN } : {}}
            >
              <span className="text-sm text-gray-900">{row.name}</span>
              <span className="text-xs text-gray-500">{row.date}</span>
              <span className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-semibold',
                row.ok ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-500 border-orange-200'
              )}>
                {row.ok ? '⊙ 保存済' : '△ 未提出'}
              </span>
              {row.ok ? <ConfBtn /> : <RegBtn />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── File upload modal ────────────────────────────────────────────────────
interface UploadModalProps {
  docName: string
  onUpload: (file: File) => void
  onClose: () => void
}
function UploadModal({ docName, onUpload, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  function handleUpload() {
    if (!file) return
    setUploading(true)
    setTimeout(() => { setUploading(false); setDone(true) }, 1200)
  }

  function handleComplete() { onUpload(file!); onClose() }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">{docName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        {!done ? (
          <>
            <label className="block w-full cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                {file
                  ? <><p className="text-sm font-medium text-gray-900">{file.name}</p><p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p></>
                  : <><FileText size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">PDF または画像ファイルを選択</p><p className="text-xs text-gray-300 mt-1">クリックして選択、またはドラッグ&amp;ドロップ</p></>
                }
              </div>
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50">キャンセル</button>
              <button onClick={handleUpload} disabled={!file || uploading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: BRAND }}>
                {uploading ? 'アップロード中...' : 'アップロード'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <p className="font-semibold text-gray-900">アップロード完了</p>
              <p className="text-xs text-gray-400 mt-1">「受取済」として登録されました</p>
            </div>
            <button onClick={handleComplete}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: BRAND }}>閉じる</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── 事業所書類タブ ────────────────────────────────────────────────────────
function JigyoshoDocumentsTab() {
  const [uploadModal, setUploadModal] = useState<{ key: string; name: string } | null>(null)
  const [uploaded, setUploaded] = useState<Set<string>>(new Set())
  const [showUraShima, setShowUraShima] = useState(false)

  function openUpload(key: string, name: string) { setUploadModal({ key, name }) }
  function handleUploaded() {
    if (!uploadModal) return
    setUploaded(prev => new Set([...prev, uploadModal.key]))
    setUploadModal(null)
  }

  function isUploaded(key: string) { return uploaded.has(key) }

  const STATUS_MIATSU = <span className="text-xs px-2.5 py-1 rounded-full border bg-orange-50 text-orange-500 border-orange-200 font-semibold whitespace-nowrap">△ 未着</span>
  const STATUS_KIGENKIN = <span className="text-xs px-2.5 py-1 rounded-full border bg-amber-50 text-amber-500 border-amber-200 font-semibold whitespace-nowrap">⏰ 期限間近</span>

  return (
    <>
      {uploadModal && (
        <UploadModal
          docName={uploadModal.name}
          onUpload={() => handleUploaded()}
          onClose={() => setUploadModal(null)}
        />
      )}

      <div className="p-6 space-y-5">
        {/* ステータスバー */}
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold border bg-orange-50 text-orange-500 border-orange-200">△ 未着 3件</span>
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold border bg-amber-50 text-amber-500 border-amber-200">⏰ 期限間近 3件</span>
          <span className="text-xs text-gray-400">※今・直近のみ表示しています</span>
        </div>

        {/* 通所介護施設ツーショ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Building2 size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">通所介護施設ツーショ</span>
            <span className="text-gray-400 text-xs">（通所介護）</span>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full border bg-orange-50 text-orange-500 border-orange-200 font-semibold">△ 未着 1件</span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-amber-50 text-amber-500 border-amber-200 font-semibold">⏰ 期限間近 3件</span>
          </div>
          <div className="px-5 py-2 border-b border-gray-50">
            <div className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 text-xs text-gray-500 font-semibold">
              <span>書類名</span><span>サイクル</span><span>期間</span><span>期限</span><span>状態</span><span></span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { key: 'tsusho-plan-2026h2', name: '通所介護計画書（更新）', cycle: '6ヶ月', period: '2026年7〜12月', deadline: '2026/7/1', deadlineColor: 'text-orange-500', status: STATUS_MIATSU },
              { key: 'kobetsu-2026q2', name: '個別機能訓練計画書', cycle: '3ヶ月', period: '2026年4〜6月', deadline: '2026/6/30', deadlineColor: 'text-amber-500', status: STATUS_KIGENKIN },
              { key: 'hyoka-tsusho-2026h1', name: '評価（通所介護計画書）', cycle: '—', period: '2026年1〜6月', deadline: '2026/6/15', deadlineColor: 'text-amber-500', status: STATUS_KIGENKIN },
              { key: 'monitoring-2026-05', name: 'モニタリング報告書', cycle: '毎月', period: '2026年5月', deadline: '2026/6/5', deadlineColor: 'text-amber-500', status: STATUS_KIGENKIN },
            ].map(row => (
              <div key={row.key}
                className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 items-center px-5 py-3.5"
                style={isUploaded(row.key) ? { backgroundColor: LIGHT_GREEN } : {}}>
                <span className="text-sm font-medium text-gray-900">{row.name}</span>
                <span className="text-sm text-gray-600">{row.cycle}</span>
                <span className="text-sm text-gray-600">{row.period}</span>
                <span className={`text-sm font-medium ${row.deadlineColor}`}>{row.deadline}</span>
                {isUploaded(row.key)
                  ? <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold whitespace-nowrap">⊙ 受取済</span>
                  : row.status}
                {isUploaded(row.key)
                  ? <ConfBtn />
                  : <RegBtn onClick={() => openUpload(row.key, row.name)} />}
              </div>
            ))}
          </div>
        </div>

        {/* 訪問看護ヤットデタ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Building2 size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">訪問看護ヤットデタ</span>
            <span className="text-gray-400 text-xs">（訪問看護）</span>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full border bg-orange-50 text-orange-500 border-orange-200 font-semibold">△ 未着 1件</span>
          </div>
          <div className="px-5 py-2 border-b border-gray-50">
            <div className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 text-xs text-gray-500 font-semibold">
              <span>書類名</span><span>サイクル</span><span>期間</span><span>期限</span><span>状態</span><span></span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { key: 'houmon-report-2026-05', name: '訪問看護報告書', cycle: '毎月', period: '2026年5月', deadline: '2026/6/10', deadlineColor: 'text-red-400', status: STATUS_MIATSU },
            ].map(row => (
              <div key={row.key}
                className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 items-center px-5 py-3.5"
                style={isUploaded(row.key) ? { backgroundColor: LIGHT_GREEN } : {}}>
                <span className="text-sm font-medium text-gray-900">{row.name}</span>
                <span className="text-sm text-gray-600">{row.cycle}</span>
                <span className="text-sm text-gray-600">{row.period}</span>
                <span className={`text-sm font-medium ${row.deadlineColor}`}>{row.deadline}</span>
                {isUploaded(row.key)
                  ? <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold whitespace-nowrap">⊙ 受取済</span>
                  : row.status}
                {isUploaded(row.key) ? <ConfBtn /> : <RegBtn onClick={() => openUpload(row.key, row.name)} />}
              </div>
            ))}
          </div>
        </div>

        {/* 福祉用具ウラシマ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Building2 size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">福祉用具ウラシマ</span>
            <span className="text-gray-400 text-xs">（福祉用具貸与）</span>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold">✓ すべて揃っています</span>
          </div>
          {showUraShima && (
            <div className="px-5 py-3.5 text-sm text-gray-400">過去の書類はありません。</div>
          )}
          <div className="px-5 py-3 border-t border-gray-50 text-center">
            <button onClick={() => setShowUraShima(!showUraShima)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              {showUraShima ? '▲ 折りたたむ' : '▼ 過去も見る'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── 記録タブ ──────────────────────────────────────────────────────────────
function RecordsTab() {
  const navigate = useNavigate()
  const [recordSubTab, setRecordSubTab] = useState('monitoring')
  const [visitDates, setVisitDates] = useState<Record<string, string>>({})
  const [visited, setVisited] = useState<Record<string, boolean>>({})
  const [hasRecord] = useState<Record<string, boolean>>({ '1': true })

  const visitedCount = Object.values(visited).filter(Boolean).length

  return (
    <div>
      <div className="flex gap-1 px-6 pt-4 pb-0 border-b border-gray-200 bg-white">
        {[{ id: 'monitoring', label: 'モニタリング' }, { id: 'schedule', label: 'スケジュール' }].map(t => (
          <button
            key={t.id}
            onClick={() => setRecordSubTab(t.id)}
            className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors"
            style={recordSubTab === t.id
              ? { borderBottomColor: BRAND, color: BRAND }
              : { borderColor: 'transparent', color: '#6B7280' }}
          >{t.label}</button>
        ))}
      </div>

      {recordSubTab === 'monitoring' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900">2026年6月のモニタリング</h3>
              <p className="text-xs text-gray-400 mt-0.5">完了/全体：{visitedCount}/5　実施率：{Math.round(visitedCount / 5 * 100)}%　予定：5件</p>
            </div>
            <button className="text-sm px-4 py-2 rounded-xl text-white font-semibold" style={{ backgroundColor: BRAND }}>
              今月の一括生成
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold">利用者</th>
                  <th className="text-left px-5 py-3 font-semibold">対象月</th>
                  <th className="text-left px-5 py-3 font-semibold">訪問日</th>
                  <th className="text-center px-5 py-3 font-semibold">訪問済み</th>
                  <th className="text-left px-5 py-3 font-semibold">記録状況</th>
                  <th className="text-left px-5 py-3 font-semibold">担当</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isVisited = visited[u.id] ?? false
                  const recorded = hasRecord[u.id] ?? false
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        'border-b border-gray-50 last:border-0 cursor-pointer transition-colors',
                        isVisited ? 'hover:bg-[#DCEECF]' : 'hover:bg-gray-50'
                      )}
                      style={{ backgroundColor: isVisited ? '#EAF3DE' : undefined }}
                      onClick={() => navigate(`/users/${u.id}?maintab=kiroku`)}
                    >
                      <td className="px-5 py-3 font-bold text-gray-900">{u.name}</td>
                      <td className="px-5 py-3 text-gray-600">2026-06</td>
                      <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="date"
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:border-purple-300"
                          value={visitDates[u.id] ?? ''}
                          onChange={e => setVisitDates(prev => ({ ...prev, [u.id]: e.target.value }))}
                        />
                      </td>
                      <td className="px-5 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: '#16A34A' }}
                          checked={isVisited}
                          onChange={e => setVisited(prev => ({ ...prev, [u.id]: e.target.checked }))}
                        />
                      </td>
                      <td className="px-5 py-3">
                        {recorded
                          ? <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-green-200">入力済</span>
                          : <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5 rounded-full font-medium border border-gray-200">未入力</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-gray-600">{u.manager}</td>
                      <td className="px-5 py-3 text-right"><ChevronRight size={16} className="text-gray-300 ml-auto" /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {recordSubTab === 'schedule' && (
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <Clock size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">スケジュールはありません</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 自分の書類タブ ───────────────────────────────────────────────────────
function MyDocumentsTab() {
  return (
    <div className="p-6 space-y-5">
      {/* ケアプラン三点セット */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">ケアプラン三点セット</span>
            <span className="text-gray-400 text-xs">更新ごと</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-orange-50 text-orange-500 border-orange-200">△ 未完了 1件</span>
        </div>
        <div className="px-5 py-2 border-b border-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-gray-500 font-medium">
            <span>書類名</span><span>保存日</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { name: '居宅サービス計画書（第1〜2表）', date: '2026/1/5', ok: true },
            { name: '週間サービス計画表（第3表）', date: '2026/1/5', ok: true },
            { name: 'アセスメントシート（課題分析）', date: '未作成', ok: false },
          ].map(row => (
            <div
              key={row.name}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.ok ? { backgroundColor: LIGHT_GREEN } : {}}
            >
              <span className="text-sm text-gray-900">{row.name}</span>
              <span className="text-xs text-gray-500">{row.date}</span>
              <span className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-semibold',
                row.ok ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-500 border-orange-200'
              )}>
                {row.ok ? '⊙ 保存済' : '△ 未作成'}
              </span>
              {row.ok ? <ConfBtn /> : <RegBtn />}
            </div>
          ))}
        </div>
      </div>

      {/* モニタリング報告書 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">モニタリング報告書</span>
            <span className="text-gray-400 text-xs">毎月</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-blue-50 text-blue-500 border-blue-200">↻ 対応中</span>
        </div>
        <div className="px-5 py-2 border-b border-gray-50">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-gray-500 font-medium">
            <span>対象月</span><span>作成日</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { month: '2026年6月', date: '未作成', ok: false },
            { month: '2026年5月', date: '2026/6/1', ok: true },
            { month: '2026年4月', date: '2026/5/2', ok: true },
          ].map(row => (
            <div
              key={row.month}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.ok ? { backgroundColor: LIGHT_GREEN } : {}}
            >
              <span className="text-sm text-gray-900">{row.month}</span>
              <span className="text-xs text-gray-500">{row.date}</span>
              <span className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-semibold',
                row.ok ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-500 border-orange-200'
              )}>
                {row.ok ? '⊙ 作成済' : '△ 未作成'}
              </span>
              {row.ok ? <ConfBtn /> : <RegBtn />}
            </div>
          ))}
        </div>
      </div>

      {/* 担当者会議録 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: BRAND }} />
            <span className="font-semibold text-gray-900 text-sm">担当者会議録</span>
            <span className="text-gray-400 text-xs">ケアプラン更新ごと</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-green-50 text-green-600 border-green-200">✓ 揃っています</span>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { period: '2026年1月更新', date: '2026/1/10' },
            { period: '2025年7月更新', date: '2025/7/8' },
          ].map(row => (
            <div
              key={row.period}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={{ backgroundColor: LIGHT_GREEN }}
            >
              <span className="text-sm text-gray-900">{row.period}</span>
              <span className="text-xs text-gray-500">{row.date}</span>
              <span className="text-xs px-2.5 py-1 rounded-full border bg-green-50 text-green-600 border-green-200 font-semibold">⊙ 保存済</span>
              <ConfBtn />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 概要タブ ─────────────────────────────────────────────────────────────
function OverviewTab({ user }: { user: typeof users[0] }) {
  const navigate = useNavigate()
  const carePlan = carePlans.find(cp => cp.userId === user.id)

  return (
    <div className="p-6 space-y-5">
      {/* 認定・基本情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">認定・基本情報</h3>
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">要介護度</p>
            <p className="font-bold text-gray-900">{user.careLevel}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">担当ケアマネ</p>
            <p className="font-bold text-gray-900">{user.manager}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">認定有効期限</p>
            <CertBadge certEnd={user.certEnd} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">被保険者番号</p>
            <p className="font-bold text-gray-900">{user.hokenNumber}</p>
          </div>
        </div>
        {carePlan && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">ケアプラン期間</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold text-gray-800">
                短期 {formatCarePlanDate(carePlan.shortTermStart)}〜{formatCarePlanDate(carePlan.shortTermEnd)}
              </span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-800">
                長期 {formatCarePlanDate(carePlan.longTermStart)}〜{formatCarePlanDate(carePlan.longTermEnd)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* クイックリンク */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">クイックリンク</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '自分の書類', desc: 'ケアプラン・アセスメント等', path: `?maintab=shorui&tab=jibun` },
            { label: '事業所書類', desc: '通所・訪問看護等', path: `?maintab=shorui&tab=jigyosho` },
            { label: '記録', desc: 'モニタリング・スケジュール', path: `?maintab=kiroku` },
          ].map(link => (
            <button
              key={link.label}
              onClick={() => navigate(`/users/${user.id}${link.path}`)}
              className="text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all"
            >
              <p className="font-bold text-gray-900 text-sm">{link.label}</p>
              <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 書類タブ（サブタブ付き） ─────────────────────────────────────────────
function DocumentsTab({ user }: { user: typeof users[0] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const subTab = searchParams.get('tab') || 'jibun'

  const subTabs = [
    { id: 'jibun',    label: '自分の書類' },
    { id: 'jigyosho', label: '事業所書類' },
    { id: 'all',      label: '全書類一覧' },
  ]

  function setSubTab(id: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', id)
      return next
    })
  }

  const carePlan = carePlans.find(cp => cp.userId === user.id)

  return (
    <div>
      {/* ケアプラン期間 info bar */}
      {carePlan && (
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-4 text-sm">
          <span className="text-gray-500 font-medium">ケアプラン期間：</span>
          <span className="font-bold text-gray-800">
            短期 {formatCarePlanDate(carePlan.shortTermStart)}〜{formatCarePlanDate(carePlan.shortTermEnd)}
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-800">
            長期 {formatCarePlanDate(carePlan.longTermStart)}〜{formatCarePlanDate(carePlan.longTermEnd)}
          </span>
        </div>
      )}

      {/* Sub-tab pill buttons */}
      <div className="flex items-center gap-2 px-6 py-4 bg-white border-b border-gray-100">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-all"
            style={subTab === t.id
              ? { backgroundColor: BRAND, color: 'white' }
              : { backgroundColor: 'white', color: '#4B5563', border: '1px solid #E5E7EB' }}
          >{t.label}</button>
        ))}
      </div>
      {subTab === 'jibun'    && <MyDocumentsTab />}
      {subTab === 'jigyosho' && <JigyoshoDocumentsTab />}
      {subTab === 'all'      && <AllDocumentsTab />}
    </div>
  )
}

// ── メイン ────────────────────────────────────────────────────────────────
export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showEventModal, setShowEventModal] = useState(false)
  const { addEvent } = useEvents()

  const user = users.find(u => u.id === id)
  const activeTab = searchParams.get('maintab') || 'overview'

  if (!user) return (
    <div className="p-8 text-center text-gray-400">
      <p>利用者が見つかりません</p>
      <button onClick={() => navigate('/')} className="mt-4 text-sm hover:underline" style={{ color: BRAND }}>
        ホームに戻る
      </button>
    </div>
  )

  const mainTabs = [
    { id: 'overview', label: '概要' },
    { id: 'shorui',   label: '書類' },
    { id: 'kiroku',   label: '記録' },
  ]

  function setMainTab(tabId: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('maintab', tabId)
      if (tabId !== 'shorui') next.delete('tab')
      return next
    })
  }

  return (
    <div className="min-h-full">
      {/* ── User header ── */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ChevronLeft size={15} />ホームに戻る
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              {user.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className="text-sm text-gray-500">（{user.kana}）</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                担当：{user.manager} ／ 被保険者番号 {user.hokenNumber}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                  style={{ backgroundColor: '#EDE9FE', color: BRAND, borderColor: '#DDD6FE' }}
                >
                  {user.careLevel}
                </span>
                <CertBadge certEnd={user.certEnd} />
              </div>
            </div>
          </div>

          {/* イベント記録ボタン（サブカラー・控えめ） */}
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            <Zap size={15} />イベントを記録する
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex gap-0">
          {mainTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className="px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors"
              style={activeTab === t.id
                ? { borderBottomColor: BRAND, color: BRAND }
                : { borderColor: 'transparent', color: '#6B7280' }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab user={user} />}
      {activeTab === 'shorui' && <DocumentsTab user={user} />}
      {activeTab === 'kiroku' && <RecordsTab />}

      {showEventModal && (
        <EventRecordModal
          userId={String(user.id)}
          userName={user.name}
          onRecord={addEvent}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  )
}
