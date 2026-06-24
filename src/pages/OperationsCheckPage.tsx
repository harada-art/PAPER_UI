import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { users, threeSetData } from '@/data/mockData'

const LIGHT_GREEN = '#EAF3DE'

type DocState = 'saved' | 'software' | 'pending'

function DocCell({ status, isNA }: { status: DocState | 'saved' | 'pending'; isNA?: boolean }) {
  if (isNA) return <span className="text-sm text-gray-400">—</span>
  if (status === 'saved')    return <span className="text-sm font-bold text-green-700">✅ 保存済</span>
  if (status === 'software') return <span className="text-sm font-bold text-green-700">✅ ソフト管理</span>
  return <span className="text-sm font-bold text-red-500">❌ 未</span>
}

export function OperationsCheckPage() {
  const navigate = useNavigate()

  const careplanSavedCount = Object.values(threeSetData).filter(s => s.careplan === 'saved').length

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={15} />設定に戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">🔍 運営指導チェック</h1>
        <p className="text-sm text-gray-500 mt-1">全利用者のケアプラン更新書類の充足状況を確認します</p>
      </div>

      {/* 説明文 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 mb-6">
        <p className="text-base text-amber-900 leading-relaxed font-medium mb-2">
          ⚠️ 運営指導で確認されるポイント
        </p>
        <p className="text-sm text-amber-800 leading-relaxed">
          運営指導では利用者ごとのケアプラン更新において以下の書類が作成されているかチェックされます。
          基本情報／アセスメントシートと担当者会議録は作成ソフトでの管理でも問題ありません。
          <strong>ケアプラン（サイン済み）は必ずPAPERに保存してください。</strong>
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">全利用者数</p>
          <p className="text-3xl font-black text-gray-900">{users.length}<span className="text-base font-semibold text-gray-500 ml-1">名</span></p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">ケアプラン保存済み</p>
          <p className="text-3xl font-black text-green-700">{careplanSavedCount}<span className="text-base font-semibold text-gray-500 ml-1">名</span></p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">ケアプラン保存率</p>
          <p className="text-3xl font-black text-amber-700">
            {Math.round(careplanSavedCount / users.length * 100)}<span className="text-base font-semibold text-gray-500 ml-1">%</span>
          </p>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">利用者別 書類充足状況</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3.5 font-bold">利用者名</th>
              <th className="text-center px-4 py-3.5 font-bold">基本情報/AS</th>
              <th className="text-center px-4 py-3.5 font-bold">会議録</th>
              <th className="text-center px-4 py-3.5 font-bold">ケアプラン<br /><span className="text-xs font-normal text-red-600">★必ずPAPER保存</span></th>
              <th className="text-center px-4 py-3.5 font-bold">状態</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const s = threeSetData[u.id]
              const isYoshien = u.careLevel.startsWith('要支援')
              const kihonDone = s.kihon === 'saved' || s.kihon === 'software'
              const kaigiDone = s.kaigi === 'saved' || s.kaigi === 'software'
              const careplanDone = s.careplan === 'saved'
              const allDone = kihonDone && kaigiDone && (isYoshien || careplanDone)

              let rowBg = 'white'
              let statusBadge: React.ReactNode
              if (allDone) {
                rowBg = LIGHT_GREEN
                statusBadge = (
                  <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-300 font-bold whitespace-nowrap">✅ 完了</span>
                )
              } else if (!isYoshien && careplanDone) {
                statusBadge = (
                  <span className="text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-700 border-2 border-orange-200 font-bold whitespace-nowrap">△ 要確認</span>
                )
              } else if (!isYoshien && !careplanDone) {
                rowBg = '#FFF5F5'
                statusBadge = (
                  <span className="text-sm px-3 py-1 rounded-full bg-red-50 text-red-700 border-2 border-red-200 font-bold whitespace-nowrap">🔴 未着手</span>
                )
              } else {
                statusBadge = (
                  <span className="text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-700 border-2 border-orange-200 font-bold whitespace-nowrap">△ 未完了</span>
                )
              }

              return (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 last:border-0 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: rowBg }}
                  onClick={() => navigate(`/users/${u.id}?maintab=shorui&tab=jibun`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-base">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.careLevel}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <DocCell status={s.kihon as DocState} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <DocCell status={s.kaigi as DocState} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <DocCell status={s.careplan} isNA={isYoshien} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    {statusBadge}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 凡例 */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4">
        <p className="text-sm font-bold text-gray-700 mb-2">凡例</p>
        <div className="space-y-1.5">
          <p className="text-sm text-gray-600"><span className="font-bold text-green-700">✅ 保存済</span>：PAPERにファイル保存済み</p>
          <p className="text-sm text-gray-600"><span className="font-bold text-green-700">✅ ソフト管理</span>：作成ソフトで管理中（基本情報/AS・会議録のみ可）</p>
          <p className="text-sm text-gray-600"><span className="font-bold text-red-500">❌ 未</span>：未対応</p>
        </div>
      </div>
    </div>
  )
}
