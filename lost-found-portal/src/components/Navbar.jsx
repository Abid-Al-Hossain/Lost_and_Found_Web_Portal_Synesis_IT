import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import UserMenu from './UserMenu'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { pathname } = useLocation()
  const { user } = useAuth()  // ⟵ use auth state

  return (
    <header className="container" style={{paddingTop:16}}>
      <div className="panel" style={{padding:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div className="row" style={{gap:10}}>
          <Link to="/" className="badge" aria-label="Lost & Found Home">Lost &amp; Found</Link>

          <nav className="row" style={{ position:'relative', gap:8 }}>
            {[
              { to:'/lost',  label:'lost'  },
              { to:'/found', label:'found' }
            ].map(({to,label}) => (
              <NavLink
                key={to}
                to={to}
                className="btn ghost"
                style={{ position:'relative', overflow:'hidden', textTransform:'capitalize' }}
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        style={{
                          position:'absolute', inset:0, borderRadius:12,
                          background:'color-mix(in hsl, var(--accent), #fff 85%)', opacity:.18
                        }}
                        transition={{ type:'spring', stiffness:280, damping:24 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="row">
          {/* Show Login/Register ONLY when logged out */}
          {!user && (
            <Link
              to="/auth"
              className="btn secondary"
              aria-current={pathname==='/auth' ? 'page' : undefined}
            >
              Login / Register
            </Link>
          )}

          {/* Show profile/settings menu ONLY when logged in */}
          {user && <UserMenu />}
        </div>
      </div>

      <motion.div
        layoutId="underline"
        style={{height:2, background:'var(--accent)', width: '100%', opacity:.25, borderRadius:999}}
      />
    </header>
  )
}
