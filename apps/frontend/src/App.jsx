import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { useStore } from './store/useStore'
import Dashboard from './pages/Dashboard'
import FoodSnap from './pages/FoodSnap'
import RunLogs from './pages/RunLogs'
import Social from './pages/Social'
import Auth from './pages/Auth'
import { Home, Camera, Compass, Heart, RefreshCw, Loader, LogOut } from 'lucide-react'
import './App.css'

export default function App() {
  const { token, user, isOnline, isSyncing, setOnline, foodSnap, logout, fetchLogs, fetchGroup } = useStore()

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // Load initial logs and group info if token is present
  useEffect(() => {
    if (token) {
      fetchLogs()
      fetchGroup()
    }
  }, [token, fetchLogs, fetchGroup])

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 md:py-8 px-0 md:px-4">
        {/* PWA Container / Mock Phone Shell */}
        <div className="w-full max-w-md min-h-screen md:min-h-[850px] md:h-[850px] bg-pastel-cream text-pastel-text shadow-cute-lg md:rounded-cute-lg overflow-hidden border border-pastel-pink-soft/30 flex flex-col relative">
          
          {!token || !user ? (
            <main className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-center">
              <Auth />
            </main>
          ) : (
            <>
              {/* Header Bar */}
              <header className="px-6 py-4 bg-white/70 backdrop-blur-md border-b border-pastel-pink-soft/20 flex items-center justify-between shrink-0 sticky top-0 z-40">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🌸</span>
                  <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-pastel-pink-deep to-pastel-pink-hot bg-clip-text text-transparent">
                    PinkFit
                  </span>
                  {foodSnap.isAnalyzing && (
                    <span className="ml-2 flex items-center gap-1 text-[9px] bg-pastel-pink-soft text-pastel-pink-deep px-2 py-0.5 rounded-full font-bold animate-pulse border border-pastel-pink-soft">
                      <Loader size={8} className="animate-spin" />
                      กำลังคำนวณ 🍳
                    </span>
                  )}
                </div>

                {/* Sync / Connection Status Badge */}
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  {isSyncing ? (
                    <span className="flex items-center gap-1 text-pastel-pink-deep">
                      <RefreshCw size={11} className="animate-spin" />
                      กำลังซิงค์...
                    </span>
                  ) : isOnline ? (
                    <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-pastel-pink-hot bg-pastel-pink-soft/40 px-2 py-0.5 rounded-full border border-pastel-pink-soft">
                      <span className="w-1.5 h-1.5 rounded-full bg-pastel-pink-deep" />
                      Offline Mode
                    </span>
                  )}

                  <button 
                    onClick={logout}
                    title="ออกจากระบบ"
                    className="flex items-center justify-center text-pastel-pink-deep hover:text-pastel-pink-hot bg-pastel-pink-soft/30 hover:bg-pastel-pink-soft/50 p-1.5 rounded-full border border-pastel-pink-soft transition-all duration-300 cursor-pointer"
                  >
                    <LogOut size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              </header>

              {/* Main Display Area */}
              <main className="flex-1 overflow-y-auto px-5 py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/snap" element={<FoodSnap />} />
                  <Route path="/runs" element={<RunLogs />} />
                  <Route path="/social" element={<Social />} />
                </Routes>
              </main>

              {/* Bottom Nav Bar */}
              <nav className="bg-white/85 backdrop-blur-md border-t border-pastel-pink-soft/20 px-4 py-2 flex justify-around items-center shrink-0 sticky bottom-0 z-40 rounded-t-cute shadow-[0_-4px_20px_rgba(255,182,193,0.1)]">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-cute transition-all duration-300 ${
                    isActive ? 'text-pastel-pink-deep font-bold scale-110' : 'text-pastel-muted hover:text-pastel-pink-dark'
                  }`}
                >
                  <Home size={20} className="stroke-[2.5]" />
                  <span className="text-[10px] mt-0.5">แดชบอร์ด</span>
                </NavLink>

                <NavLink 
                  to="/snap" 
                  className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-cute transition-all duration-300 ${
                    isActive ? 'text-pastel-pink-deep font-bold scale-110' : 'text-pastel-muted hover:text-pastel-pink-dark'
                  }`}
                >
                  <Camera size={20} className="stroke-[2.5]" />
                  <span className="text-[10px] mt-0.5">วิเคราะห์จาน</span>
                </NavLink>

                <NavLink 
                  to="/runs" 
                  className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-cute transition-all duration-300 ${
                    isActive ? 'text-pastel-pink-deep font-bold scale-110' : 'text-pastel-muted hover:text-pastel-pink-dark'
                  }`}
                >
                  <Compass size={20} className="stroke-[2.5]" />
                  <span className="text-[10px] mt-0.5">วิ่งฟิต</span>
                </NavLink>

                <NavLink 
                  to="/social" 
                  className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-cute transition-all duration-300 ${
                    isActive ? 'text-pastel-pink-deep font-bold scale-110' : 'text-pastel-muted hover:text-pastel-pink-dark'
                  }`}
                >
                  <Heart size={20} className="stroke-[2.5] fill-current text-opacity-10" />
                  <span className="text-[10px] mt-0.5">พื้นที่แก๊ง</span>
                </NavLink>
              </nav>
            </>
          )}

        </div>
      </div>
    </Router>
  )
}
