import { useSettings } from '../context/SettingsContext'


export default function SoundToggle(){
const { sfx, volume, update, play } = useSettings()
return (
<div className="row">
<label className="row">
<input type="checkbox" checked={sfx} onChange={e=>update({ sfx: e.target.checked })} />
<span>Enable sound effects</span>
</label>
<input type="range" min="0" max="1" step="0.01" value={volume} onChange={e=>update({ volume: parseFloat(e.target.value) })} />
<button className="btn" onClick={()=>play('success')}>Test</button>
</div>
)
}