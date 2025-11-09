// src/context/ChatContext.jsx
import React, {
  createContext, useContext, useMemo, useState, useEffect, useCallback
} from 'react'
import { store } from '../utils/storage'
import { useAuth } from './AuthContext'

const KEY = 'lf_threads_v1'
const ChatContext = createContext(null)

function canonicalParticipants(a, b){
  const [x, y] = [String(a||'').toLowerCase(), String(b||'').toLowerCase()]
  return x < y ? [x, y] : [y, x]
}

export function ChatProvider({ children }){
  const [threads, setThreads] = useState(()=> store.get(KEY, []))
  const { user } = useAuth()

  useEffect(()=>{ store.set(KEY, threads) }, [threads])

  const save = useCallback((next) => setThreads(next), [])

  const getThreadsFor = useCallback((email) => {
    const me = String(email||'').toLowerCase()
    return [...threads]
      .filter(t => t.participants.includes(me))
      .sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0))
  }, [threads])

  const getThreadById = useCallback((id) => {
    return threads.find(t => t.id === id)
  }, [threads])

  const unreadTotal = useCallback((email) => {
    const me = String(email||'').toLowerCase()
    return getThreadsFor(me).reduce((sum, t) => {
      const lastRead = t.lastRead?.[me] || 0
      const inc = t.messages.filter(m => m.sender !== me && m.ts > lastRead).length
      return sum + inc
    }, 0)
  }, [getThreadsFor])

  const getOrCreateThread = useCallback(({ otherEmail, otherName, item }) => {
    const me = String(user?.email||'').toLowerCase()
    const other = String(otherEmail||'').toLowerCase()
    const [a,b] = canonicalParticipants(me, other)
    const existing = threads.find(t =>
      t.participants[0]===a && t.participants[1]===b && t.item?.id === item.id
    )
    if (existing) return existing

    const thread = {
      id: crypto.randomUUID(),
      participants: [a, b],
      item: {
        id: item.id,
        type: item.type || (item.private ? 'found' : 'lost'),
        title: item.title || item.type || 'Item',
        ownerName: item.ownerName || 'User',
      },
      customTitle: '',     // user-editable name
      messages: [],
      lastRead: { [me]: Date.now() },
      updatedAt: Date.now(),
      otherName: otherName || otherEmail
    }
    const next = [thread, ...threads]
    save(next)
    return thread
  }, [threads, user, save])

  const sendMessage = useCallback((threadId, text) => {
    const me = String(user?.email||'').toLowerCase()
    if (!me) return
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t
      const msg = { id: crypto.randomUUID(), sender: me, text: text.trim(), ts: Date.now() }
      return {
        ...t,
        messages: [...t.messages, msg],
        lastRead: { ...t.lastRead, [me]: Date.now() },
        updatedAt: Date.now()
      }
    }))
  }, [user])

  const markRead = useCallback((threadId) => {
    const me = String(user?.email||'').toLowerCase()
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t
      const already = t.lastRead?.[me] || 0
      const now = Date.now()
      if (now <= already) return t
      return { ...t, lastRead: { ...t.lastRead, [me]: now } }
    }))
  }, [user])

  const renameThread = useCallback((threadId, title) => {
    const trimmed = (title || '').trim()
    setThreads(prev => prev.map(t => (
      t.id === threadId ? { ...t, customTitle: trimmed } : t
    )))
  }, [])

  // --- NEW: system message helper
  const sendSystem = useCallback((threadId, text) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t
      const msg = { id: crypto.randomUUID(), sender: '_system', text: text.trim(), ts: Date.now() }
      return { ...t, messages: [...t.messages, msg], updatedAt: Date.now() }
    }))
  }, [])

  // --- NEW: notify both parties of a potential match & return the thread
  const notifyPotentialMatch = useCallback(({ lost, found, distanceM }) => {
    const a = String(lost?.ownerId||'').toLowerCase()
    const b = String(found?.ownerId||'').toLowerCase()
    if (!a || !b) return null

    // Reuse a thread keyed by LOST item id + participants, or create one
    const existing = threads.find(t =>
      t.item?.id === lost.id &&
      t.participants.includes(a) &&
      t.participants.includes(b)
    )

    const baseItem = {
      id: lost.id,
      type: 'lost',
      title: lost.type || 'Item',
      ownerName: lost.ownerName || 'User',
    }

    let thread
    if (existing) {
      thread = existing
    } else {
      const [p1, p2] = canonicalParticipants(a, b)
      thread = {
        id: crypto.randomUUID(),
        participants: [p1, p2],
        item: baseItem,
        customTitle: baseItem.title,
        messages: [],
        lastRead: {},
        updatedAt: Date.now(),
        otherName: found.ownerName || found.ownerId
      }
      setThreads(prev => [thread, ...prev])
    }

    const note = `Potential match nearby (~${distanceM} m): “${lost.type || 'item'}”. You can chat to verify ownership details.`
    setThreads(prev => prev.map(t => {
      if (t.id !== thread.id) return t
      const msg = { id: crypto.randomUUID(), sender: '_system', text: note, ts: Date.now() }
      return { ...t, messages: [...t.messages, msg], updatedAt: Date.now() }
    }))

    return thread
  }, [threads])

  const value = useMemo(()=>({
    threads,
    getThreadsFor,
    getThreadById,
    getOrCreateThread,
    sendMessage,
    markRead,
    unreadTotal,
    renameThread,
    // new
    sendSystem,
    notifyPotentialMatch,
  }), [threads, getThreadsFor, getThreadById, getOrCreateThread, sendMessage, markRead, unreadTotal, renameThread, sendSystem, notifyPotentialMatch])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
