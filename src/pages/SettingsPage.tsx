import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function SettingsPage() {
  const items = [
    { to: '/settings/documents',        emoji: '📄', label: '書類マスタ',     desc: '書類の種別・サイクル・評価タイミングを管理します' },
    { to: '/jigyosho',                  emoji: '🏢', label: '事業所管理',     desc: '事業所の登録・提出書類の設定を管理します' },
    { to: '/settings/kasan',            emoji: '💰', label: '加算管理',       desc: '各加算の算定状況・要件・月次チェックを管理します' },
    { to: '/settings/alerts',           emoji: '🔔', label: 'アラート設定',   desc: 'モニタリングや書類期限のアラートタイミングを設定します' },
    { to: '/settings/operations-check', emoji: '🔍', label: '運営指導チェック', desc: '全利用者の三点セット充足状況を確認・運営指導に備えます' },
  ]

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">設定</h1>
      <p className="text-base text-gray-600 mb-6">システムのマスタデータや事業所情報を管理します</p>
      <div className="space-y-3">
        {items.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-md px-5 py-5 hover:border-purple-300 hover:bg-purple-50/20 transition-all group"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: '#EDE9FE' }}
            >
              {item.emoji}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">{item.label}</p>
              <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
