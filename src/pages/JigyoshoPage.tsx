import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Pencil, X, Plus } from 'lucide-react'
import { jigyoshoList, documentMasters, jigyoshoDocSettings } from '@/data/mockData'
import type { Jigyosho, DocumentMaster } from '@/data/mockData'

const BRAND = '#3C3489'

interface JigyoshoWithDocs extends Jigyosho {
  docMasterIds: string[]
}

const initialJigyosho: JigyoshoWithDocs[] = jigyoshoList.map(j => ({
  ...j,
  docMasterIds: jigyoshoDocSettings[j.id] ?? [],
}))

export function JigyoshoPage() {
  const [list, setList] = useState<JigyoshoWithDocs[]>(initialJigyosho)
  const [editTarget, setEditTarget] = useState<JigyoshoWithDocs | null>(null)

  function openEdit(j: JigyoshoWithDocs) { setEditTarget({ ...j, docMasterIds: [...j.docMasterIds] }) }

  function save() {
    if (!editTarget) return
    setList(prev => prev.map(j => j.id === editTarget.id ? editTarget : j))
    setEditTarget(null)
  }

  function toggleDoc(dmId: string) {
    if (!editTarget) return
    const ids = editTarget.docMasterIds.includes(dmId)
      ? editTarget.docMasterIds.filter(id => id !== dmId)
      : [...editTarget.docMasterIds, dmId]
    setEditTarget({ ...editTarget, docMasterIds: ids })
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Link to="/settings" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
          <ChevronLeft size={15} />設定
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">事業所管理</h1>
          <p className="text-sm text-gray-400 mt-0.5">事業所の情報と提出書類の設定を管理します</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: BRAND }}>
          <Plus size={15} />事業所を追加
        </button>
      </div>

      <div className="space-y-4">
        {list.map(j => {
          const linkedDocs: DocumentMaster[] = documentMasters.filter(dm => j.docMasterIds.includes(dm.id))
          return (
            <div key={j.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{j.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{j.type} ／ {j.contact} ／ {j.email}</p>
                </div>
                <button onClick={() => openEdit(j)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                  <Pencil size={12} />編集
                </button>
              </div>
              <div className="px-5 py-3">
                <p className="text-xs font-semibold text-gray-400 mb-2">提出書類の設定</p>
                {linkedDocs.length === 0
                  ? <p className="text-xs text-gray-300">書類が設定されていません</p>
                  : (
                    <div className="flex flex-wrap gap-2">
                      {linkedDocs.map(dm => (
                        <span key={dm.id} className="text-xs px-2.5 py-1 rounded-full border font-medium bg-purple-50 text-purple-700 border-purple-200">
                          {dm.name}（{dm.cycle}）
                        </span>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditTarget(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">{editTarget.name}</h2>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* Basic info (read-only for now) */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">事業所名</label>
                <input readOnly value={editTarget.name}
                  className="w-full px-3 py-2 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">サービス種別</label>
                <input readOnly value={editTarget.type}
                  className="w-full px-3 py-2 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500" />
              </div>
            </div>

            {/* 提出書類設定 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-3">提出書類の設定</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {documentMasters.map(dm => {
                  const checked = editTarget.docMasterIds.includes(dm.id)
                  return (
                    <label key={dm.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? 'border-purple-200 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleDoc(dm.id)}
                        className="w-4 h-4 rounded accent-purple-700" />
                      <span className="text-sm font-medium text-gray-800">{dm.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{dm.cycle}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50">キャンセル</button>
              <button onClick={save}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: BRAND }}>保存する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
