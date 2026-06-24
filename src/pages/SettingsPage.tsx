import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const BRAND_LIGHT = '#EAF3EE'

export function SettingsPage() {
  const items = [
    { to: '/settings/documents',        emoji: '📄', label: '書類マスタ',       desc: '書類の種別・サイクル・評価タイミングを管理します' },
    { to: '/jigyosho',                  emoji: '🏢', label: '事業所管理',       desc: '事業所の登録・提出書類の設定を管理します' },
    { to: '/settings/kasan',            emoji: '💰', label: '加算管理',         desc: '各加算の算定状況・要件・月次チェックを管理します' },
    { to: '/settings/alerts',           emoji: '🔔', label: 'アラート設定',     desc: 'モニタリングや書類期限のアラートタイミングを設定します' },
    { to: '/settings/operations-check', emoji: '🔍', label: '運営指導チェック', desc: '全利用者の三点セット充足状況を確認・運営指導に備えます' },
  ]

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: '#2D3A33' }}>設定</h1>
      <p className="text-sm mb-6" style={{ color: '#6B7C74' }}>システムのマスタデータや事業所情報を管理します</p>
      <div className="space-y-3">
        {items.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-4 bg-white rounded-xl border px-5 py-5 hover:bg-[#EAF3EE] transition-all group"
            style={{
              borderColor: '#DDE5E0',
              boxShadow: '0 1px 4px rgba(45,58,51,0.08)',
              borderRadius: '12px',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: BRAND_LIGHT }}
            >
              {item.emoji}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base" style={{ color: '#2D3A33' }}>{item.label}</p>
              <p className="text-sm mt-0.5" style={{ color: '#6B7C74' }}>{item.desc}</p>
            </div>
            <ChevronRight size={18} style={{ color: '#DDE5E0' }} className="group-hover:text-[#5C8A70] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
