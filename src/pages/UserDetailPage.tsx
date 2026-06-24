import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, FileText, Building2,
  X, CheckCircle, Zap, Clock, Mic,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { users, carePlans, consistencyChecks } from '@/data/mockData'
import { useEvents, type EventType, EVENT_TYPE_META } from '@/contexts/EventContext'

const BRAND        = '#5C8A70'
const BRAND_LIGHT  = '#EAF3EE'
const TEXT         = '#2D3A33'
const TEXT_SUB     = '#6B7C74'
const BORDER       = '#DDE5E0'
const ALERT_RED    = '#D94F4F'
const ALERT_YELLOW = '#E8A838'

function formatCarePlanDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return `${year}年${parseInt(month)}月`
}

// ── Helpers ────────────────────────────────────────────────────────────────
function RegBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="text-sm px-4 py-2.5 rounded-lg text-white font-semibold hover:opacity-85 transition-opacity"
      style={{ backgroundColor: BRAND, minHeight: '44px' }}>登録</button>
  )
}
function ConfBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="text-sm px-4 py-2.5 rounded-lg font-semibold hover:opacity-80 transition-colors"
      style={{ border: `2px solid ${BRAND}`, color: BRAND, minHeight: '44px' }}>確認</button>
  )
}

function CertBadge({ certEnd }: { certEnd: string }) {
  const end = new Date(certEnd)
  const today = new Date(); today.setHours(0,0,0,0); end.setHours(0,0,0,0)
  const diff = Math.floor((today.getTime() - end.getTime()) / (1000*60*60*24))
  const fmtDate = `${end.getFullYear()}/${end.getMonth()+1}/${end.getDate()}`
  if (diff > 0) return (
    <span className="text-sm px-3 py-1 rounded-full font-bold border-2 text-white" style={{ backgroundColor: ALERT_RED, borderColor: '#c43f3f' }}>
      認定切れ {diff}日 （〜{fmtDate}）
    </span>
  )
  if (diff >= -60) return (
    <span className="text-sm px-3 py-1 rounded-full font-bold border-2" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>
      期限まで残り{-diff}日 （〜{fmtDate}）
    </span>
  )
  return (
    <span className="text-sm px-3 py-1 rounded-full font-bold border-2" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>
      認定 〜{fmtDate}
    </span>
  )
}

// ── イベント記録 ──────────────────────────────────────────────────────────
const EVENT_TYPE_LIST: Array<{ type: EventType; emoji: string; label: string }> = [
  { type: 'nyuin',  ...EVENT_TYPE_META.nyuin  },
  { type: 'taiin',  ...EVENT_TYPE_META.taiin  },
  { type: 'kyuhen', ...EVENT_TYPE_META.kyuhen },
  { type: 'tsuin',  ...EVENT_TYPE_META.tsuin  },
  { type: 'tanto',  ...EVENT_TYPE_META.tanto  },
  { type: 'other',  ...EVENT_TYPE_META.other  },
]

interface EventRecordModalProps {
  userId: string; userName: string
  onRecord: (d: { userId: string; userName: string; type: EventType; date: string; place?: string; memo?: string }) => void
  onClose: () => void
}

function EventRecordModal({ userId, userName, onRecord, onClose }: EventRecordModalProps) {
  const [type, setType]   = useState<EventType>('nyuin')
  const [date, setDate]   = useState(new Date().toISOString().split('T')[0])
  const [place, setPlace] = useState('')
  const [memo, setMemo]   = useState('')

  const placeLabel: Partial<Record<EventType, string>> = {
    nyuin: '入院先（病院名）', taiin: '退院先（自宅・施設名等）',
    kyuhen: '搬送先・病院名', tsuin: '通院先・病院名', other: '場所・施設名',
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <h3 className="font-semibold" style={{ color: TEXT }}>イベントを記録する</h3>
          <button onClick={onClose} style={{ color: TEXT_SUB }}><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: TEXT_SUB }}>イベント種別</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPE_LIST.map(et => (
                <button key={et.type} onClick={() => setType(et.type)}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                  style={type === et.type
                    ? { backgroundColor: BRAND_LIGHT, borderColor: BRAND, color: BRAND }
                    : { backgroundColor: 'white', borderColor: BORDER, color: TEXT_SUB }}>
                  <span className="text-2xl">{et.emoji}</span>{et.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_SUB }}>発生日</label>
            <input type="date"
              className="w-full text-base border-2 rounded-xl px-3 py-3 focus:outline-none focus:border-[#5C8A70]"
              style={{ borderColor: BORDER }}
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          {type !== 'tanto' && (
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_SUB }}>{placeLabel[type] ?? '場所・施設名'}（任意）</label>
              <input type="text"
                className="w-full text-base border-2 rounded-xl px-3 py-3 focus:outline-none focus:border-[#5C8A70]"
                style={{ borderColor: BORDER }}
                value={place} onChange={e => setPlace(e.target.value)} />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_SUB }}>メモ（任意）</label>
            <textarea
              className="w-full text-base border-2 rounded-xl px-3 py-3 focus:outline-none focus:border-[#5C8A70] resize-none"
              style={{ borderColor: BORDER }}
              rows={3} value={memo} onChange={e => setMemo(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: BORDER }}>
          <button onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border-2 text-base font-bold hover:bg-gray-50 transition-colors"
            style={{ borderColor: BORDER, color: TEXT_SUB }}>キャンセル</button>
          <button
            onClick={() => { onRecord({ userId, userName, type, date, place: place || undefined, memo: memo || undefined }); onClose() }}
            disabled={!date}
            className="flex-1 py-3.5 rounded-xl text-white text-base font-bold disabled:opacity-40 hover:opacity-85 transition-opacity"
            style={{ backgroundColor: BRAND }}>記録する</button>
        </div>
      </div>
    </div>
  )
}

// ── 整合性インジケーター ──────────────────────────────────────────────────
function ConsistencyRow({ documentName, userId }: { documentName: string; userId: string }) {
  const check = consistencyChecks.find(c => c.userId === userId && c.documentName === documentName)
  if (!check) return null
  const isOk = check.status === 'consistent'
  return (
    <div className="px-5 py-2 border-b flex items-center gap-2 text-xs"
      style={{ backgroundColor: isOk ? '#F0FAF4' : '#FFFBF0', borderColor: '#F0F4F2' }}>
      <span style={{ color: TEXT_SUB }}>ケアプラン期間：<strong style={{ color: TEXT }}>{check.carePlanPeriod}</strong></span>
      <span style={{ color: BORDER }} className="mx-0.5">／</span>
      <span style={{ color: TEXT_SUB }}>書類期間：<strong style={{ color: TEXT }}>{check.documentPeriod}</strong></span>
      <span className="ml-auto font-semibold" style={{ color: isOk ? BRAND : ALERT_YELLOW }}>
        {isOk ? '✅ 整合' : '⚠️ 要確認'}
      </span>
    </div>
  )
}

// ── 全書類一覧タブ ────────────────────────────────────────────────────────
function AllDocumentsTab() {
  return (
    <div className="p-6 space-y-5">
      {/* 介護保険証 */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>介護保険証（コピー）</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>認定更新ごと</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: '#FFF0F0', color: ALERT_RED, borderColor: '#FBBFBF' }}>△ 期限切れ</span>
        </div>
        <div className="px-5 py-2 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs font-medium" style={{ color: TEXT_SUB }}>
            <span>認定期間</span><span>保存日</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5">
            <span className="text-sm" style={{ color: TEXT }}>〜2026年1月31日</span>
            <span className="text-xs" style={{ color: ALERT_RED }}>期限切れ 128日</span>
            <span className="text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: '#FFF0F0', color: ALERT_RED, borderColor: '#FBBFBF' }}>△ 要更新</span>
            <RegBtn />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5" style={{ backgroundColor: BRAND_LIGHT }}>
            <span className="text-sm" style={{ color: TEXT }}>〜2023年1月31日</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>2023/2/1</span>
            <span className="text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>⊙ 保存済</span>
            <ConfBtn />
          </div>
        </div>
      </div>

      {/* 通所介護計画書 */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>通所介護計画書</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>ツーショ ／ 6ヶ月</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>△ 未着 1件</span>
        </div>
        <ConsistencyRow documentName="通所介護計画書" userId="1" />
        <div className="px-5 py-2 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs font-medium" style={{ color: TEXT_SUB }}>
            <span>ケアプラン期間</span><span>受取日 / 期限</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {[
            { period: '2026年7月〜12月', date: '期限 2026/7/1', dateColor: ALERT_RED,    status: '🔴 未着',         statusBg: '#FFF0F0', statusColor: ALERT_RED,    statusBorder: '#FBBFBF', btn: 'reg' },
            { period: '2026年1月〜6月',  date: '2026/1/15',     dateColor: TEXT_SUB,    status: '✅ 整合・受取済', statusBg: BRAND_LIGHT, statusColor: BRAND,      statusBorder: '#B8D8C4', btn: 'conf' },
            { period: '2025年7月〜12月', date: '2025/7/3',      dateColor: TEXT_SUB,    status: '⊙ 受取済',       statusBg: BRAND_LIGHT, statusColor: BRAND,      statusBorder: '#B8D8C4', btn: 'conf' },
          ].map(row => (
            <div key={row.period} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.btn === 'conf' ? { backgroundColor: BRAND_LIGHT } : {}}>
              <span className="text-sm" style={{ color: TEXT }}>{row.period}</span>
              <span className="text-xs" style={{ color: row.dateColor }}>{row.date}</span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap"
                style={{ backgroundColor: row.statusBg, color: row.statusColor, borderColor: row.statusBorder }}>{row.status}</span>
              {row.btn === 'reg' ? <RegBtn /> : <ConfBtn />}
            </div>
          ))}
        </div>
      </div>

      {/* 個別機能訓練計画書 */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>個別機能訓練計画書</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>ツーショ ／ 3ヶ月</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>⚠️ 要確認</span>
        </div>
        <ConsistencyRow documentName="個別機能訓練計画書" userId="1" />
        <div className="px-5 py-2 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs font-medium" style={{ color: TEXT_SUB }}>
            <span>ケアプラン期間</span><span>受取日 / 期限</span><span>状態</span><span></span>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {[
            { period: '2026年4月〜6月', date: '期限 2026/6/30', dateColor: ALERT_YELLOW, status: '⚠️ 期限間近', statusBg: '#FFFBF0', statusColor: ALERT_YELLOW, statusBorder: '#FCD34D', btn: 'reg', rowBg: '#FFFBF0' },
            { period: '2026年1月〜3月', date: '2026/3/15',       dateColor: TEXT_SUB,    status: '⊙ 受取済',  statusBg: BRAND_LIGHT, statusColor: BRAND,      statusBorder: '#B8D8C4', btn: 'conf', rowBg: BRAND_LIGHT },
          ].map(row => (
            <div key={row.period} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={{ backgroundColor: row.rowBg }}>
              <span className="text-sm" style={{ color: TEXT }}>{row.period}</span>
              <span className="text-xs" style={{ color: row.dateColor }}>{row.date}</span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap"
                style={{ backgroundColor: row.statusBg, color: row.statusColor, borderColor: row.statusBorder }}>{row.status}</span>
              {row.btn === 'reg' ? <RegBtn /> : <ConfBtn />}
            </div>
          ))}
        </div>
      </div>

      {/* アセスメントシート */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>アセスメントシート</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>ケアマネ作成</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>↻ 対応中 1/3</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {[
            { name: 'アセスメントシート（課題分析）', date: '未提出', ok: false },
            { name: '主治医意見書（写し）',           date: '未提出', ok: false },
            { name: '再アセスメントシート',           date: '2026/4/24', ok: true },
          ].map(row => (
            <div key={row.name}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.ok ? { backgroundColor: BRAND_LIGHT } : {}}>
              <span className="text-sm" style={{ color: TEXT }}>{row.name}</span>
              <span className="text-xs" style={{ color: TEXT_SUB }}>{row.date}</span>
              <span className={cn('text-xs px-2.5 py-1 rounded-full border font-semibold')}
                style={row.ok
                  ? { backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }
                  : { backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>
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

// ── File upload modal ─────────────────────────────────────────────────────
interface UploadModalProps { docName: string; onUpload: (file: File) => void; onClose: () => void }
function UploadModal({ docName, onUpload, onClose }: UploadModalProps) {
  const [file, setFile]         = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone]         = useState(false)

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
          <h3 className="font-semibold text-sm" style={{ color: TEXT }}>{docName}</h3>
          <button onClick={onClose} style={{ color: TEXT_SUB }}><X size={16} /></button>
        </div>
        {!done ? (
          <>
            <label className="block w-full cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? '' : 'hover:border-[#5C8A70]'}`}
                style={{ borderColor: file ? BRAND : BORDER, backgroundColor: file ? BRAND_LIGHT : undefined }}>
                {file
                  ? <><p className="text-sm font-medium" style={{ color: TEXT }}>{file.name}</p><p className="text-xs mt-1" style={{ color: TEXT_SUB }}>{(file.size / 1024).toFixed(0)} KB</p></>
                  : <><FileText size={28} className="mx-auto mb-2" style={{ color: BORDER }} /><p className="text-sm" style={{ color: TEXT_SUB }}>PDF または画像ファイルを選択</p><p className="text-xs mt-1" style={{ color: BORDER }}>クリックして選択、またはドラッグ&amp;ドロップ</p></>
                }
              </div>
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50"
                style={{ borderColor: BORDER, color: TEXT_SUB }}>キャンセル</button>
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
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: BRAND_LIGHT }}>
                <CheckCircle size={24} style={{ color: BRAND }} />
              </div>
              <p className="font-semibold" style={{ color: TEXT }}>アップロード完了</p>
              <p className="text-xs mt-1" style={{ color: TEXT_SUB }}>「受取済」として登録されました</p>
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
  const [uploaded, setUploaded]       = useState<Set<string>>(new Set())
  const [showUraShima, setShowUraShima] = useState(false)

  function openUpload(key: string, name: string) { setUploadModal({ key, name }) }
  function handleUploaded() {
    if (!uploadModal) return
    setUploaded(prev => new Set([...prev, uploadModal.key]))
    setUploadModal(null)
  }
  function isUploaded(key: string) { return uploaded.has(key) }

  const STATUS_MIATSU   = <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>△ 未着</span>
  const STATUS_KIGENKIN = <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>⏰ 期限間近</span>

  return (
    <>
      {uploadModal && <UploadModal docName={uploadModal.name} onUpload={() => handleUploaded()} onClose={() => setUploadModal(null)} />}

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold border" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>△ 未着 3件</span>
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold border" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>⏰ 期限間近 3件</span>
          <span className="text-xs" style={{ color: TEXT_SUB }}>※今・直近のみ表示しています</span>
        </div>

        {/* 通所介護施設ツーショ */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
            <Building2 size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>通所介護施設ツーショ</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>（通所介護）</span>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>△ 未着 1件</span>
            <span className="text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>⏰ 期限間近 3件</span>
          </div>
          <div className="px-5 py-2 border-b" style={{ borderColor: '#F0F4F2' }}>
            <div className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 text-xs font-semibold" style={{ color: TEXT_SUB }}>
              <span>書類名</span><span>サイクル</span><span>期間</span><span>期限</span><span>状態</span><span></span>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
            {[
              { key: 'tsusho-plan-2026h2', name: '通所介護計画書（更新）', cycle: '6ヶ月', period: '2026年7〜12月', deadline: '2026/7/1',  deadlineColor: ALERT_YELLOW, status: STATUS_MIATSU },
              { key: 'kobetsu-2026q2',     name: '個別機能訓練計画書',     cycle: '3ヶ月', period: '2026年4〜6月', deadline: '2026/6/30', deadlineColor: ALERT_YELLOW, status: STATUS_KIGENKIN },
              { key: 'hyoka-tsusho-2026h1',name: '評価（通所介護計画書）', cycle: '—',    period: '2026年1〜6月', deadline: '2026/6/15', deadlineColor: ALERT_YELLOW, status: STATUS_KIGENKIN },
              { key: 'monitoring-2026-05', name: 'モニタリング報告書',     cycle: '毎月',  period: '2026年5月',   deadline: '2026/6/5',  deadlineColor: ALERT_YELLOW, status: STATUS_KIGENKIN },
            ].map(row => (
              <div key={row.key}
                className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 items-center px-5 py-3.5"
                style={isUploaded(row.key) ? { backgroundColor: BRAND_LIGHT } : {}}>
                <span className="text-sm font-medium" style={{ color: TEXT }}>{row.name}</span>
                <span className="text-sm" style={{ color: TEXT_SUB }}>{row.cycle}</span>
                <span className="text-sm" style={{ color: TEXT_SUB }}>{row.period}</span>
                <span className="text-sm font-medium" style={{ color: row.deadlineColor }}>{row.deadline}</span>
                {isUploaded(row.key)
                  ? <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>⊙ 受取済</span>
                  : row.status}
                {isUploaded(row.key) ? <ConfBtn /> : <RegBtn onClick={() => openUpload(row.key, row.name)} />}
              </div>
            ))}
          </div>
        </div>

        {/* 訪問看護ヤットデタ */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
            <Building2 size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>訪問看護ヤットデタ</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>（訪問看護）</span>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>△ 未着 1件</span>
          </div>
          <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
            {[{ key: 'houmon-report-2026-05', name: '訪問看護報告書', cycle: '毎月', period: '2026年5月', deadline: '2026/6/10', deadlineColor: ALERT_RED, status: STATUS_MIATSU }].map(row => (
              <div key={row.key}
                className="grid grid-cols-[1fr_70px_110px_90px_auto_auto] gap-3 items-center px-5 py-3.5"
                style={isUploaded(row.key) ? { backgroundColor: BRAND_LIGHT } : {}}>
                <span className="text-sm font-medium" style={{ color: TEXT }}>{row.name}</span>
                <span className="text-sm" style={{ color: TEXT_SUB }}>{row.cycle}</span>
                <span className="text-sm" style={{ color: TEXT_SUB }}>{row.period}</span>
                <span className="text-sm font-medium" style={{ color: row.deadlineColor }}>{row.deadline}</span>
                {isUploaded(row.key)
                  ? <span className="text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>⊙ 受取済</span>
                  : row.status}
                {isUploaded(row.key) ? <ConfBtn /> : <RegBtn onClick={() => openUpload(row.key, row.name)} />}
              </div>
            ))}
          </div>
        </div>

        {/* 福祉用具ウラシマ */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
            <Building2 size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>福祉用具ウラシマ</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>（福祉用具貸与）</span>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>✓ すべて揃っています</span>
          </div>
          {showUraShima && <div className="px-5 py-3.5 text-sm" style={{ color: TEXT_SUB }}>過去の書類はありません。</div>}
          <div className="px-5 py-3 border-t text-center" style={{ borderColor: '#F0F4F2' }}>
            <button onClick={() => setShowUraShima(!showUraShima)} className="text-xs hover:opacity-70 transition-opacity" style={{ color: TEXT_SUB }}>
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
  const navigate    = useNavigate()
  const [recordSubTab, setRecordSubTab] = useState('monitoring')
  const [visitDates, setVisitDates]     = useState<Record<string, string>>({})
  const [visited, setVisited]           = useState<Record<string, boolean>>({})
  const [hasRecord]                     = useState<Record<string, boolean>>({ '1': true })

  const visitedCount = Object.values(visited).filter(Boolean).length

  return (
    <div>
      <div className="flex gap-1 px-6 pt-4 pb-0 border-b bg-white" style={{ borderColor: BORDER }}>
        {[{ id: 'monitoring', label: 'モニタリング' }, { id: 'schedule', label: 'スケジュール' }].map(t => (
          <button key={t.id} onClick={() => setRecordSubTab(t.id)}
            className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors"
            style={recordSubTab === t.id
              ? { borderBottomColor: BRAND, color: BRAND }
              : { borderColor: 'transparent', color: TEXT_SUB }}
          >{t.label}</button>
        ))}
      </div>

      {recordSubTab === 'monitoring' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: TEXT }}>2026年6月のモニタリング</h3>
              <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>完了/全体：{visitedCount}/5　実施率：{Math.round(visitedCount / 5 * 100)}%　予定：5件</p>
            </div>
            <button className="text-sm px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: BRAND }}>
              今月の一括生成
            </button>
          </div>

          {/* 音声入力ボタン */}
          <div className="flex items-center gap-4 mb-4 p-4 rounded-xl" style={{ backgroundColor: BRAND_LIGHT }}>
            <div>
              <button
                onClick={() => console.log('voice input clicked')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-85 transition-opacity"
                style={{ backgroundColor: BRAND }}
              >
                <Mic size={15} />音声で記録する
              </button>
              <p className="text-xs mt-1.5" style={{ color: TEXT_SUB }}>タップして話しかけてください</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs border-b" style={{ color: TEXT_SUB, borderColor: '#F0F4F2', backgroundColor: '#F7FAF8' }}>
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
                  const recorded  = hasRecord[u.id] ?? false
                  return (
                    <tr key={u.id}
                      className="border-b last:border-0 cursor-pointer transition-colors"
                      style={{
                        borderColor: '#F0F4F2',
                        backgroundColor: isVisited ? BRAND_LIGHT : undefined,
                      }}
                      onClick={() => navigate(`/users/${u.id}?maintab=kiroku`)}>
                      <td className="px-5 py-3 font-semibold" style={{ color: TEXT }}>{u.name}</td>
                      <td className="px-5 py-3" style={{ color: TEXT_SUB }}>2026-06</td>
                      <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                        <input type="date"
                          className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:border-[#5C8A70]"
                          style={{ borderColor: BORDER, color: TEXT }}
                          value={visitDates[u.id] ?? ''}
                          onChange={e => setVisitDates(prev => ({ ...prev, [u.id]: e.target.value }))} />
                      </td>
                      <td className="px-5 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: BRAND }}
                          checked={isVisited}
                          onChange={e => setVisited(prev => ({ ...prev, [u.id]: e.target.checked }))} />
                      </td>
                      <td className="px-5 py-3">
                        {recorded
                          ? <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>入力済</span>
                          : <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border" style={{ backgroundColor: '#F3F6F4', color: TEXT_SUB, borderColor: BORDER }}>未入力</span>
                        }
                      </td>
                      <td className="px-5 py-3" style={{ color: TEXT_SUB }}>{u.manager}</td>
                      <td className="px-5 py-3 text-right"><ChevronRight size={15} style={{ color: BORDER }} /></td>
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
          <div className="bg-white rounded-xl border p-10 text-center" style={{ borderColor: BORDER }}>
            <Clock size={32} className="mx-auto mb-2" style={{ color: BORDER }} />
            <p className="text-sm" style={{ color: TEXT_SUB }}>スケジュールはありません</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 自分の書類タブ ────────────────────────────────────────────────────────
function MyDocumentsTab() {
  return (
    <div className="p-6 space-y-5">
      {/* ケアプラン三点セット */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>ケアプラン三点セット</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>更新ごと</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>△ 未完了 1件</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {[
            { name: '居宅サービス計画書（第1〜2表）', date: '2026/1/5',  ok: true },
            { name: '週間サービス計画表（第3表）',     date: '2026/1/5',  ok: true },
            { name: 'アセスメントシート（課題分析）',  date: '未作成',    ok: false },
          ].map(row => (
            <div key={row.name}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.ok ? { backgroundColor: BRAND_LIGHT } : {}}>
              <span className="text-sm" style={{ color: TEXT }}>{row.name}</span>
              <span className="text-xs" style={{ color: TEXT_SUB }}>{row.date}</span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-semibold"
                style={row.ok
                  ? { backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }
                  : { backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>
                {row.ok ? '⊙ 保存済' : '△ 未作成'}
              </span>
              {row.ok ? <ConfBtn /> : <RegBtn />}
            </div>
          ))}
        </div>
      </div>

      {/* モニタリング報告書 */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>モニタリング報告書</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>毎月</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>↻ 対応中</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {[
            { month: '2026年6月', date: '未作成',   ok: false },
            { month: '2026年5月', date: '2026/6/1', ok: true },
            { month: '2026年4月', date: '2026/5/2', ok: true },
          ].map(row => (
            <div key={row.month}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={row.ok ? { backgroundColor: BRAND_LIGHT } : {}}>
              <span className="text-sm" style={{ color: TEXT }}>{row.month}</span>
              <span className="text-xs" style={{ color: TEXT_SUB }}>{row.date}</span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-semibold"
                style={row.ok
                  ? { backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }
                  : { backgroundColor: '#FFFBF0', color: ALERT_YELLOW, borderColor: '#FCD34D' }}>
                {row.ok ? '⊙ 作成済' : '△ 未作成'}
              </span>
              {row.ok ? <ConfBtn /> : <RegBtn />}
            </div>
          ))}
        </div>
      </div>

      {/* 担当者会議録（音声入力UI付き） */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#F0F4F2' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} style={{ color: BRAND }} />
            <span className="font-semibold text-sm" style={{ color: TEXT }}>担当者会議録</span>
            <span className="text-xs" style={{ color: TEXT_SUB }}>ケアプラン更新ごと</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>✓ 揃っています</span>
        </div>

        {/* 新規作成フォーム */}
        <div className="p-5 border-b" style={{ borderColor: '#F0F4F2', backgroundColor: '#F7FAF8' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: TEXT_SUB }}>新規作成</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: TEXT_SUB }}>会議日</label>
                <input type="date" className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-[#5C8A70]" style={{ borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: TEXT_SUB }}>出席者</label>
                <input type="text" placeholder="例）石橋、田中（通所）、家族" className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-[#5C8A70]" style={{ borderColor: BORDER }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: TEXT_SUB }}>会議内容</label>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => console.log('voice input clicked')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-85 transition-opacity"
                  style={{ backgroundColor: BRAND }}
                >
                  <Mic size={15} />音声で議事録を作成
                </button>
                <span className="text-xs" style={{ color: TEXT_SUB }}>または</span>
              </div>
              <textarea
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-[#5C8A70] resize-none"
                style={{ borderColor: BORDER, height: '120px' }}
                placeholder="テキストで入力..."
              />
            </div>
          </div>
        </div>

        {/* 既存記録 */}
        <div className="divide-y" style={{ borderColor: '#F0F4F2' }}>
          {[
            { period: '2026年1月更新', date: '2026/1/10' },
            { period: '2025年7月更新', date: '2025/7/8' },
          ].map(row => (
            <div key={row.period}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5"
              style={{ backgroundColor: BRAND_LIGHT }}>
              <span className="text-sm" style={{ color: TEXT }}>{row.period}</span>
              <span className="text-xs" style={{ color: TEXT_SUB }}>{row.date}</span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-semibold" style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>⊙ 保存済</span>
              <ConfBtn />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 概要タブ ──────────────────────────────────────────────────────────────
function OverviewTab({ user }: { user: typeof users[0] }) {
  const navigate = useNavigate()
  const carePlan = carePlans.find(cp => cp.userId === user.id)

  return (
    <div className="p-6 space-y-5">
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: BORDER, boxShadow: '0 1px 4px rgba(45,58,51,0.08)' }}>
        <h3 className="font-semibold mb-4" style={{ color: TEXT }}>認定・基本情報</h3>
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-xs mb-0.5" style={{ color: TEXT_SUB }}>要介護度</p>
            <p className="font-semibold" style={{ color: TEXT }}>{user.careLevel}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: TEXT_SUB }}>担当ケアマネ</p>
            <p className="font-semibold" style={{ color: TEXT }}>{user.manager}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: TEXT_SUB }}>認定有効期限</p>
            <CertBadge certEnd={user.certEnd} />
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: TEXT_SUB }}>被保険者番号</p>
            <p className="font-semibold" style={{ color: TEXT }}>{user.hokenNumber}</p>
          </div>
        </div>
        {carePlan && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: BORDER }}>
            <p className="text-xs mb-1" style={{ color: TEXT_SUB }}>ケアプラン期間</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold" style={{ color: TEXT }}>
                短期 {formatCarePlanDate(carePlan.shortTermStart)}〜{formatCarePlanDate(carePlan.shortTermEnd)}
              </span>
              <span style={{ color: BORDER }}>|</span>
              <span className="font-semibold" style={{ color: TEXT }}>
                長期 {formatCarePlanDate(carePlan.longTermStart)}〜{formatCarePlanDate(carePlan.longTermEnd)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6" style={{ borderColor: BORDER, boxShadow: '0 1px 4px rgba(45,58,51,0.08)' }}>
        <h3 className="font-semibold mb-4" style={{ color: TEXT }}>クイックリンク</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '自分の書類',   desc: 'ケアプラン・アセスメント等', path: `?maintab=shorui&tab=jibun` },
            { label: '事業所書類',   desc: '通所・訪問看護等',           path: `?maintab=shorui&tab=jigyosho` },
            { label: '記録',         desc: 'モニタリング・スケジュール', path: `?maintab=kiroku` },
          ].map(link => (
            <button key={link.label}
              onClick={() => navigate(`/users/${user.id}${link.path}`)}
              className="text-left p-4 rounded-xl border hover:opacity-90 transition-all"
              style={{ borderColor: BORDER, backgroundColor: '#F7FAF8' }}>
              <p className="font-semibold text-sm" style={{ color: TEXT }}>{link.label}</p>
              <p className="text-xs mt-1" style={{ color: TEXT_SUB }}>{link.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 書類タブ（サブタブ付き） ──────────────────────────────────────────────
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
        <div className="px-6 py-3 bg-white border-b flex items-center gap-4 text-sm" style={{ borderColor: BORDER }}>
          <span className="font-medium" style={{ color: TEXT_SUB }}>ケアプラン期間：</span>
          <span className="font-semibold" style={{ color: TEXT }}>
            短期 {formatCarePlanDate(carePlan.shortTermStart)}〜{formatCarePlanDate(carePlan.shortTermEnd)}
          </span>
          <span style={{ color: BORDER }}>|</span>
          <span className="font-semibold" style={{ color: TEXT }}>
            長期 {formatCarePlanDate(carePlan.longTermStart)}〜{formatCarePlanDate(carePlan.longTermEnd)}
          </span>
        </div>
      )}

      {/* Sub-tab pill buttons */}
      <div className="flex items-center gap-2 px-6 py-4 bg-white border-b" style={{ borderColor: BORDER }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={subTab === t.id
              ? { backgroundColor: BRAND, color: 'white' }
              : { backgroundColor: 'white', color: TEXT, border: `1px solid ${BORDER}` }}>
            {t.label}
          </button>
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
  const { id }         = useParams<{ id: string }>()
  const navigate       = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showEventModal, setShowEventModal] = useState(false)
  const { addEvent }   = useEvents()

  const user      = users.find(u => u.id === id)
  const activeTab = searchParams.get('maintab') || 'overview'

  if (!user) return (
    <div className="p-8 text-center" style={{ color: TEXT_SUB }}>
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
      <div className="bg-white border-b px-6 pt-5 pb-0" style={{ borderColor: BORDER }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm mb-4 transition-colors hover:opacity-70"
          style={{ color: TEXT_SUB }}
        >
          <ChevronLeft size={14} />ホームに戻る
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: BRAND }}>
              {user.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold" style={{ color: TEXT }}>{user.name}</h1>
                <span className="text-sm" style={{ color: TEXT_SUB }}>（{user.kana}）</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: TEXT_SUB }}>
                担当：{user.manager} ／ 被保険者番号 {user.hokenNumber}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                  style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: '#B8D8C4' }}>
                  {user.careLevel}
                </span>
                <CertBadge certEnd={user.certEnd} />
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border font-semibold hover:bg-gray-50 transition-colors"
            style={{ borderColor: BORDER, color: TEXT_SUB }}
          >
            <Zap size={14} />イベントを記録する
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex gap-0">
          {mainTabs.map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className="px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors"
              style={activeTab === t.id
                ? { borderBottomColor: BRAND, color: BRAND }
                : { borderColor: 'transparent', color: TEXT_SUB }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab user={user} />}
      {activeTab === 'shorui'   && <DocumentsTab user={user} />}
      {activeTab === 'kiroku'   && <RecordsTab />}

      {showEventModal && (
        <EventRecordModal
          userId={String(user.id)} userName={user.name}
          onRecord={addEvent} onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  )
}
