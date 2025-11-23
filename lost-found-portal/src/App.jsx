import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Lost from './pages/Lost'
import Found from './pages/Found'
import SignalRInbox from './pages/SignalRInbox'
import { useAuth } from './context/AuthContext'
import { useSettings } from './context/SettingsContext'

const pageVariants = {
  fade:    { initial:{opacity:0, y:6},   animate:{opacity:1, y:0},  exit:{opacity:0, y:-6} },
  slide:   { initial:{opacity:0, x:24},  animate:{opacity:1, x:0},  exit:{opacity:0, x:-24} },
  scale:   { initial:{opacity:0, scale:.98}, animate:{opacity:1, scale:1}, exit:{opacity:.6, scale:.98} },
  springy: { initial:{opacity:0, y:12},  animate:{opacity:1, y:0, transition:{type:'spring', stiffness:140, damping:18}}, exit:{opacity:0, y:-12} }
}

function Page({ children }) {
  const { animation } = useSettings()
  const variant = pageVariants[animation] || pageVariants.fade
  return (
    <motion.main className="container" {...variant} transition={{ duration: 0.45 }}>
      {children}
    </motion.main>
  )
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}

export default function App(){
  const location = useLocation()
  const { user } = useAuth()

  const landingElement = user
    ? <Navigate to="/lost" replace />
    : <Page><Home/></Page>

  return (
    <div>
      <Navbar />
      <Routes location={location}>
        <Route path="/" element={landingElement} />
        <Route path="/auth" element={<Page><Auth/></Page>} />
        <Route path="/lost" element={<PrivateRoute><Page><Lost/></Page></PrivateRoute>} />
        <Route path="/found" element={<PrivateRoute><Page><Found/></Page></PrivateRoute>} />
        <Route path="/inbox" element={<PrivateRoute><Page><SignalRInbox/></Page></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
