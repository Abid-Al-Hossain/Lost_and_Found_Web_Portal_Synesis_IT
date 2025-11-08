import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'


export default function Auth(){
const nav = useNavigate()
const { register, login } = useAuth()
const { play } = useSettings()
const [mode, setMode] = useState('login')
const [form, setForm] = useState({ name:'', email:'', password:'' })
const [error, setError] = useState('')


const submit = async (e) => {
e.preventDefault()
setError('')
try{
if(mode==='register'){
await register(form)
} else {
await login(form)
}
play('success')
nav('/')
} catch(err){ setError(err.message || 'Something went wrong') }
}


return (
<div className="panel" style={{padding:24, maxWidth:520, margin:'0 auto'}}>
<div className="row" style={{justifyContent:'space-between'}}>
<h2 style={{margin:0}}>{mode==='login' ? 'Welcome back' : 'Create an account'}</h2>
<button className="btn ghost" onClick={()=>setMode(mode==='login'?'register':'login')}>
{mode==='login' ? 'Need an account?' : 'Already have one?'}
</button>
</div>
<form className="mt-4 grid" onSubmit={submit}>
{mode==='register' && (
<input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
)}
<input className="input" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
<input className="input" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required minLength={6} />
{error && <p style={{color:'#f87171'}}>{error}</p>}
<button className="btn" type="submit">{mode==='login' ? 'Login' : 'Register'}</button>
</form>
<p className="mt-3" style={{color:'var(--muted)'}}>You will remain logged in until you choose Logout from the profile menu.</p>
</div>
)
}