// src/pages/Lost.jsx
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { store } from '../utils/storage'
import ItemCard from '../components/ItemCard'
import ComposerLost from '../components/ComposerLost'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { findMatches } from '../utils/matcher'
import { useNavigate } from 'react-router-dom'

const KEY_LOST = 'lf_lost_v1'
const KEY_FOUND = 'lf_found_v1'

export default function Lost(){
  const [items, setItems] = useState(()=> store.get(KEY_LOST, []))
  const [mine, setMine] = useState(false)
  const { user } = useAuth()
  const { notifyPotentialMatch } = useChat()
  const nav = useNavigate()

  const addItem = (item) => {
    const next = [item, ...items]
    setItems(next)
    store.set(KEY_LOST, next)

    // Match the new LOST against all FOUND within 100m & similar type (+brand/color if available)
    const foundList = store.get(KEY_FOUND, [])
    const matches = findMatches('lost', item, { candidates: foundList, maxMeters: 100 })
    if (matches.length > 0) {
      const m = matches[0]
      const t = notifyPotentialMatch(m)
      if (t && window.confirm(`Nearby “Found” match for "${item.type}" within ~${m.distanceM}m. Open chat?`)) {
        nav(`/inbox?t=${t.id}`)
      }
    }
  }

  const visible = useMemo(() => {
    if (mine && user?.email) return items.filter(i => i.ownerId === user.email)
    return items
  }, [items, mine, user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="feed"
    >
      <ComposerLost onCreate={addItem} />

      <div className="panel" style={{padding:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div className="filters">
          <button className={`chip ${!mine ? 'active':''}`} onClick={()=>setMine(false)}>All posts</button>
          <button className={`chip ${mine ? 'active':''}`} onClick={()=>setMine(true)}>My posts</button>
        </div>
        <div style={{color:'var(--muted)'}}>{visible.length} item(s)</div>
      </div>

      {visible.length === 0 ? (
        <div className="panel center" style={{padding:24}}>No lost items yet.</div>
      ) : visible.map(i => <ItemCard key={i.id} item={i} type="lost" />)}
    </motion.div>
  )
}
