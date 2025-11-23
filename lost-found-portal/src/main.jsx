import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './app.css'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import { SignalRChatProvider } from './context/SignalRChatContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <SignalRChatProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SignalRChatProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
)
