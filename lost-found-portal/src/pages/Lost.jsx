import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { store } from '../utils/storage'
import MapPicker from '../components/MapPicker'
import ItemCard from '../components/ItemCard'
import { useSettings } from '../context/SettingsContext'

export default function Lost(){
  const [form, setForm] = useState({
    type:'', brand:'', color:'', marks:'', place:'', date:'', location:null
  })
  const [photo, setPhoto] = useState(null) // data URL
  const [items, setItems] = useState(()=> store.get('lf_lost_v1', []))
  const { play } = useSettings()

  // Read file -> data URL for preview & storage
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) { setPhoto(null); return }
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    const newItem = {
      id: crypto.randomUUID(),
      ...form,
      photo,           // attach data URL
      status: 'Pending'
    }
    const next = [newItem, ...items]
    setItems(next)
    store.set('lf_lost_v1', next)
    play('success')
    setForm({ type:'', brand:'', color:'', marks:'', place:'', date:'', location:null })
    setPhoto(null)
  }

  const disabled = useMemo(()=> !form.type || !form.date, [form])

  return (
    <motion.div
      className="grid cols-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel" style={{padding:20}}>
        <h3 style={{marginTop:0}}>Report Lost Item</h3>
        <form className="grid" onSubmit={submit}>
          <input
            className="input"
            placeholder="Item type (e.g., Wallet, Phone)"
            value={form.type}
            onChange={e=>setForm({...form, type:e.target.value})}
            required
          />
          <div className="row">
            <input className="input" placeholder="Brand" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} />
            <input className="input" placeholder="Color" value={form.color} onChange={e=>setForm({...form, color:e.target.value})} />
          </div>
          <input className="input" placeholder="Distinctive marks (optional)" value={form.marks} onChange={e=>setForm({...form, marks:e.target.value})} />
          <div className="row">
            <input className="input" placeholder="Place of loss" value={form.place} onChange={e=>setForm({...form, place:e.target.value})} />
            <input className="input" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
          </div>

          {/* Photo upload */}
          <div className="panel" style={{ padding: 12 }}>
            <label style={{ display:'block', marginBottom:8, fontWeight:600 }}>Photo (optional)</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
            />
            {photo && (
              <div className="mt-3">
                <img src={photo} alt="Preview" className="item-photo" />
              </div>
            )}
          </div>

          {/* Location picker */}
          <MapPicker value={form.location} onChange={(loc)=>setForm({...form, location: loc})} />

          <button className="btn mt-3" disabled={disabled}>Submit</button>
        </form>
      </div>

      <div className="grid" style={{alignContent:'start'}}>
        {items.length===0 ? (
          <div className="panel center" style={{padding:24}}>No lost items yet.</div>
        ) : items.map(i => <ItemCard key={i.id} item={i} />)}
      </div>
    </motion.div>
  )
}
