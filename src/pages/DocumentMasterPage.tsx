import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ChevronLeft, X } from 'lucide-react'
import { documentMasters as initialData, type DocumentMaster, type DocumentType, type DocumentCycle } from '@/data/mockData'

const BRAND = '#3C3489'

const typeColors: Record<DocumentType, string> = {
  '計画書': 'bg-purple-50 text-purple-700 border-purple-200',
  '評価':   'bg-blue-50 text-blue-700 border-blue-200',
  '報告書': 'bg-green-50 text-green-700 border-green-200',
}

const cycles: DocumentCycle[] = ['毎月', '3ヶ月', '6ヶ月', '1年']
const types: DocumentType[] = ['計画書', '評価', '報告書']

const empty: Omit<DocumentMaster, 'id'> = {
  name: '', type: '計画書', cycle: '毎月', evaluationWeeksBefore: 2, notes: '',
}

export function DocumentMasterPage() {
  const [docs, setDocs] = useState<DocumentMaster[]>(initialData)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; data: Omit<DocumentMaster, 'id'>; id?: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function openAdd() { setModal({ mode: 'add', data: { ...empty } }) }
  function openEdit(doc: DocumentMaster) { setModal({ mode: 'edit', data: { name: doc.name, type: doc.type, cycle: doc.cycle, evaluationWeeksBefore: doc.evaluationWeeksBefore, notes: doc.notes }, id: doc.id }) }

  function save() {
    if (!modal) return
    if (!modal.data.name.trim()) return
    if (modal.mode === 'add') {
      setDocs(prev => [...prev, { ...modal.data, id: 'dm' + Date.now() }])
    } else {
      setDocs(prev => prev.map(d => d.id === modal.id ? { ...d, ...modal.data } : d))
    }
    setModal(null)
  }

  function remove(id: string) { setDocs(prev => prev.filter(d => d.id !== id)); setDeleteConfirm(null) }

  function updateField<K extends keyof Omit<DocumentMaster, 'id'>>(k: K, v: Omit<DocumentMaster, 'id'>[K]) {
    setModal(prev => prev ? { ...prev, data: { ...prev.data, [k]: v } } : null)
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Link to="/settings" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
          <ChevronLeft size={15} />設定
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">書類マスタ</h1>
          <p className="text-sm text-gray-400 mt-0.5">書類の種別・サイクル・評価タイミングを管理します</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: BRAND }}>
          <Plus size={15} />書類を追加
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold">書類名</th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold">種別</th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold">サイクル</th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold">評価タイミング</th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold">備考</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900">{doc.name}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${typeColors[doc.type]}`}>{doc.type}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{doc.cycle}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {doc.type === '計画書' && doc.evaluationWeeksBefore ? `期限の${doc.evaluationWeeksBefore}週間前` : '—'}
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{doc.notes || '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">{modal.mode === 'add' ? '書類を追加' : '書類を編集'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">書類名 *</label>
                <input type="text" value={modal.data.name} onChange={e => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="例：通所介護計画書" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">書類種別 *</label>
                  <select value={modal.data.type} onChange={e => updateField('type', e.target.value as DocumentType)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">サイクル *</label>
                  <select value={modal.data.cycle} onChange={e => updateField('cycle', e.target.value as DocumentCycle)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                    {cycles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {modal.data.type === '計画書' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">評価ボックス作成タイミング（週前）</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={12} value={modal.data.evaluationWeeksBefore ?? 2}
                      onChange={e => updateField('evaluationWeeksBefore', Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                    <span className="text-sm text-gray-500">週前に自動生成</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">備考（任意）</label>
                <textarea value={modal.data.notes ?? ''} onChange={e => updateField('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                  placeholder="メモ" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50">キャンセル</button>
              <button onClick={save}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: BRAND }}>保存する</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-gray-900 mb-2">書類を削除しますか？</h2>
            <p className="text-sm text-gray-500 mb-5">この操作は元に戻せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold">キャンセル</button>
              <button onClick={() => remove(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
