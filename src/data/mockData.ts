export type UserStatus = 'expired' | 'warning' | 'active' | 'inprogress'
export type TaskPriority = 'urgent' | 'thisweek' | 'thismonth' | 'inprogress'

export interface User {
  id: string
  name: string
  kana: string
  hokenNumber: string
  careLevel: string
  certStart: string
  certEnd: string
  status: UserStatus
  manager: string
  services: string[]
}

export interface Task {
  id: string
  priority: TaskPriority
  userId: string
  userName: string
  title: string
  detail: string
  action: string
  link: string
}

export interface Jigyosho {
  id: string
  name: string
  type: string
  contact: string
  email: string
}

export const users: User[] = [
  { id: "1", name: "石橋 孝明", kana: "イシバシ タカアキ", hokenNumber: "1111111111", careLevel: "要介護4", certStart: "2023-02-01", certEnd: "2026-01-31", status: "expired", manager: "石橋 圭介", services: ["通所介護施設ツーショ", "訪問看護ヤットデタ", "福祉用具ウラシマ"] },
  { id: "2", name: "木梨 憲武", kana: "キナシ ノリタケ", hokenNumber: "2222222222", careLevel: "要介護2", certStart: "2024-01-01", certEnd: "2026-04-30", status: "expired", manager: "石橋 圭介", services: ["通所介護施設ツーショ", "福祉用具ウラシマ"] },
  { id: "3", name: "濱田 正敏", kana: "ハマダ マサトシ", hokenNumber: "3333333333", careLevel: "要介護3", certStart: "2023-01-01", certEnd: "2026-05-31", status: "warning", manager: "石橋 圭介", services: ["通所介護施設ツーショ"] },
  { id: "4", name: "原田 和将", kana: "ハラダ カズマサ", hokenNumber: "4444444444", careLevel: "要介護1", certStart: "2023-01-01", certEnd: "2027-01-01", status: "inprogress", manager: "石橋 圭介", services: ["通所介護施設ツーショ", "訪問看護ヤットデタ", "福祉用具ウラシマ"] },
  { id: "5", name: "上田 洋一", kana: "ウエダ ヨウイチ", hokenNumber: "5555555555", careLevel: "要支援1", certStart: "2026-04-01", certEnd: "2027-03-31", status: "active", manager: "石橋 圭介", services: ["通所介護施設ツーショ"] },
]

export const tasks: Task[] = [
  { id: "1", priority: "urgent", userId: "1", userName: "石橋さん", title: "認定更新手続き", detail: "128日超過", action: "利用者詳細へ", link: "/users/1" },
  { id: "2", priority: "urgent", userId: "2", userName: "木梨さん", title: "認定更新手続き", detail: "39日超過", action: "利用者詳細へ", link: "/users/2" },
  { id: "3", priority: "thisweek", userId: "3", userName: "濱田さん", title: "認定更新申請書類の提出確認", detail: "提出期限まで残り5日", action: "スケジュール登録へ", link: "/users/3/kiroku?tab=schedule" },
  { id: "4", priority: "thismonth", userId: "5", userName: "上田さん", title: "通所介護計画書の期限切れ", detail: "今月末までに対応", action: "プロセス登録へ", link: "/users/5/shorui?tab=jibun" },
  { id: "5", priority: "thismonth", userId: "4", userName: "山田さん", title: "ケアプラン短期期間もうすぐ終了", detail: "担当者会議の日程調整が必要", action: "日程調整・メール送信へ", link: "/schedule/meeting" },
  { id: "6", priority: "inprogress", userId: "4", userName: "原田さん", title: "インテーク", detail: "書類 2/3", action: "利用者詳細へ", link: "/users/4" },
  { id: "7", priority: "thismonth", userId: "1", userName: "石橋さん", title: "個別機能訓練計画書の期間ずれ", detail: "ケアプラン期間と書類期間を確認してください", action: "確認へ", link: "/users/1?maintab=shorui&tab=all" },
]

export const jigyoshoList: Jigyosho[] = [
  { id: "1", name: "通所介護施設ツーショ", type: "通所介護", contact: "08032099060", email: "harada@smart-ml.com" },
  { id: "2", name: "訪問看護ヤットデタ", type: "訪問看護", contact: "08032099060", email: "harada@smart-ml.com" },
  { id: "3", name: "福祉用具ウラシマ", type: "福祉用具貸与", contact: "09045151085", email: "ura@gmail.com" },
]

export type DocumentType = '計画書' | '評価' | '報告書'
export type DocumentCycle = '毎月' | '3ヶ月' | '6ヶ月' | '1年'

export interface DocumentMaster {
  id: string
  name: string
  type: DocumentType
  cycle: DocumentCycle
  evaluationWeeksBefore?: number  // only for 計画書
  notes?: string
}

export const documentMasters: DocumentMaster[] = [
  { id: 'dm1', name: '通所介護計画書',       type: '計画書', cycle: '6ヶ月', evaluationWeeksBefore: 2 },
  { id: 'dm2', name: '個別機能訓練計画書',   type: '計画書', cycle: '3ヶ月', evaluationWeeksBefore: 2 },
  { id: 'dm3', name: 'モニタリング報告書',   type: '報告書', cycle: '毎月' },
  { id: 'dm4', name: '訪問看護計画書',       type: '計画書', cycle: '3ヶ月', evaluationWeeksBefore: 2 },
  { id: 'dm5', name: '訪問看護報告書',       type: '報告書', cycle: '毎月' },
  { id: 'dm6', name: '福祉用具サービス計画書', type: '計画書', cycle: '6ヶ月', evaluationWeeksBefore: 2 },
]

// Which document masters each jigyosho uses
export const jigyoshoDocSettings: Record<string, string[]> = {
  '1': ['dm1', 'dm2', 'dm3'],  // ツーショ: 通所介護計画書, 個別機能訓練, モニタリング
  '2': ['dm4', 'dm5'],          // ヤットデタ: 訪問看護計画書, 訪問看護報告書
  '3': ['dm6'],                 // ウラシマ: 福祉用具サービス計画書
}

export interface CarePlan {
  userId: string
  shortTermStart: string
  shortTermEnd: string
  longTermStart: string
  longTermEnd: string
}

export type ConsistencyStatus = 'consistent' | 'inconsistent' | 'missing'

export interface ConsistencyCheck {
  userId: string
  jigyoshoId: string
  documentName: string
  carePlanPeriod: string
  documentPeriod: string
  status: ConsistencyStatus
}

export const carePlans: CarePlan[] = [
  {
    userId: "1",
    shortTermStart: "2026-01-01",
    shortTermEnd: "2026-06-30",
    longTermStart: "2026-01-01",
    longTermEnd: "2027-01-01"
  }
]

// ── 三点セット ──────────────────────────────────────────────────────────────
export interface ThreeSetStatus {
  kihon: 'saved' | 'software' | 'pending'   // 基本情報/アセスメントシート
  kaigi: 'saved' | 'software' | 'pending'   // 担当者会議録
  careplan: 'saved' | 'pending'              // ケアプラン(サイン済み) - 要介護のみ
}

export const threeSetData: Record<string, ThreeSetStatus> = {
  '1': { kihon: 'software', kaigi: 'pending', careplan: 'saved'   },
  '2': { kihon: 'saved',    kaigi: 'saved',   careplan: 'saved'   },
  '3': { kihon: 'pending',  kaigi: 'pending', careplan: 'pending' },
  '4': { kihon: 'saved',    kaigi: 'saved',   careplan: 'saved'   },
  '5': { kihon: 'saved',    kaigi: 'saved',   careplan: 'saved'   },
}

function isDocDone(s: 'saved' | 'software' | 'pending'): boolean {
  return s === 'saved' || s === 'software'
}

export function isThreeSetComplete(userId: string): boolean {
  const s = threeSetData[userId]
  const u = users.find(u => u.id === userId)
  if (!s || !u) return false
  const isYoshien = u.careLevel.startsWith('要支援')
  if (isYoshien) return isDocDone(s.kihon) && isDocDone(s.kaigi)
  return isDocDone(s.kihon) && isDocDone(s.kaigi) && s.careplan === 'saved'
}

export function getThreeSetMissingDocs(userId: string): string[] {
  const s = threeSetData[userId]
  const u = users.find(u => u.id === userId)
  if (!s || !u) return ['基本情報/アセスメントシート', '担当者会議録', 'ケアプラン（サイン済み）']
  const isYoshien = u.careLevel.startsWith('要支援')
  const missing: string[] = []
  if (!isDocDone(s.kihon)) missing.push('基本情報/アセスメントシート')
  if (!isDocDone(s.kaigi)) missing.push('担当者会議録')
  if (!isYoshien && s.careplan !== 'saved') missing.push('ケアプラン（サイン済み）')
  return missing
}

export const consistencyChecks: ConsistencyCheck[] = [
  {
    userId: "1",
    jigyoshoId: "1",
    documentName: "通所介護計画書",
    carePlanPeriod: "2026年1月〜6月",
    documentPeriod: "2026年1月〜6月",
    status: "consistent"
  },
  {
    userId: "1",
    jigyoshoId: "1",
    documentName: "個別機能訓練計画書",
    carePlanPeriod: "2026年1月〜6月",
    documentPeriod: "2026年4月〜6月",
    status: "inconsistent"
  }
]
