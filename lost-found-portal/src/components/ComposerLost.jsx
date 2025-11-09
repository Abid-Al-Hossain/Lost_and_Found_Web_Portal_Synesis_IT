import { useState } from 'react'
import Modal from './Modal'
import MapPicker from './MapPicker'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

export default function ComposerLost({ onCreate }) {
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [form, setForm] = useState({
    type:'', brand:'', color:'', marks:'', place:'', date:'', location:null
  })
  const { play } = useSettings()
  const { user } = useAuth()
  const initials = (user?.name || user?.email || 'U')[0]?.toUpperCase()

  const onPickPhoto = (e) => {
    const f = e.target.files?.[0]; if(!f){ setPhoto(null); return }
    const r = new FileReader(); r.onload = () => setPhoto(r.result); r.readAsDataURL(f)
  }

  const submit = (e) => {
    e.preventDefault()
    const item = {
      id: crypto.randomUUID(),
      ...form,
      photo,
      status:'Pending',
      ownerId: user?.email || 'anon',
      ownerName: user?.name || user?.email || 'Anonymous'
    }
    onCreate(item)
    play('success')
    setOpen(false)
    setForm({ type:'', brand:'', color:'', marks:'', place:'', date:'', location:null })
    setPhoto(null)
  }

  return (
    <>
      {/* Compact composer */}
      <div className="panel composer">
        <div className="avatar" aria-hidden>{initials}</div>
        <button className="composer-input" onClick={()=>setOpen(true)}>Report a lost item…</button>
        <button className="btn pill" onClick={()=>setOpen(true)}>Open</button>
      </div>

      {/* Full modal form */}
      <Modal
        open={open}
        onClose={()=>setOpen(false)}
        title="Report Lost Item"
        footer={
          <>
            <button className="btn ghost" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn" form="lost-compose-form" type="submit">Post</button>
          </>
        }
      >
        <form id="lost-compose-form" className="grid" onSubmit={submit} style={{ gap: 18 }}>
          <div>
            <label>Item type</label>
            <input className="input" placeholder="Wallet, Phone, etc." value={form.type}
                   onChange={e=>setForm({...form, type:e.target.value})} required />
          </div>

          <div className="field-row">
            <div>
              <label>Brand</label>
              <input className="input" placeholder="Brand" value={form.brand}
                     onChange={e=>setForm({...form, brand:e.target.value})} />
            </div>
            <div>
              <label>Color</label>
              <input className="input" placeholder="Color" value={form.color}
                     onChange={e=>setForm({...form, color:e.target.value})} />
            </div>
          </div>

          <div>
            <label>Distinctive marks (optional)</label>
            <input className="input" placeholder="Scratch on back, sticker, etc."
                   value={form.marks} onChange={e=>setForm({...form, marks:e.target.value})} />
          </div>

          <div className="field-row">
            <div>
              <label>Place of loss</label>
              <input className="input" placeholder="Where you lost it" value={form.place}
                     onChange={e=>setForm({...form, place:e.target.value})} />
            </div>
            <div>
              <label>Date</label>
              <input className="input" type="date" value={form.date}
                     onChange={e=>setForm({...form, date:e.target.value})} required />
            </div>
          </div>

          <div>
            <label>Photo (optional)</label>
            <input className="input" type="file" accept="image/*" onChange={onPickPhoto} />
            {photo && <img className="item-photo mt-3" src={photo} alt="Preview" />}
          </div>

          <div>
            <label>Location</label>
            <MapPicker value={form.location} onChange={(loc)=>setForm({...form, location: loc})} />
          </div>
        </form>
      </Modal>
    </>
  )
}
