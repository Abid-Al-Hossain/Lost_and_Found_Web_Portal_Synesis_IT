import { motion } from 'framer-motion'
import MiniMap from './MiniMap'

export default function ItemCard({ item }) {
  return (
    <motion.div
      className="panel"
      style={{ padding: 16 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>{item.type}</strong>
        <span className="badge">{item.status}</span>
      </div>

      {/* Photo (for Lost items if provided) */}
      {item.photo && (
        <div className="mt-3">
          <img
            src={item.photo}
            alt={`${item.type} photo`}
            className="item-photo"
          />
        </div>
      )}

      {/* Meta */}
      <div className="mt-2" style={{ color: 'var(--muted)' }}>
        {item.brand && <span><b>Brand:</b> {item.brand} &nbsp; </span>}
        {item.color && <span><b>Color:</b> {item.color} &nbsp; </span>}
        {item.place && <span><b>Place:</b> {item.place} &nbsp; </span>}
        {item.date && <span><b>Date:</b> {new Date(item.date).toLocaleDateString()} </span>}
      </div>

      {/* Mini map (for both Lost/Found when location exists) */}
      {item.location && (
        <div className="mt-3">
          <MiniMap location={item.location} />
        </div>
      )}
    </motion.div>
  )
}
