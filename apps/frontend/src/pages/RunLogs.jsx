import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Activity, Plus, TrendingUp, Calendar, Compass, Heart, RefreshCw, Camera } from 'lucide-react'

export default function RunLogs() {
  const { user, runLogs, addRunLog, uploadRunSnap } = useStore()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [distance, setDistance] = useState('')
  const [pace, setPace] = useState('')
  const [hr, setHr] = useState('')
  const [cadence, setCadence] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsAnalyzing(true)
    setAnalysisError('')

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result
        await uploadRunSnap(base64Data)
        alert('วิเคราะห์ภาพและบันทึกข้อมูลการวิ่งสำเร็จแล้วจ้า! 🏃‍♀️💨')
      } catch (err) {
        console.error(err)
        setAnalysisError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ภาพวิ่ง')
        alert('เกิดข้อผิดพลาด: ' + (err.message || 'วิเคราะห์ภาพล้มเหลว'))
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Quick validation of Pace format (e.g. 5:30)
    if (!/^\d+:\d{2}$/.test(pace)) {
      alert('กรุณากรอกเพสในรูปแบบ นาที:วินาที เช่น 6:15 น้า!')
      return
    }

    addRunLog({
      date,
      distance: parseFloat(distance),
      pace,
      hr: parseInt(hr),
      cadence: parseInt(cadence)
    })

    // Reset Form
    setDate(new Date().toISOString().split('T')[0])
    setDistance('')
    setPace('')
    setHr('')
    setCadence('')
    setShowAddForm(false)

    alert('บันทึกการวิ่งแล้วจ้า วิ่งเก่งมากๆ! 🏃‍♀️💨')
  }

  // Get fatigue color coding
  const getFatigueColor = (score) => {
    if (score <= 3.5) return 'bg-emerald-50 text-emerald-600 border-emerald-200'
    if (score <= 6.5) return 'bg-amber-50 text-amber-600 border-amber-200'
    return 'bg-rose-50 text-rose-600 border-rose-200'
  }

  const getFatigueLabel = (score) => {
    if (score <= 3.5) return 'เบาๆ สบาย (Easy/Recovery)'
    if (score <= 6.5) return 'ปานกลาง ตึงกระชับ (Moderate)'
    return 'หนักหน่วง ล้าสะสม (Hard/Intense)'
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-pastel-text flex items-center gap-2">
            <span>🏃‍♀️</span> Run Logs (บันทึกการวิ่ง)
          </h2>
          <p className="text-sm text-pastel-muted">บันทึกสถิติและวิเคราะห์ดัชนีความเหนื่อยล้าสะสม</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="cute-button-primary py-2.5 px-4 text-sm"
        >
          <Plus size={16} />
          เพิ่มรอบวิ่ง
        </button>
      </div>

      {/* Fatigue Info Callout */}
      <div className="bg-pastel-pink-soft/30 border border-pastel-pink-soft/50 p-4 rounded-cute text-xs text-pastel-text leading-relaxed flex gap-2">
        <Activity size={24} className="text-pastel-pink-deep shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>ดัชนีความเหนื่อยล้า (Fatigue Score) 📈</strong>
          <p>ระบบจะคำนวณจากอัตราการเต้นหัวใจ ระยะทาง และเพสวิ่งโดยอัตโนมัติ เพื่อช่วยประเมินความล้าของกล้ามเนื้อ ป้องกันอาการบาดเจ็บสะสม และแนะนำจังหวะการพักผ่อนของคู่รักคุณ</p>
        </div>
      </div>

      {/* AI Run Snap Card */}
      <div className="cute-card space-y-4 bg-gradient-to-r from-pastel-pink-soft/30 via-white to-white border-pastel-pink-soft/50 p-5">
        <div className="flex justify-between items-center border-b border-pastel-pink-soft/20 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-pastel-text">
            <span className="text-xl">📸</span>
            <span>วิเคราะห์ผลวิ่งด้วย AI (AI Run Snap)</span>
          </div>
          {isAnalyzing ? (
            <span className="text-[10px] bg-pastel-pink-soft text-pastel-pink-deep font-bold px-2.5 py-0.5 rounded-full border border-pastel-pink-soft flex items-center gap-1 animate-pulse">
              <RefreshCw size={11} className="animate-spin" />
              กำลังวิเคราะห์...
            </span>
          ) : (
            <span className="text-[10px] bg-pastel-pink-soft/40 text-pastel-pink-deep font-bold px-2.5 py-0.5 rounded-full border border-pastel-pink-soft/30">
              พร้อมใช้งาน ✨
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-pastel-muted">
          <p className="flex-1 leading-relaxed">
            อัปโหลดภาพหน้าจอสรุปการวิ่งจาก Apple Fitness, Garmin, Coros หรือแอปสุขภาพอื่นๆ ให้ AI สกัดข้อมูลระยะทาง เพส หัวใจ รอบขา และคำนวณระดับความล้า (Fatigue Score) ให้อัตโนมัติค่ะ 🌸
          </p>
          
          <div className="shrink-0 flex items-center">
            <label className="cute-button-primary py-2 px-3 text-[11px] shadow-cute cursor-pointer flex items-center gap-1.5 transition-all duration-200">
              <Camera size={13} className="stroke-[2.5]" />
              <span>อัปโหลดรูปผลวิ่ง</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isAnalyzing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {analysisError && (
          <div className="text-[11px] text-red-500 bg-red-50/50 border border-red-100 rounded-cute p-2 animate-shake">
            ⚠️ {analysisError}
          </div>
        )}
      </div>

      {/* Add Run Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-pastel-cream border border-pastel-pink-soft rounded-cute-lg shadow-cute-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-pastel-text flex items-center gap-2">
              <span>🏃‍♂️</span> เพิ่มข้อมูลรอบวิ่งใหม่
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-pastel-muted font-semibold">วันที่วิ่ง</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="cute-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pastel-muted font-semibold">ระยะทาง (กิโลเมตร)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="เช่น 5.2"
                    value={distance} 
                    onChange={e => setDistance(e.target.value)} 
                    className="cute-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pastel-muted font-semibold">เพส (นาที:วินาที)</label>
                  <input 
                    type="text" 
                    placeholder="เช่น 6:15"
                    value={pace} 
                    onChange={e => setPace(e.target.value)} 
                    className="cute-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pastel-muted font-semibold">หัวใจเฉลี่ย (BPM)</label>
                  <input 
                    type="number" 
                    placeholder="เช่น 145"
                    value={hr} 
                    onChange={e => setHr(e.target.value)} 
                    className="cute-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pastel-muted font-semibold">รอบขาเฉลี่ย (Cadence)</label>
                  <input 
                    type="number" 
                    placeholder="เช่น 172"
                    value={cadence} 
                    onChange={e => setCadence(e.target.value)} 
                    className="cute-input"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="cute-button-secondary flex-1 py-2.5"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="cute-button-primary flex-1 py-2.5"
                >
                  บันทึกข้อมูลวิ่ง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Runs List */}
      <div className="space-y-4">
        {runLogs.length === 0 ? (
          <div className="cute-card text-center p-12 text-pastel-muted bg-white/60">
            <p>ยังไม่มีรอบวิ่งที่ถูกบันทึก 🌸</p>
            <p className="text-xs mt-1">เริ่มขยับร่างกายแล้วแอดบันทึกรอบแรกได้เลย!</p>
          </div>
        ) : (
          runLogs.map((run) => (
            <div key={run.id} className="cute-card bg-white/80 border border-pastel-pink-soft/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pastel-pink-soft/30 text-pastel-pink-deep flex items-center justify-center font-bold text-lg">
                  🥇
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pastel-text text-lg">{run.distance} กิโลเมตร</span>
                    <span className="text-xs text-pastel-muted flex items-center gap-0.5">
                      <Calendar size={12} />
                      {run.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-pastel-muted">
                    <span className="flex items-center gap-1"><Compass size={12} /> เพส: {run.pace}</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> หัวใจ: {run.hr} bpm</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> รอบขา: {run.cadence}</span>
                  </div>
                </div>
              </div>

              {/* Fatigue Badge */}
              <div className={`p-3 rounded-cute border text-xs font-bold text-center w-full md:w-auto ${getFatigueColor(run.fatigueScore)}`}>
                <div className="text-[10px] uppercase tracking-wider text-opacity-80">Fatigue Score</div>
                <div className="text-lg font-black">{run.fatigueScore} / 10</div>
                <div className="text-[9px] mt-0.5 font-medium">{getFatigueLabel(run.fatigueScore)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
