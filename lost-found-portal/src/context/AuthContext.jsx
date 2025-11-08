import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { store } from '../utils/storage'
import { sha256 } from '../utils/crypto'


const KEY = 'lf_auth_v1'
const AuthCtx = createContext(null)


export function AuthProvider({ children }){
const [user, setUser] = useState(() => store.get(KEY, null))


useEffect(()=>{ store.set(KEY, user) }, [user])


const register = async ({ name, email, password }) => {
const users = store.get('lf_users_v1', [])
if(users.find(u => u.email === email)) throw new Error('Email already registered')
const hashed = await sha256(password)
const newUser = { id: crypto.randomUUID(), name, email, pass: hashed, createdAt: Date.now() }
store.set('lf_users_v1', [...users, newUser])
setUser({ id: newUser.id, name, email })
}


const login = async ({ email, password }) => {
const users = store.get('lf_users_v1', [])
const user = users.find(u => u.email === email)
if(!user) throw new Error('No account with that email')
const hashed = await sha256(password)
if(user.pass !== hashed) throw new Error('Incorrect password')
setUser({ id: user.id, name: user.name, email: user.email })
}


const logout = () => setUser(null)


const value = useMemo(()=>({ user, register, login, logout }), [user])
return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}


export const useAuth = () => useContext(AuthCtx)