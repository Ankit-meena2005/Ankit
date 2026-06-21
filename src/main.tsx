import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { VoiceNavProvider } from './lib/voice'
import { ToastProvider } from './lib/toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <LanguageProvider>
          <VoiceNavProvider>
            <App />
          </VoiceNavProvider>
        </LanguageProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
