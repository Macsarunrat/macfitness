import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pastel-cream text-pastel-text flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-red-200 text-left p-6 space-y-4 shadow-cute-lg rounded-cute-lg">
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg">แอปขัดข้องชั่วคราวค่ะ (Application Error)</h2>
            </div>
            <p className="text-xs text-pastel-muted">
              ระบบตรวจพบข้อผิดพลาดขณะทำงาน กรุณาส่งข้อมูลนี้ให้เราเพื่อแก้ไขนะคะ:
            </p>
            <div className="bg-red-50 border border-red-100 rounded-cute p-3 text-[10px] font-mono text-red-600 overflow-x-auto whitespace-pre-wrap max-h-60">
              {this.state.error?.toString()}
              {"\n\n"}
              {this.state.error?.stack}
            </div>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="px-4 py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs font-bold rounded-cute transition-all duration-150 w-full cursor-pointer"
            >
              ล้างแคชข้อมูลทดสอบ และเริ่มแอปใหม่
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
