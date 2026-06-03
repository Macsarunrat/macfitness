import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Heart, Activity, User, ChevronRight, Award, Plus, Sparkles, Smile, Users, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { user, group, groupMembers, runLogs, nutritionLogs, updateProfile } = useStore()
  
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [height, setHeight] = useState(user?.height || 165)
  const [weightKg, setWeightKg] = useState(user?.weightKg || 50)
  const [gender, setGender] = useState(user?.gender || 'female')
  const [injury, setInjury] = useState(user?.injuryHistory || 'None')

  useEffect(() => {
    if (user) {
      setHeight(user.height || 165)
      setWeightKg(user.weightKg || 50)
      setGender(user.gender || 'female')
      setInjury(user.injuryHistory || 'None')
    }
  }, [user, showEditProfile])

  const todayStr = new Date().toISOString().split('T')[0]
  
  // My metrics
  const myTodayFood = nutritionLogs.filter(log => log.userId === user?.id && log.date === todayStr)
  const myProtein = myTodayFood.reduce((sum, item) => sum + item.proteinAmount, 0)
  const myCalories = myTodayFood.reduce((sum, item) => sum + item.calories, 0)

  const myRuns = runLogs.filter(log => log.userId === user?.id)
  const totalDistance = myRuns.reduce((sum, run) => sum + run.distance, 0).toFixed(1)

  const ranToday = user?.isTrainingDay !== undefined ? user.isTrainingDay : runLogs.some(log => log.userId === user?.id && log.date === todayStr)
  const myTargetProtein = user?.targetProteinToday !== undefined ? user.targetProteinToday : (ranToday ? (user?.targetProteinTraining || 80) : (user?.targetProteinRest || 60))

  const handleSaveProfile = (e) => {
    e.preventDefault()
    updateProfile({
      height: parseInt(height),
      weightKg: parseFloat(weightKg),
      gender: gender,
      injuryHistory: injury
    })
    setShowEditProfile(false)
  }

  // Calculate metrics for other members
  const getMemberStats = (memberId, member) => {
    const foodToday = nutritionLogs.filter(log => log.userId === memberId && log.date === todayStr)
    const protein = foodToday.reduce((sum, item) => sum + item.proteinAmount, 0)
    const calories = foodToday.reduce((sum, item) => sum + item.calories, 0)
    const runs = runLogs.filter(log => log.userId === memberId)
    const lastRun = runs.length > 0 ? runs[runs.length - 1] : null
    
    const ranToday = member.isTrainingDay !== undefined ? member.isTrainingDay : runLogs.some(log => log.userId === memberId && log.date === todayStr)
    const targetProtein = member.targetProteinToday !== undefined ? member.targetProteinToday : (ranToday ? (member.targetProteinTraining || 80) : (member.targetProteinRest || 60))
    
    return { protein, calories, lastRun, targetProtein, ranToday }
  }

  const quotes = [
    "พวกเราเก่งมากเลยนะวันนี้! 🌸",
    "อย่าลืมเตือนเพื่อนดื่มน้ำด้วยน้า 🥤",
    "ออกกำลังกายกลุ่มเล็ก ได้สุขภาพก้อนใหญ่ 🏃‍♀️",
    "ป้ายยาเมนูโปรตีนให้เพื่อนๆ ในแก๊งกัน! 🍳",
    "ก้าวไปด้วยกัน แข็งแรงไปด้วยกัน 💖"
  ]
  const randomQuote = quotes[new Date().getDate() % quotes.length]

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-pastel-pink-soft via-white to-pastel-purple-light p-6 rounded-cute-lg shadow-cute flex items-center justify-between border border-white/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <h1 className="text-2xl font-bold text-pastel-text">สวัสดีจ้า, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Bunny'}</h1>
          </div>
          <p className="text-sm text-pastel-muted font-medium flex items-center gap-1">
            <Sparkles size={14} className="text-pastel-pink-deep animate-pulse" />
            {randomQuote}
          </p>
        </div>
        <button 
          onClick={() => setShowEditProfile(true)}
          className="p-3 bg-white/80 hover:bg-white text-pastel-pink-deep hover:text-pastel-pink-hot rounded-full shadow-cute-sm border border-pastel-pink-soft transition-all duration-200"
        >
          <User size={20} />
        </button>
      </div>

      {/* Main Status Grid */}
      <div className="space-y-6">
        
        {/* User My Stats Card */}
        <div className="cute-card space-y-5 bg-gradient-to-b from-white/90 to-pastel-pink-light/30 border border-pastel-pink-soft/40">
          <div className="flex justify-between items-center border-b border-pastel-pink-soft/20 pb-3">
            <div className="flex items-center gap-2 font-bold text-lg text-pastel-text">
              <Smile className="text-pastel-pink-deep" size={20} />
              <span>ความคืบหน้าของฉัน (วันนี้)</span>
            </div>
            <span className="text-xs bg-pastel-pink-soft text-pastel-pink-hot px-2.5 py-1 rounded-full font-bold">
              Me
            </span>
          </div>

          <div className="space-y-4">
            {/* Protein Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-pastel-muted">โปรตีนที่ได้รับ</span>
                <span className="text-pastel-text">
                  {myProtein}g / {myTargetProtein}g 
                  <span className="text-xs text-pastel-pink-deep ml-1.5 font-bold">
                    {ranToday ? '🏃‍♂️ โหมดวันซ้อม' : '🛋️ โหมดวันพัก'}
                  </span>
                </span>
              </div>
              <div className="w-full bg-pastel-grey rounded-full h-3.5 overflow-hidden shadow-inner-soft">
                <div 
                  className="bg-pastel-pink-deep h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, (myProtein / myTargetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Calories Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-pastel-muted">แคลอรีที่บริโภค</span>
                <span className="text-pastel-text">{myCalories} kcal</span>
              </div>
              <div className="w-full bg-pastel-grey rounded-full h-3.5 overflow-hidden shadow-inner-soft">
                <div 
                  className="bg-pastel-peach-dark h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, (myCalories / 2000) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pastel-pink-soft/10 text-center">
            <div className="bg-white/60 p-2.5 rounded-cute-sm">
              <div className="text-xs text-pastel-muted font-bold">ส่วนสูง</div>
              <div className="text-sm font-bold text-pastel-text">{user?.height || '-'} cm</div>
            </div>
            <div className="bg-white/60 p-2.5 rounded-cute-sm">
              <div className="text-xs text-pastel-muted font-bold">น้ำหนัก</div>
              <div className="text-sm font-bold text-pastel-text">{user?.weightKg || '-'} kg</div>
            </div>
            <div className="bg-white/60 p-2.5 rounded-cute-sm">
              <div className="text-xs text-pastel-muted font-bold">วิ่งสะสม</div>
              <div className="text-sm font-bold text-pastel-text">{totalDistance} km</div>
            </div>
          </div>
        </div>

        {/* Squad Status Header */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-pastel-text flex items-center gap-2 text-lg">
              <Users size={20} className="text-pastel-pink-deep" />
              <span>{group ? group.name : 'เพื่อนๆ ในแก๊ง'} ({groupMembers.length} คน)</span>
            </h3>
            {group && (
              <span className="text-[10px] bg-pastel-purple text-pastel-pink-hot font-bold px-2 py-1 rounded-full border border-pastel-pink-soft">
                Code: {group.inviteCode}
              </span>
            )}
          </div>

          {groupMembers.length === 0 ? (
            <div className="cute-card text-center p-8 bg-white/50 text-pastel-muted">
              ยังไม่มีสมาชิกคนอื่นเข้าร่วมแก๊งในตอนนี้เลยน้า 🌸
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupMembers.map((member) => {
                const stats = getMemberStats(member.id, member)
                
                return (
                  <div key={member.id} className="cute-card space-y-4 bg-gradient-to-b from-white/95 to-pastel-grey-light/10 border border-pastel-pink-soft/10">
                    {/* Member Profile */}
                    <div className="flex items-center justify-between border-b border-pastel-pink-soft/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{member.avatar || '🐰'}</span>
                        <span className="font-bold text-pastel-text">{member.name}</span>
                      </div>
                      {member.injuryHistory !== 'None' && member.injuryHistory && (
                        <div className="flex items-center gap-0.5 text-[9px] bg-red-50 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-100">
                          <AlertTriangle size={10} />
                          <span>เจ็บสะสม</span>
                        </div>
                      )}
                    </div>

                    {/* Member Stats progress */}
                    <div className="space-y-3">
                      {/* Protein */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-pastel-muted">โปรตีน</span>
                          <span className="text-pastel-text">
                            {stats.protein}g / {stats.targetProtein}g
                            <span className="text-[10px] text-pastel-pink-deep ml-1 font-bold">
                              ({stats.ranToday ? '🏃‍♂️ ซ้อม' : '🛋️ พัก'})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-pastel-grey rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-pastel-purple-deep h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (stats.protein / stats.targetProtein) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Calories */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-pastel-muted">พลังงาน</span>
                          <span className="text-pastel-text">{stats.calories} kcal</span>
                        </div>
                        <div className="w-full bg-pastel-grey rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-pastel-peach-dark h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (stats.calories / 2200) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Info details */}
                    <div className="text-[10px] text-pastel-muted flex justify-between pt-1 border-t border-pastel-pink-soft/5">
                      <span>อาการเจ็บ: <strong>{member.injuryHistory}</strong></span>
                      {stats.lastRun && (
                        <span>วิ่งล่าสุด: <strong>{stats.lastRun.distance} km</strong></span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Health Info Tip */}
      <div className="cute-card bg-gradient-to-r from-pastel-cream via-white to-white">
        <h3 className="font-bold text-pastel-text flex items-center gap-2 mb-2">
          <Award size={18} className="text-yellow-400 fill-yellow-100" />
          <span>บอร์ดเตือนอาการเจ็บปวดเพื่อนๆ 🩹</span>
        </h3>
        <div className="text-xs text-pastel-muted space-y-1.5 leading-relaxed">
          {groupMembers.filter(m => m.injuryHistory !== 'None').map(m => (
            <p key={m.id}>⚠️ <strong>{m.name}:</strong> กำลังเจ็บปวดที่ "{m.injuryHistory}" (เพื่อนๆ อย่าเพิ่งลากไปซ้อมโหดน้า)</p>
          ))}
          {groupMembers.filter(m => m.injuryHistory !== 'None').length === 0 && (
            <p>🎉 ยินดีด้วยจ้า! เพื่อนๆ ทุกคนในทีมมีสภาพร่างกายที่สมบูรณ์แข็งแรงดี พร้อมลุยทุกเซสชัน!</p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-pastel-cream border border-pastel-pink-soft rounded-cute-lg shadow-cute-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-pastel-text flex items-center gap-2">
              <span>📝</span> แก้ไขข้อมูลส่วนตัว
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pastel-muted">ส่วนสูง (cm)</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={e => setHeight(e.target.value)} 
                    className="cute-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pastel-muted">น้ำหนัก (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={weightKg} 
                    onChange={e => setWeightKg(e.target.value)} 
                    className="cute-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pastel-muted">เพศ</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="cute-input cursor-pointer"
                  required
                >
                  <option value="female">หญิง 👩</option>
                  <option value="male">ชาย 👨</option>
                </select>
              </div>

              <div className="bg-white/80 p-3 rounded-cute border border-pastel-pink-soft/30 text-xs text-pastel-text space-y-1">
                <div className="font-bold text-pastel-pink-deep">💡 คำนวณเป้าหมายโปรตีนอัตโนมัติ:</div>
                <div className="flex justify-between">
                  <span>เป้าหมายวันพัก (Rest Day):</span>
                  <span className="font-bold text-pastel-text">
                    {(parseFloat(weightKg || 0) * (gender === 'female' ? 1.0 : 1.2)).toFixed(1)} กรัม
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>เป้าหมายวันซ้อม (Run Day):</span>
                  <span className="font-bold text-pastel-text">
                    {(parseFloat(weightKg || 0) * (gender === 'female' ? 1.4 : 1.5)).toFixed(1)} กรัม
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pastel-muted">ประวัติการบาดเจ็บ / อาการบาดเจ็บสะสม</label>
                <textarea 
                  value={injury} 
                  onChange={e => setInjury(e.target.value)} 
                  className="cute-input h-20 resize-none py-2"
                  placeholder="เช่น ปวดเข่าขวาตึงๆ, ไม่มี"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditProfile(false)} 
                  className="cute-button-secondary flex-1 py-2.5"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="cute-button-primary flex-1 py-2.5"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
