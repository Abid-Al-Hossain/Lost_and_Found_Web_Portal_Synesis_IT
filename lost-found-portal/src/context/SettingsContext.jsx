import { createContext, useContext, useMemo, useState } from 'react'
import { store } from '../utils/storage'


const KEY = 'lf_settings_v1'
const defaultSettings = { animation: 'springy', sfx: true, volume: 0.4 }


const Ctx = createContext(null)


export function SettingsProvider({ children }){
const [settings, setSettings] = useState(()=> store.get(KEY, defaultSettings))


const update = (patch) => {
const next = { ...settings, ...patch }
setSettings(next)
store.set(KEY, next)
}


const play = (type='click') => {
if(!settings.sfx) return
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const o = ctx.createOscillator()
const g = ctx.createGain()
const now = ctx.currentTime
o.type = type === 'success' ? 'triangle' : 'sine'
o.frequency.setValueAtTime(type==='success'? 880: 420, now)
g.gain.setValueAtTime(settings.volume, now)
g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
o.connect(g); g.connect(ctx.destination); o.start(); o.stop(now + 0.2)
}


const value = useMemo(()=>({ ...settings, update, play }), [settings])
return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}


export const useSettings = () => useContext(Ctx)