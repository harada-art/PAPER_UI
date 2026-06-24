import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'

const BRAND = '#3C3489'

export function AlertSettingsPage() {
  const navigate = useNavigate()
  const [monitoringDays, setMonitoringDays] = useState(5)
  const [certMonths1, setCertMonths1] = useState(3)
  const [certMonths2, setCertMonths2] = useState(1)
  const [docDays, setDocDays] = useState(7)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function clamp(val: number, min: number, max: number) {
    return Math.min(max, Math.max(min, val))
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={15} />設定に戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">アラート設定</h1>
        <p className="text-sm text-gray-400 mt-1">各アラートの通知タイミングを設定します</p>
      </div>

      <div className="space-y-4">
        {/* モニタリングアラート */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">モニタリングアラート</h2>
          <p className="text-xs text-gray-400 mb-4">月次モニタリング訪問の通知タイミングを設定します</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600">月末</span>
            <input
              type="number"
              min={1}
              max={15}
              className="w-16 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:border-purple-300"
              value={monitoringDays}
              onChange={e => setMonitoringDays(clamp(Number(e.target.value), 1, 15))}
            />
            <span className="text-sm text-gray-600">日前にアラート通知　（1〜15日で設定可能）</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              ⚠️ 訪問し忘れにより特定事業所加算が取り消しになるリスクがあります。<br />
              月末{monitoringDays}日前を過ぎても未訪問の利用者がいる場合、ホーム画面にアラートが表示されます。<br />
              月末5日前からのアラート設定を推奨します。
            </p>
          </div>
        </div>

        {/* 認定期限アラート */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">認定期限アラート</h2>
          <p className="text-xs text-gray-400 mb-4">介護認定有効期限の更新通知タイミングを設定します</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32">通知タイミング 1</span>
              <input
                type="number"
                min={1}
                max={12}
                className="w-16 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:border-purple-300"
                value={certMonths1}
                onChange={e => setCertMonths1(clamp(Number(e.target.value), 1, 12))}
              />
              <span className="text-sm text-gray-600">ヶ月前</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32">通知タイミング 2</span>
              <input
                type="number"
                min={1}
                max={12}
                className="w-16 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:border-purple-300"
                value={certMonths2}
                onChange={e => setCertMonths2(clamp(Number(e.target.value), 1, 12))}
              />
              <span className="text-sm text-gray-600">ヶ月前</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            認定有効期限の {certMonths1} ヶ月前と {certMonths2} ヶ月前にアラートを表示します。
          </p>
        </div>

        {/* 書類期限アラート */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">書類期限アラート</h2>
          <p className="text-xs text-gray-400 mb-4">書類の提出・受取期限の通知タイミングを設定します</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-gray-600">期限</span>
            <input
              type="number"
              min={1}
              max={30}
              className="w-16 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:border-purple-300"
              value={docDays}
              onChange={e => setDocDays(clamp(Number(e.target.value), 1, 30))}
            />
            <span className="text-sm text-gray-600">日前にアラート通知</span>
          </div>
          <p className="text-xs text-gray-400">
            書類の提出・受取期限の {docDays} 日前にアラートを表示します。
          </p>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 rounded-xl text-white text-base font-bold transition-all hover:opacity-85"
            style={{ backgroundColor: saved ? '#16A34A' : BRAND, minHeight: '52px' }}
          >
            {saved && <CheckCircle size={18} />}
            {saved ? '保存しました' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
