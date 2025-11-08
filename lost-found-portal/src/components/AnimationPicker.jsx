import { useSettings } from '../context/SettingsContext'


export default function AnimationPicker(){
const { animation, update } = useSettings()
return (
<div className="row">
<select className="input" value={animation} onChange={e=>update({ animation: e.target.value })}>
<option value="fade">Fade</option>
<option value="slide">Slide</option>
<option value="scale">Scale</option>
<option value="springy">Springy</option>
</select>
</div>
)
}