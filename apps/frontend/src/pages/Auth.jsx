import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Mail, Lock, UserPlus, LogIn, Heart, CheckCircle2, AlertCircle, User } from 'lucide-react'

export default function Auth() {
  const { login, register } = useStore()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [gender, setGender] = useState('female')
  const [weightKg, setWeightKg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    const nameTrimmed = username.trim()
    if (!nameTrimmed || !password) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วนค่ะ')
      return
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setErrorMsg('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้งค่ะ')
        return
      }
      const parsedWeight = parseFloat(weightKg)
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        setErrorMsg('กรุณากรอกน้ำหนักตัวให้ถูกต้องด้วยค่ะ ⚖️')
        return
      }
    }

    // Format username to email under the hood for backend compatibility
    let formattedEmail = nameTrimmed
    if (!formattedEmail.includes('@')) {
      // Clean username from invalid characters for email prefix
      const cleanPrefix = nameTrimmed.toLowerCase().replace(/[^a-z0-9._-]/g, '')
      if (!cleanPrefix) {
        setErrorMsg('ชื่อผู้ใช้ควรประกอบด้วยอักษรภาษาอังกฤษหรือตัวเลขเท่านั้นค่ะ')
        return
      }
      formattedEmail = `${cleanPrefix}@pinkfit.com`
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        await login(formattedEmail, password)
        setSuccessMsg('เข้าสู่ระบบสำเร็จแล้วค่ะ! 🌸')
      } else {
        await register(formattedEmail, password, gender, weightKg)
        setSuccessMsg('สมัครสมาชิกและเข้าสู่ระบบสำเร็จแล้วค่ะ! ✨')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อหลังบ้าน กรุณาลองใหม่อีกครั้งค่ะ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] py-4">
      {/* Brand Icon & Welcome */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pastel-pink-soft/80 text-pastel-pink-deep text-3xl shadow-cute mb-3 animate-bounce">
          🌸
        </div>
        <h1 className="text-2xl font-bold text-pastel-text">
          {isLogin ? 'ยินดีต้อนรับสู่ PinkFit ✨' : 'เข้าร่วมแก๊งชมพูพาสเทล 🌸'}
        </h1>
        <p className="text-sm text-pastel-muted mt-1.5 px-4">
          {isLogin 
            ? 'มาดูแลสุขภาพ บันทึกการวิ่ง และวิเคราะห์อาหารด้วยกันนะคะ!' 
            : 'กรอกแค่ชื่อผู้ใช้และรหัสผ่านก็พร้อมฟิตแล้วค่ะ'}
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="cute-card w-full max-w-sm bg-white/95">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-cute p-3 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-cute p-3 text-xs flex items-start gap-2">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Username / Nickname field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-pastel-text/80 pl-1">ชื่อผู้ใช้ / ชื่อเล่น</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pastel-muted">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="เช่น bunny, sarunrat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="cute-input"
                style={{ paddingLeft: '2.5rem' }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-pastel-text/80 pl-1">รหัสผ่าน</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pastel-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cute-input"
                style={{ paddingLeft: '2.5rem' }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password field (Only Register) */}
          {!isLogin && (
            <div className="space-y-1 animate-slide-down">
              <label className="text-xs font-bold text-pastel-text/80 pl-1">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pastel-muted">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="cute-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Gender and Weight fields (Only Register) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 animate-slide-down">
              <div className="space-y-1">
                <label className="text-xs font-bold text-pastel-text/80 pl-1">เพศ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="cute-input cursor-pointer"
                  disabled={isLoading}
                  required
                >
                  <option value="female">หญิง 👩</option>
                  <option value="male">ชาย 👨</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pastel-text/80 pl-1">น้ำหนัก (กก.)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="เช่น 52"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="cute-input"
                  min="20"
                  max="200"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="cute-button-primary w-full mt-2 cursor-pointer disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                กำลังดำเนินการ...
              </span>
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                <span>เข้าสู่ระบบ</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>สมัครสมาชิก</span>
              </>
            )}
          </button>
        </form>

        {/* Form Toggle Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-pastel-pink-soft/30" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white/70 text-pastel-muted">หรือ</span>
          </div>
        </div>

        {/* Toggle Form Mode Button */}
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setErrorMsg('')
            setSuccessMsg('')
          }}
          className="cute-button-secondary w-full text-xs py-2 cursor-pointer"
          disabled={isLoading}
        >
          {isLogin ? 'สร้างบัญชีผู้ใช้ใหม่ 🌸' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ 🎀'}
        </button>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 flex items-center gap-1 text-[11px] text-pastel-muted">
        <span>PinkFit 2026</span>
        <Heart size={8} className="fill-pastel-pink-deep text-pastel-pink-deep" />
        <span>สร้างด้วยความรักสำหรับชาวพาสเทล</span>
      </div>
    </div>
  )
}
