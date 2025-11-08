import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import ThemePicker from './ThemePicker'
import AnimationPicker from './AnimationPicker'
import SoundToggle from './SoundToggle'
import Modal from './Modal'


export default function UserMenu(){
const { user, logout } = useAuth()
const { play } = useSettings()
const [open, setOpen] = useState(false)


const initials = user?.name?.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || '👤'


return (
<>
<button className="btn" aria-haspopup onClick={()=>{ setOpen(true); }}> {initials} </button>
<Modal open={open} onClose={()=>setOpen(false)} title="Profile & Settings" footer={
<>
{user && <button className="btn ghost" onClick={()=>{ logout(); play('click'); setOpen(false) }}>Logout</button>}
<button className="btn" onClick={()=>setOpen(false)}>Close</button>
</>
}>
{user ? (
<div className="grid cols-2">
<div className="panel" style={{padding:16}}>
<h4>Profile</h4>
<p><b>Name:</b> {user.name}</p>
<p><b>Email:</b> {user.email}</p>
</div>
<div className="panel" style={{padding:16}}>
<h4>Appearance</h4>
<ThemePicker />
</div>
<div className="panel" style={{padding:16}}>
<h4>Animation</h4>
<AnimationPicker />
</div>
<div className="panel" style={{padding:16}}>
<h4>Sound</h4>
<SoundToggle />
</div>
</div>
) : (
<p>Login to view your profile and settings. Use the "Login / Register" button.</p>
)}
</Modal>
</>
)
}