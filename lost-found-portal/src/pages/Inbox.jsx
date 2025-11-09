// src/pages/Inbox.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { Edit2, Check, X } from 'lucide-react' // npm i lucide-react

export default function Inbox(){
  const { user } = useAuth()
  const { getThreadsFor, getThreadById, sendMessage, markRead, renameThread } = useChat()
  const [params] = useSearchParams()
  const nav = useNavigate()

  const myThreads = useMemo(()=> getThreadsFor(user?.email), [user, getThreadsFor])

  // Prefer ?t=... else fallback to first
  const paramId = params.get('t')
  const [fallbackId, setFallbackId] = useState(null)
  useEffect(() => {
    if (!paramId && myThreads.length > 0) setFallbackId(prev => prev || myThreads[0].id)
  }, [paramId, myThreads])

  const activeId = paramId || fallbackId
  const active = activeId ? getThreadById(activeId) : null

  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const endRef = useRef(null)
  const me = String(user?.email||'').toLowerCase()

  useEffect(()=>{ if (active?.id) markRead(active.id) }, [active?.id])
  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [active?.messages?.length])

  const onSend = e => {
    e.preventDefault()
    if (!active?.id || !text.trim()) return
    sendMessage(active.id, text)
    setText('')
  }

  // inline rename
  const startEdit = (t, e) => { e.stopPropagation(); setEditingId(t.id); setEditValue(t.customTitle || t.item?.title || 'Item') }
  const saveEdit  = (t, e) => { e.stopPropagation(); renameThread(t.id, (editValue||'').trim()); setEditingId(null) }
  const cancelEdit= (e) => { e.stopPropagation(); setEditingId(null) }

  const renderBadge = t => (
    <span style={{
      fontSize:12, padding:'2px 8px', borderRadius:999,
      background:'color-mix(in hsl, var(--accent), #fff 85%)',
      textTransform:'capitalize'
    }}>
      {t.item?.type || 'item'}
    </span>
  )

  return (
    <div className="container" style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:18 }}>
      {/* Left: thread list */}
      <div className="panel" style={{ padding:10, overflow:'auto', maxHeight:'calc(100vh - 180px)', borderRadius:14 }}>
        <div style={{ padding:'6px 10px 12px' }}>
          <strong>Inbox</strong>
        </div>

        {myThreads.length === 0 && (
          <div className="center" style={{ padding:24, color:'var(--muted)' }}>No messages yet.</div>
        )}

        <div style={{ display:'grid', gap:10 }}>
          {myThreads.map(t=>{
            const isActive = t.id===activeId
            const lastRead = t.lastRead?.[me]||0
            const unread = t.messages.filter(m=>m.sender!==me && m.ts>lastRead).length
            const editing = editingId===t.id

            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                aria-selected={isActive}
                onClick={()=>nav(`/inbox?t=${t.id}`)}
                onKeyDown={e=>{ if(e.key==='Enter') nav(`/inbox?t=${t.id}`) }}
                style={{
                  // ACTIVE MARKING:
                  // left accent bar + tinted background + stronger border/shadow
                  display:'grid',
                  gridTemplateColumns:'1fr auto',
                  alignItems:'center',
                  gap:8,
                  padding:'10px 12px',
                  borderRadius:12,
                  background: isActive ? 'color-mix(in hsl, var(--accent), #fff 90%)' : 'var(--panel)',
                  border: isActive
                    ? '1px solid color-mix(in hsl, var(--accent), #fff 55%)'
                    : '1px solid color-mix(in hsl, var(--panel), #000 12%)',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,.08)' : '0 2px 6px rgba(0,0,0,.05)',
                  position:'relative',
                  // left accent bar
                  paddingLeft: isActive ? 14 : 12
                }}
              >
                {/* Left accent bar */}
                {isActive && (
                  <span
                    aria-hidden
                    style={{
                      position:'absolute', left:4, top:8, bottom:8,
                      width:4, borderRadius:4, background:'var(--accent)'
                    }}
                  />
                )}

                {/* LEFT: title */}
                <div style={{ display:'grid', gap:4, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    {renderBadge(t)}
                    {editing ? (
                      <input
                        value={editValue}
                        onClick={e=>e.stopPropagation()}
                        onChange={e=>setEditValue(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter') saveEdit(t,e); if(e.key==='Escape') cancelEdit(e) }}
                        autoFocus
                        className="input"
                        style={{ flex:1, fontSize:14, height:26, padding:'2px 6px', minWidth:0 }}
                      />
                    ) : (
                      <span
                        title={t.customTitle || t.item?.title || 'Item'}
                        style={{
                          fontWeight: isActive ? 800 : 700,  // extra bold on active
                          minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                          textTransform:'capitalize'
                        }}
                      >
                        {t.customTitle || t.item?.title || 'Item'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>
                    With: {t.participants.filter(p=>p!==me)[0]}
                  </div>
                </div>

                {/* RIGHT: tiny edit / save / cancel icons */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {editing ? (
                    <>
                      <button className="btn ghost" onClick={e=>saveEdit(t,e)} title="Save" style={{ padding:4 }}>
                        <Check size={16}/>
                      </button>
                      <button className="btn ghost" onClick={cancelEdit} title="Cancel" style={{ padding:4 }}>
                        <X size={16}/>
                      </button>
                    </>
                  ) : (
                    <button className="btn ghost" onClick={e=>startEdit(t,e)} title="Rename" style={{ padding:4 }}>
                      <Edit2 size={16}/>
                    </button>
                  )}
                </div>

                {/* Unread count bubble */}
                {unread>0 && (
                  <span
                    style={{
                      position:'absolute', right:10, top:10,
                      borderRadius:999, minWidth:20, height:20,
                      display:'grid', placeItems:'center', fontSize:11,
                      background:'var(--accent)', color:'#fff'
                    }}
                  >
                    {unread}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: conversation */}
      <div className="panel" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 180px)', overflow:'hidden', borderRadius:14 }}>
        <div style={{ flex:'0 0 auto', padding:'12px 16px', borderBottom:'1px solid color-mix(in hsl, var(--panel), #fff 10%)' }}>
          {active ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <strong>{active.customTitle || active.item?.title || 'Item'}</strong>
              <span style={{ color:'var(--muted)' }}>•</span>
              <span style={{ color:'var(--muted)' }}>{active.item?.type || 'post'}</span>
            </div>
          ) : <strong>Select a thread</strong>}
        </div>

        <div style={{ flex:'1 1 auto', overflowY:'auto', padding:16, background:'color-mix(in hsl, var(--panel), #000 6%)' }}>
          {!active && <div className="center" style={{ padding:24, color:'var(--muted)' }}>No conversation selected.</div>}
          {active?.messages?.map(m=>{
            const mine=m.sender===me
            return (
              <div key={m.id} style={{ display:'flex', justifyContent:mine?'flex-end':'flex-start', marginBottom:10 }}>
                <div style={{
                  maxWidth:'70%', background:mine?'var(--accent)':'color-mix(in hsl, var(--panel), #fff 12%)',
                  color:mine?'#fff':'var(--text)', padding:'10px 12px', borderRadius:14
                }}>
                  <div style={{ whiteSpace:'pre-wrap' }}>{m.text}</div>
                  <div style={{ fontSize:11, opacity:0.8, marginTop:4 }}>
                    {new Date(m.ts).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={endRef}/>
        </div>

        <form onSubmit={onSend} style={{ flex:'0 0 auto', display:'flex', gap:8, padding:10, borderTop:'1px solid color-mix(in hsl, var(--panel), #fff 10%)' }}>
          <input
            className="input"
            placeholder={active ? 'Type a message…' : 'Select a conversation'}
            value={text}
            onChange={e=>setText(e.target.value)}
            disabled={!active}
          />
          <button className="btn" type="submit" disabled={!active||!text.trim()}>Send</button>
        </form>
      </div>
    </div>
  )
}
