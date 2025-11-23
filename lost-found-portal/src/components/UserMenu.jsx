import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import ThemePicker from './ThemePicker'
import AnimationPicker from './AnimationPicker'
import SoundToggle from './SoundToggle'
import Modal from './Modal'


export default function UserMenu(){
const { user, logout, updateUser } = useAuth()
const { play } = useSettings()
const [open, setOpen] = useState(false)
const [showChangePassword, setShowChangePassword] = useState(false)
const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const [passwordError, setPasswordError] = useState('')
const [passwordLoading, setPasswordLoading] = useState(false)
const [showEditName, setShowEditName] = useState(false)
const [newName, setNewName] = useState('')
const [nameError, setNameError] = useState('')
const [nameLoading, setNameLoading] = useState(false)


const initials = user?.name?.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || '👤'

const changePassword = async (e) => {
  e.preventDefault()
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError('New passwords do not match')
    return
  }

  setPasswordLoading(true)
  setPasswordError('')
  
  try {
    const token = user?.accessToken
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const resp = await fetch('https://localhost:7238/Authentication/ChangePassword', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        CurrentPassword: passwordForm.currentPassword,
        NewPassword: passwordForm.newPassword
      })
    })

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => null)
      if (Array.isArray(errorData)) {
        throw new Error(errorData.map(e => e.description || e).join(', '))
      }
      throw new Error(errorData?.message || `Server returned ${resp.status}`)
    }

    const result = await resp.text()
    play('success')
    setShowChangePassword(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    alert('Password changed successfully!')
  } catch (err) {
    setPasswordError(err.message || 'Failed to change password')
  } finally {
    setPasswordLoading(false)
  }
}

const changeName = async (e) => {
  e.preventDefault()
  if (!newName.trim()) {
    setNameError('Name cannot be empty')
    return
  }

  setNameLoading(true)
  setNameError('')
  
  try {
    const token = user?.accessToken
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const resp = await fetch('https://localhost:7238/Authentication/ChangeName', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        NewName: newName.trim()
      })
    })

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => null)
      if (Array.isArray(errorData)) {
        throw new Error(errorData.map(e => e.description || e).join(', '))
      }
      throw new Error(errorData?.message || `Server returned ${resp.status}`)
    }

    const result = await resp.text()
    play('success')
    setShowEditName(false)
    setNewName('')
    
    updateUser({ name: newName.trim() })
    alert('Name changed successfully!')
  } catch (err) {
    setNameError(err.message || 'Failed to change name')
  } finally {
    setNameLoading(false)
  }
}


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
<div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
  <p style={{margin: 0}}><b>Name:</b> {user.name}</p>
  <button 
    onClick={() => {
      setNewName(user.name || '')
      setShowEditName(true)
    }}
    className="btn ghost"
    style={{
      padding: '4px 6px',
      fontSize: '12px',
      height: 'auto',
      minWidth: 'auto',
      backgroundColor: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: '4px'
    }}
    title="Edit name"
  >
    ✏️
  </button>
</div>
<p><b>Email:</b> {user.email}</p>
<button 
  className="btn secondary" 
  style={{marginTop: 8, fontSize: '12px', padding: '6px 12px', height: 'auto'}}
  onClick={() => setShowChangePassword(true)}
>
  Change Password
</button>
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

{/* Change Password Modal */}
<Modal 
  open={showChangePassword} 
  onClose={() => {
    setShowChangePassword(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
  }} 
  title="Change Password"
  footer={
    <>
      <button 
        className="btn ghost" 
        onClick={() => {
          setShowChangePassword(false)
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
          setPasswordError('')
        }}
        disabled={passwordLoading}
      >
        Cancel
      </button>
      <button 
        className="btn" 
        onClick={changePassword}
        disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
      >
        {passwordLoading ? 'Changing...' : 'Change Password'}
      </button>
    </>
  }
>
  <form onSubmit={changePassword} className="grid" style={{gap: 16}}>
    {passwordError && (
      <div style={{padding: 12, backgroundColor: 'color-mix(in hsl, red, var(--panel) 85%)', borderRadius: 8, color: 'red'}}>
        {passwordError}
      </div>
    )}
    
    <div>
      <label>Current Password</label>
      <input 
        type="password" 
        className="input" 
        placeholder="Enter current password"
        value={passwordForm.currentPassword}
        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
        required
        disabled={passwordLoading}
      />
    </div>
    
    <div>
      <label>New Password</label>
      <input 
        type="password" 
        className="input" 
        placeholder="Enter new password"
        value={passwordForm.newPassword}
        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
        required
        disabled={passwordLoading}
      />
    </div>
    
    <div>
      <label>Confirm New Password</label>
      <input 
        type="password" 
        className="input" 
        placeholder="Confirm new password"
        value={passwordForm.confirmPassword}
        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
        required
        disabled={passwordLoading}
      />
    </div>
  </form>
</Modal>

{/* Edit Name Modal */}
<Modal 
  open={showEditName} 
  onClose={() => {
    setShowEditName(false)
    setNewName('')
    setNameError('')
  }} 
  title="Edit Name"
  footer={
    <>
      <button 
        className="btn ghost" 
        onClick={() => {
          setShowEditName(false)
          setNewName('')
          setNameError('')
        }}
        disabled={nameLoading}
      >
        Cancel
      </button>
      <button 
        className="btn" 
        onClick={changeName}
        disabled={nameLoading || !newName.trim()}
      >
        {nameLoading ? 'Saving...' : 'Save Name'}
      </button>
    </>
  }
>
  <form onSubmit={changeName} className="grid" style={{gap: 16}}>
    {nameError && (
      <div style={{padding: 12, backgroundColor: 'color-mix(in hsl, red, var(--panel) 85%)', borderRadius: 8, color: 'red'}}>
        {nameError}
      </div>
    )}
    
    <div>
      <label>Full Name</label>
      <input 
        type="text" 
        className="input" 
        placeholder="Enter your full name"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        required
        disabled={nameLoading}
        autoFocus
      />
    </div>
  </form>
</Modal>
</>
)
}