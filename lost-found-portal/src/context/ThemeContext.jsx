import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { store } from '../utils/storage'


const KEY = 'lf_theme_v1'
const ThemeCtx = createContext(null)


export function ThemeProvider({ children }){
const [theme, setTheme] = useState(() => store.get(KEY, { mode: 'dark', accent: '#60a5fa', text: '#e5e7eb' }))


useEffect(()=>{
store.set(KEY, theme)
document.documentElement.setAttribute('data-theme', theme.mode)
if(theme.accent) document.documentElement.style.setProperty('--accent', theme.accent)
if(theme.text) document.documentElement.style.setProperty('--text', theme.text)
}, [theme])


const value = useMemo(()=>({ theme, setTheme }), [theme])
return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}


export const useTheme = () => useContext(ThemeCtx)