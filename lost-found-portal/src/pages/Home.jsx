import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'


export default function Home(){
const cards = [
{ to:'/lost', title:'Report Lost Item', desc:'Post details so finders can search and match.', accent:'var(--accent)'},
{ to:'/found', title:'Report Found Item', desc:'Share minimal details and verify via private attributes.', accent:'var(--accent-2)'}
]
return (
<div className="grid cols-2">
{cards.map(c => (
<motion.div key={c.to} className="panel" style={{padding:24, borderLeft:`6px solid ${c.accent}`}}
initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:.35}}>
<h2 style={{marginTop:0}}>{c.title}</h2>
<p style={{color:'var(--muted)'}}>{c.desc}</p>
<Link className="btn mt-3" to={c.to}>Open</Link>
</motion.div>
))}
</div>
)
}