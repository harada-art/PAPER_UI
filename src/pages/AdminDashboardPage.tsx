import { AlertTriangle, Users, CheckCircle, TrendingDown, ClipboardList, FileCheck } from 'lucide-react'

export function AdminDashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-1">事業所全体の運営状況とケアマネジャーごとのパフォーマンスを確認します</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '全利用者数', value: '5名', icon: Users, color: 'text-gray-600', borderColor: '' },
          { label: '全体モニタリング実施率', value: '0%', icon: TrendingDown, color: 'text-red-600', borderColor: 'border-red-200' },
          { label: '全体コンプライアンス率', value: '100%', icon: CheckCircle, color: 'text-green-600', borderColor: 'border-green-200' },
          { label: '期限超過（全体）', value: '2件', icon: AlertTriangle, color: 'text-red-600', borderColor: 'border-red-200' },
          { label: '三点セット充足率（全体）', value: '60%', icon: ClipboardList, color: 'text-amber-600', borderColor: 'border-amber-200' },
          { label: 'ケアプラン保存率', value: '4/5名', icon: FileCheck, color: 'text-purple-700', borderColor: 'border-purple-200',
            desc: 'サイン済みケアプランの保存状況です' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl p-4 border shadow-sm ${card.borderColor || 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={18} className={card.color} />
              <span className="text-xs text-gray-500">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color || 'text-gray-900'}`}>{card.value}</p>
            {'desc' in card && <p className="text-xs text-gray-400 mt-1">{card.desc}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Performance table */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">ケアマネジャー別実績</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">ケアマネジャー</th>
                <th className="text-left px-5 py-3 font-medium">担当利用者数</th>
                <th className="text-left px-5 py-3 font-medium">モニタリング実施率</th>
                <th className="text-left px-5 py-3 font-medium">期限超過</th>
                <th className="text-left px-5 py-3 font-medium">三点セット充足率</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-4 font-medium text-gray-900">石橋 圭介</td>
                <td className="px-5 py-4 text-gray-700">5名</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }} />
                    </div>
                    <span className="text-xs text-gray-500">0%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">2件</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-amber-700">3/5（60%）</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Alert panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">アラートパネル</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { level: '緊急', days: '8日前', color: 'border-l-red-500 bg-red-50', badge: 'bg-red-100 text-red-700', text: '原田 和将さんのモニタリングが月末時点で未実施です。運営基準減算のリスクがあります。' },
              { level: '緊急', days: '13日前', color: 'border-l-red-500 bg-red-50', badge: 'bg-red-100 text-red-700', text: '木梨 憲武さんの認定期限切れが未対応です。' },
              { level: '高', days: '20日前', color: 'border-l-yellow-400 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', text: '濱田 正敏さんの認定更新申請期限が近づいています。' },
            ].map((alert, i) => (
              <div key={i} className={`border-l-4 rounded-r-lg p-3 ${alert.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${alert.badge}`}>{alert.level}</span>
                  <span className="text-xs text-gray-400">{alert.days}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{alert.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
