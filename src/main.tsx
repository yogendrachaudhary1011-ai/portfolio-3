import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { setupTouchFeedback } from './touchFeedback'

// Initialize mobile and touchscreen tactile click feedback
setupTouchFeedback();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
