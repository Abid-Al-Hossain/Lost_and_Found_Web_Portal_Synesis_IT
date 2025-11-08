import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './app.css'


import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'


createRoot(document.getElementById('root')).render(
<React.StrictMode>
<ThemeProvider>
<SettingsProvider>
<AuthProvider>
<BrowserRouter>
<App />
</BrowserRouter>
</AuthProvider>
</SettingsProvider>
</ThemeProvider>
</React.StrictMode>
)