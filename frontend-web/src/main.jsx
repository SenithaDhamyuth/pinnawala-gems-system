import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName="z-[9999] mt-16"
        containerStyle={{ top: 20, zIndex: 999999 }}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            maxWidth: '360px',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)