import React, { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { Camera, Image, Check, RefreshCw, Sparkles, Edit3, Clipboard, ChevronDown, ChevronUp } from 'lucide-react'

export default function FoodSnap() {
  const { addNutritionLog, foodSnap, setFoodSnap, runFoodSnapAnalysis, estimateNutritionFromText } = useStore()
  const { imagePreview, isAnalyzing, analysisResult, manualFoodName, manualCalories, manualProtein } = foodSnap
  const fileInputRef = useRef(null)

  // Track the text input before we query the backend estimation
  const [typedName, setTypedName] = useState('')
  const [showManualForm, setShowManualForm] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFoodSnap({
          imagePreview: reader.result,
          analysisResult: null,
          manualFoodName: '',
          manualCalories: '',
          manualProtein: ''
        })
        setShowManualForm(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Opens the simplified name-only text entry mode
  const openManualNameMode = () => {
    setShowManualForm(true)
    setTypedName('')
    setFoodSnap({
      analysisResult: null,
      manualFoodName: '',
      manualCalories: '',
      manualProtein: ''
    })
  }

  const handleTextEstimateSubmit = (e) => {
    e.preventDefault()
    if (!typedName || !typedName.trim()) {
      alert('กรุณากรอกชื่ออาหารก่อนน้า! 🌸')
      return
    }
    estimateNutritionFromText(typedName)
  }

  const handleSaveToLog = () => {
    if (!manualFoodName) {
      alert('กรุณาระบุชื่ออาหารก่อนจ้า! 🌸')
      return
    }
    
    addNutritionLog({
      foodName: manualFoodName,
      calories: parseInt(manualCalories || 0),
      proteinAmount: parseInt(manualProtein || 0),
      imageUrl: imagePreview || ''
    })

    // Reset everything
    setFoodSnap({
      imagePreview: null,
      analysisResult: null,
      manualFoodName: '',
      manualCalories: '',
      manualProtein: ''
    })
    setTypedName('')
    setShowManualForm(false)
    setShowAdvanced(false)
    
    alert('บันทึกข้อมูลอาหารเรียบร้อยแล้วน้า! 🎉')
  }

  const handleCancel = () => {
    setFoodSnap({
      imagePreview: null,
      analysisResult: null,
      manualFoodName: '',
      manualCalories: '',
      manualProtein: ''
    })
    setTypedName('')
    setShowManualForm(false)
    setShowAdvanced(false)
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-pastel-text flex items-center justify-center gap-2">
          <span>📸</span> Food Snap (บันทึกอาหาร)
        </h2>
        <p className="text-sm text-pastel-muted font-semibold">
          {isAnalyzing 
            ? "กำลังประมวลผลอยู่ด้านหลัง... สลับไปหน้ารายงานวิ่งหรือแชทแก๊งรอได้เลยจ้า 🌸"
            : "พิมพ์จดเฉพาะชื่อเมนู หรือสแกนภาพถ่ายผ่านกล้องด้วย AI ตัวฟรี"}
        </p>
      </div>

      {/* Main Snap/Input Area */}
      {!showManualForm && !analysisResult && !isAnalyzing && (
        <div className="cute-card flex flex-col items-center justify-center min-h-[250px] bg-white/80 border-dashed border-2 border-pastel-pink-soft">
          {imagePreview ? (
            <div className="w-full space-y-4">
              <div className="relative rounded-cute overflow-hidden aspect-video max-h-60 bg-pastel-cream flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="h-full object-cover" />
                <button 
                  onClick={() => setFoodSnap({ imagePreview: null, analysisResult: null })}
                  className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors text-xs font-bold"
                >
                  ✕ ลบรูป
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={runFoodSnapAnalysis}
                  className="cute-button-primary py-3 text-xs md:text-sm"
                >
                  <Sparkles size={16} className="animate-pulse" />
                  สแกนรูปด้วย AI
                </button>
                <button 
                  onClick={openManualNameMode}
                  className="cute-button-secondary py-3 text-xs md:text-sm border border-pastel-pink-soft"
                >
                  <Edit3 size={16} />
                  พิมพ์ชื่ออาหารเอง
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-5 p-6 w-full">
              <div className="mx-auto w-20 h-20 bg-pastel-pink-soft/40 rounded-full flex items-center justify-center text-pastel-pink-deep animate-float-gentle">
                <Camera size={36} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-pastel-text">แชะรูปอาหารมื้ออร่อย</p>
                <p className="text-xs text-pastel-muted font-bold">เลือกอัปโหลดรูปภาพเพื่อแชะวิเคราะห์</p>
              </div>
              
              <div className="flex flex-col gap-2 items-center justify-center w-full max-w-xs mx-auto">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
                <button 
                  onClick={triggerFileInput}
                  className="cute-button-secondary w-full py-2.5 text-sm border border-pastel-pink-soft"
                >
                  <Image size={16} />
                  อัปโหลดรูปภาพ
                </button>
                
                <div className="w-full flex items-center justify-center gap-2 py-1.5">
                  <div className="h-[1px] bg-pastel-pink-soft/40 flex-1"></div>
                  <span className="text-[10px] text-pastel-muted font-black">หรือ</span>
                  <div className="h-[1px] bg-pastel-pink-soft/40 flex-1"></div>
                </div>

                <button 
                  onClick={openManualNameMode}
                  className="w-full text-xs text-pastel-pink-deep hover:text-pastel-pink-hot font-bold flex items-center justify-center gap-1 bg-pastel-pink-soft/20 px-4 py-2.5 rounded-cute border border-pastel-pink-soft/30 hover:bg-pastel-pink-soft/50 transition-all duration-200"
                >
                  <Clipboard size={14} />
                  พิมพ์จดชื่อเมนูเองอย่างเดียว 📝
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="cute-card min-h-[250px] bg-white/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pastel-pink-soft border-t-pastel-pink-deep rounded-full animate-spin" />
          <div className="space-y-1">
            <h4 className="font-bold text-pastel-text text-lg flex items-center gap-1.5 justify-center">
              <Sparkles className="text-yellow-400 fill-yellow-100 animate-pulse" size={16} />
              AI กำลังประเมินและวิเคราะห์มื้ออาหาร...
            </h4>
            <p className="text-xs text-pastel-muted font-bold leading-relaxed">
              คำนวณแคลอรีและโปรตีนผ่านโครงสร้างข้อมูล Gemini API<br/>
              <span className="text-pastel-pink-deep animate-pulse">กดสลับไปหน้ารายงานวิ่งหรือแชทแก๊งรอได้เลยจ้า!</span>
            </p>
          </div>
        </div>
      )}

      {/* Name Input Mode (Simplified Manual Step 1) */}
      {showManualForm && !analysisResult && !isAnalyzing && (
        <div className="cute-card space-y-4 bg-white/90">
          <h3 className="font-bold text-pastel-text text-lg flex items-center gap-1.5 border-b border-pastel-pink-soft/10 pb-2">
            <span>📝</span> พิมพ์ชื่ออาหารที่ทาน
          </h3>
          
          <form onSubmit={handleTextEstimateSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-pastel-muted">ชื่ออาหาร (พิมพ์เฉพาะชื่อเท่านั้น)</label>
              <input 
                type="text" 
                placeholder="เช่น ข้าวกะเพราอกไก่ไข่ดาว, เวย์โปรตีนกล้วยหอม" 
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="cute-input font-bold" 
                required
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="cute-button-secondary flex-1 py-2.5 border border-pastel-pink-soft"
              >
                ย้อนกลับ
              </button>
              <button 
                type="submit" 
                className="cute-button-primary flex-1 py-2.5"
              >
                <Sparkles size={16} />
                ประเมินสารอาหาร 🪄
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results Output Screen (Verification & Save) */}
      {analysisResult && !isAnalyzing && (
        <div className="cute-card space-y-4 bg-gradient-to-b from-white to-pastel-pink-light/20 animate-fade-in">
          <div className="flex items-center justify-between border-b border-pastel-pink-soft/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-pastel-green-dark/30 text-emerald-600 rounded-full text-base">
                🏆
              </span>
              <div>
                <h3 className="font-bold text-pastel-text">ประมาณการโภชนาการ</h3>
                <p className="text-xs text-pastel-muted">คำนวณและประเมินสำเร็จเรียบร้อย</p>
              </div>
            </div>
            {analysisResult.confidence && (
              <span className="text-[10px] bg-pastel-pink-soft text-pastel-pink-deep px-2 py-0.5 rounded-full font-bold">
                AI Match: {(analysisResult.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-pastel-muted">ชื่ออาหาร</label>
              <input 
                type="text" 
                value={manualFoodName} 
                onChange={(e) => setFoodSnap({ manualFoodName: e.target.value })}
                className="cute-input font-bold" 
                required
              />
            </div>

            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 gap-4 bg-white/50 p-4 rounded-cute border border-pastel-pink-soft/10 text-center">
              <div>
                <div className="text-[10px] text-pastel-muted font-bold">โปรตีนประมาณการ</div>
                <div className="text-xl font-black text-pastel-text mt-1">{manualProtein} กรัม</div>
              </div>
              <div>
                <div className="text-[10px] text-pastel-muted font-bold">พลังงานประมาณการ</div>
                <div className="text-xl font-black text-pastel-text mt-1">{manualCalories} kcal</div>
              </div>
            </div>

            {/* Advanced Settings Collapsible Toggle */}
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-pastel-muted hover:text-pastel-pink-deep font-bold flex items-center justify-center gap-1 mx-auto"
            >
              {showAdvanced ? (
                <>ซ่อนค่าโภชนาการละเอียด <ChevronUp size={12} /></>
              ) : (
                <>แก้ไขตัวเลขโภชนาการเพิ่มเติม <ChevronDown size={12} /></>
              )}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-pastel-pink-soft/10 rounded-cute border border-pastel-pink-soft/20 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pastel-muted">แก้ไขโปรตีน (กรัม)</label>
                  <input 
                    type="number" 
                    value={manualProtein} 
                    onChange={(e) => setFoodSnap({ manualProtein: e.target.value })}
                    className="cute-input py-1 px-3 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pastel-muted">แก้ไขพลังงาน (kcal)</label>
                  <input 
                    type="number" 
                    value={manualCalories} 
                    onChange={(e) => setFoodSnap({ manualCalories: e.target.value })}
                    className="cute-input py-1 px-3 text-sm" 
                  />
                </div>
              </div>
            )}

            {analysisResult.remarks && (
              <div className="bg-white/60 p-3 rounded-cute border border-pastel-pink-soft/20 text-xs text-pastel-muted leading-relaxed">
                💡 <strong>คำแนะนำโภชนาการ:</strong> {analysisResult.remarks}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleCancel} 
                className="cute-button-secondary flex-1 py-2.5 border border-pastel-pink-soft"
              >
                ✕ ยกเลิก
              </button>
              <button 
                onClick={handleSaveToLog} 
                className="cute-button-primary flex-1 py-2.5 font-bold"
              >
                <Check size={16} />
                บันทึกเข้าประวัติแก๊ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
