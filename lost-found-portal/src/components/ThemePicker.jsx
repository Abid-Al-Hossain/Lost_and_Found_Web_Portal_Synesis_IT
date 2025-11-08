import { useTheme } from '../context/ThemeContext'


export default function ThemePicker(){
const { theme, setTheme } = useTheme()
return (
<div className="row">
<label>Mode
<select className="input mt-2" value={theme.mode} onChange={e=>setTheme({ ...theme, mode: e.target.value })}>
<option value="dark">Dark</option>
<option value="light">Light</option>
</select>
</label>
<label>Accent
<input className="input mt-2" type="color" value={theme.accent} onChange={e=>setTheme({ ...theme, accent: e.target.value })}/>
</label>
<label>Text
<input className="input mt-2" type="color" value={theme.text} onChange={e=>setTheme({ ...theme, text: e.target.value })}/>
</label>
</div>
)
}