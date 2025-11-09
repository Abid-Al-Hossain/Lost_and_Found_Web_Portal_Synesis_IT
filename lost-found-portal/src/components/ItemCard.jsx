import { motion } from 'framer-motion'
import MiniMap from './MiniMap'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useNavigate } from 'react-router-dom'

/**
 * Props:
 * - item: the post object
 * - type: "lost" | "found"
 */
export default function ItemCard({ item, type }) {
  const { user } = useAuth()
  const { getOrCreateThread } = useChat()
  const nav = useNavigate()

  const me = String(user?.email || '').toLowerCase()
  const owner = String(item?.ownerId || '').toLowerCase()
  const isMine = me && owner && me === owner

  const onMessage = () => {
    if (!user?.email || !item?.ownerId) return
    const t = getOrCreateThread({
      otherEmail: item.ownerId,
      otherName: item.ownerName,
      item: {
        id: item.id,
        type,
        title: item.type || 'Item',
        ownerName: item.ownerName
      }
    })
    nav(`/inbox?t=${t.id}`)
  }

  return (
    <motion.div
      className="panel"
      style={{ padding: 16 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="row" style={{ justifyContent: 'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <strong>{item.type}</strong>
          <span className="badge">{item.status}</span>
        </div>
        {!isMine && (
          <button className="btn pill" onClick={onMessage}>
            {type === 'found' ? 'Message finder' : 'Message owner'}
          </button>
        )}
      </div>

      {item.photo && (
        <div className="mt-3">
          <img
            src={item.photo}
            alt={`${item.type} photo`}
            className="item-photo"
          />
        </div>
      )}

      <div className="mt-2" style={{ color: 'var(--muted)' }}>
        {item.brand && <span><b>Brand:</b> {item.brand} &nbsp; </span>}
        {item.color && <span><b>Color:</b> {item.color} &nbsp; </span>}
        {item.place && <span><b>Place:</b> {item.place} &nbsp; </span>}
        {item.date && <span><b>Date:</b> {new Date(item.date).toLocaleDateString('en-GB')} </span>}
      </div>

      {item.location && (
        <div className="mt-3">
          <MiniMap location={item.location} />
        </div>
      )}
    </motion.div>
  )
}
