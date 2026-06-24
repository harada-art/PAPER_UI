import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type EventType = 'nyuin' | 'taiin' | 'kyuhen' | 'tsuin' | 'tanto' | 'other'
export type EventStatus = 'pending' | 'inprogress' | 'done'

export interface RecordedEvent {
  id: string
  userId: string
  userName: string
  type: EventType
  date: string
  place?: string
  memo?: string
  status: EventStatus
  createdAt: string
}

export interface KasanTask {
  id: string
  eventId: string
  eventType: EventType
  eventDate: string
  userId: string
  userName: string
  kasanName: string
  priority: 'urgent' | 'thismonth'
  deadlineDays?: number
  createdAt: string
  status: 'pending' | 'done'
  doneAt?: string
  doneContent?: string
}

export interface KasanRecord {
  id: string
  userId: string
  userName: string
  eventType: EventType
  eventDate: string
  kasanName: string
  doneAt: string
  doneContent: string
}

export const EVENT_TYPE_META: Record<EventType, { emoji: string; label: string }> = {
  nyuin:  { emoji: '🏥', label: '入院' },
  taiin:  { emoji: '🏠', label: '退院' },
  kyuhen: { emoji: '🚨', label: '急変' },
  tsuin:  { emoji: '🚗', label: '通院同行' },
  tanto:  { emoji: '📋', label: '担当者変更' },
  other:  { emoji: '📝', label: 'その他' },
}

interface EventContextValue {
  events: RecordedEvent[]
  kasanTasks: KasanTask[]
  kasanRecords: KasanRecord[]
  addEvent: (data: Omit<RecordedEvent, 'id' | 'createdAt' | 'status'>) => void
  resolveKasanTask: (taskId: string, doneAt: string, doneContent: string) => void
}

const EventContext = createContext<EventContextValue | null>(null)

function makeKasanTasks(event: RecordedEvent): KasanTask[] {
  const base = {
    eventId: event.id,
    eventType: event.type,
    eventDate: event.date,
    userId: event.userId,
    userName: event.userName,
    createdAt: event.createdAt,
    status: 'pending' as const,
  }
  const ts = Date.now()
  switch (event.type) {
    case 'nyuin':  return [{ id: `kt_${ts}`, ...base, kasanName: '入院時情報提供加算',             priority: 'urgent',    deadlineDays: 3 }]
    case 'taiin':  return [{ id: `kt_${ts}`, ...base, kasanName: '退院・退所加算',                  priority: 'urgent' }]
    case 'kyuhen': return [{ id: `kt_${ts}`, ...base, kasanName: '緊急時等居宅カンファレンス加算', priority: 'urgent',    deadlineDays: 2 }]
    case 'tsuin':  return [{ id: `kt_${ts}`, ...base, kasanName: '通院時情報連携加算',              priority: 'thismonth' }]
    default: return []
  }
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<RecordedEvent[]>([])
  const [kasanTasks, setKasanTasks] = useState<KasanTask[]>([])
  const [kasanRecords, setKasanRecords] = useState<KasanRecord[]>([])

  function addEvent(data: Omit<RecordedEvent, 'id' | 'createdAt' | 'status'>) {
    const id = `evt_${Date.now()}`
    const createdAt = new Date().toISOString()
    const event: RecordedEvent = { ...data, id, createdAt, status: 'pending' }
    setEvents(prev => [event, ...prev])
    const newTasks = makeKasanTasks(event)
    if (newTasks.length) setKasanTasks(prev => [...newTasks, ...prev])
  }

  function resolveKasanTask(taskId: string, doneAt: string, doneContent: string) {
    const task = kasanTasks.find(t => t.id === taskId)
    if (!task) return
    setKasanTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done', doneAt, doneContent } : t))
    setEvents(prev => prev.map(e => e.id === task.eventId ? { ...e, status: 'done' } : e))
    setKasanRecords(prev => [{
      id: `kr_${Date.now()}`,
      userId: task.userId,
      userName: task.userName,
      eventType: task.eventType,
      eventDate: task.eventDate,
      kasanName: task.kasanName,
      doneAt,
      doneContent,
    }, ...prev])
  }

  return (
    <EventContext.Provider value={{ events, kasanTasks, kasanRecords, addEvent, resolveKasanTask }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvents must be used within EventProvider')
  return ctx
}
