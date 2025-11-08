import { useState } from 'react'
import { motion } from 'framer-motion'
import { store } from '../utils/storage'
import MapPicker from '../components/MapPicker'
import ItemCard from '../components/ItemCard'
import { useSettings } from '../context/SettingsContext'

// Found flow: minimal public details + private attributes for later verification
export default function Found(){
  const [publicForm, setPublicForm] = useState({ type:'', place:'', date:'', location:null })
  const [privateForm, setPrivateForm] = useState({ brand:'', color:'', detail:'' })
  const [items, setItems] = useState(()=> store.get('lf_found_v1', []))
  const { play } = useSettings()

  const submit = (e) => {
    e.preventDefault()
    const newItem = {
      id: crypto.randomUUID(),
      ...publicForm,
      private: privateForm,
      status: 'Pending'
    }
    const next = [newItem, ...items]
    setItems(next)
    store.set('lf_found_v1', next)
    play('success')
    setPublicForm({ type:'', place:'', date:'', location:null })
    setPrivateForm({ brand:'', color:'', detail:'' })
  }

  return (
    <motion.div
      className="grid cols-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel" style={{padding:20}}>
        <h3 style={{marginTop:0}}>Report Found Item</h3>
        <form className="grid" onSubmit={submit}>
          <div className="row">
            <input className="input" placeholder="Item type" value={publicForm.type} onChange={e=>setPublicForm({...publicForm, type:e.target.value})} required />
            <input className="input" placeholder="Place found" value={publicForm.place} onChange={e=>setPublicForm({...publicForm, place:e.target.value})} />
          </div>
          <input className="input" type="date" value={publicForm.date} onChange={e=>setPublicForm({...publicForm, date:e.target.value})} required />

          {/* Location picker */}
          <MapPicker value={publicForm.location} onChange={(loc)=>setPublicForm({...publicForm, location: loc})} />

          <div className="panel mt-4" style={{padding:16}}>
            <h4 style={{marginTop:0}}>Private attributes (for verification)</h4>
            <div className="row">
              <input className="input" placeholder="Brand" value={privateForm.brand} onChange={e=>setPrivateForm({...privateForm, brand:e.target.value})} />
              <input className="input" placeholder="Color" value={privateForm.color} onChange={e=>setPrivateForm({...privateForm, color:e.target.value})} />
            </div>
            <input className="input mt-3" placeholder="Extra detail (e.g., zipper color)" value={privateForm.detail} onChange={e=>setPrivateForm({...privateForm, detail:e.target.value})} />
          </div>

          <button className="btn mt-3">Submit</button>
        </form>
      </div>

      <div className="grid" style={{alignContent:'start'}}>
        {items.length===0 ? (
          <div className="panel center" style={{padding:24}}>No found items yet.</div>
        ) : items.map(i => <ItemCard key={i.id} item={i} />)}
      </div>
    </motion.div>
  )
}
