import { create } from 'zustand'

const DEFAULT_USER = {
  id: 1,
  email: 'cute.bunny@pinkfit.com',
  name: 'Bunny (You)',
  role: 'user',
  height: 165,
  weight: 52,
  injuryHistory: 'None',
  targetProtein: 80,
}

const DEFAULT_MEMBERS = [
  {
    id: 2,
    email: 'teddy.bear@pinkfit.com',
    name: 'Teddy',
    role: 'user',
    height: 180,
    weight: 75,
    injuryHistory: 'Slight knee soreness',
    targetProtein: 120,
    avatar: '🐻'
  },
  {
    id: 3,
    email: 'kitty.cat@pinkfit.com',
    name: 'Kitty',
    role: 'user',
    height: 160,
    weight: 48,
    injuryHistory: 'None',
    targetProtein: 90,
    avatar: '🐱'
  },
  {
    id: 4,
    email: 'puppy.dog@pinkfit.com',
    name: 'Puppy',
    role: 'user',
    height: 175,
    weight: 68,
    injuryHistory: 'Ankle pain',
    targetProtein: 100,
    avatar: '🐶'
  }
]

const DEFAULT_RUNS = [
  { id: 101, userId: 1, date: '2026-06-01', distance: 5.2, pace: '6:15', hr: 145, cadence: 172, fatigueScore: 4.5 },
  { id: 102, userId: 1, date: '2026-06-02', distance: 3.5, pace: '6:30', hr: 138, cadence: 168, fatigueScore: 3.0 },
  { id: 103, userId: 2, date: '2026-06-02', distance: 8.0, pace: '5:45', hr: 155, cadence: 180, fatigueScore: 7.2 },
  { id: 104, userId: 3, date: '2026-06-03', distance: 4.0, pace: '6:00', hr: 142, cadence: 170, fatigueScore: 3.8 }
]

const DEFAULT_FOOD = [
  { id: 201, userId: 1, date: '2026-06-03', imageUrl: '', foodName: 'Strawberry Yogurt Bowl', proteinAmount: 18, calories: 320 },
  { id: 202, userId: 1, date: '2026-06-03', imageUrl: '', foodName: 'Salmon & Avocado Salad', proteinAmount: 32, calories: 450 },
  { id: 203, userId: 2, date: '2026-06-03', imageUrl: '', foodName: 'Chicken Breast & Brown Rice', proteinAmount: 45, calories: 600 },
  { id: 204, userId: 3, date: '2026-06-03', imageUrl: '', foodName: 'Tofu Poke Bowl', proteinAmount: 25, calories: 410 },
  { id: 205, userId: 4, date: '2026-06-03', imageUrl: '', foodName: 'Protein Whey Shake', proteinAmount: 30, calories: 200 }
]

const DEFAULT_GROUP = {
  id: 501,
  name: 'แก๊งฟิตชมพูพาสเทล 🌸✨',
  inviteCode: 'PINK-FIT-SQUAD',
  creatorId: 1
}

// Safe parsing helper to prevent localStorage JSON corruption crashes
const safeJsonParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback
    // Handle cases where string literal was stored directly without quotes
    if (item === 'undefined') return fallback
    return JSON.parse(item)
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e)
    localStorage.removeItem(key)
    return fallback
  }
}

const mapUserProfile = (backendUser) => {
  if (!backendUser) return null
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name || backendUser.email.split('@')[0].toUpperCase(),
    role: backendUser.role,
    gender: backendUser.gender || 'female',
    weightKg: backendUser.weight_kg || backendUser.weightKg || 50.0,
    height: backendUser.height,
    injuryHistory: backendUser.injury_history || backendUser.injuryHistory || 'None',
    targetProteinRest: backendUser.target_protein_rest || backendUser.targetProteinRest || 60.0,
    targetProteinTraining: backendUser.target_protein_training || backendUser.targetProteinTraining || 80.0,
    targetProteinToday: backendUser.target_protein_today || backendUser.targetProteinToday || 60.0,
    isTrainingDay: backendUser.is_training_day !== undefined ? backendUser.is_training_day : (backendUser.isTrainingDay || false),
    stravaAthleteId: backendUser.strava_athlete_id || backendUser.stravaAthleteId || null
  }
}

export const useStore = create((set, get) => ({
  // Authentication State
  user: mapUserProfile(safeJsonParse('pinkfit_user', null)),
  group: safeJsonParse('pinkfit_group', null),
  groupMembers: safeJsonParse('pinkfit_members', []),
  token: localStorage.getItem('pinkfit_token') || null,
  
  // App Data
  runLogs: safeJsonParse('pinkfit_runs', []),
  nutritionLogs: safeJsonParse('pinkfit_food', []),
  
  // Global App States
  isOnline: true,
  isSyncing: false,
  apiEndpoint: (() => {
    if (typeof window === 'undefined') return 'http://localhost:8000'
    // Support production API environment variables
    if (import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL
    }
    // Fall back to the current window origin so Vite proxies requests locally (localhost, local IP, or ngrok)
    return window.location.origin
  })(),

  // Global background food snap states
  foodSnap: {
    imagePreview: null,
    isAnalyzing: false,
    analysisResult: null,
    manualFoodName: '',
    manualCalories: '',
    manualProtein: '',
  },

  setOnline: (online) => set({ isOnline: online }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  
  setFoodSnap: (updates) => set((state) => ({
    foodSnap: { ...state.foodSnap, ...updates }
  })),

  login: async (email, password) => {
    const { apiEndpoint } = get()
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)

    set({ isSyncing: true })
    try {
      const response = await fetch(`${apiEndpoint}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errMsg = errorData.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        if (errMsg === 'Incorrect email or password' || errMsg === 'Incorrect username or password') {
          errMsg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องค่ะ กรุณาตรวจสอบอีกครั้งนะคะ 🎀'
        }
        throw new Error(errMsg)
      }

      const data = await response.json()
      const token = data.access_token

      // Fetch profile
      const profileResponse = await fetch(`${apiEndpoint}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!profileResponse.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
      }
      const userProfile = await profileResponse.json()
      const mappedUser = mapUserProfile(userProfile)

      // Store in localStorage
      localStorage.setItem('pinkfit_token', token)
      localStorage.setItem('pinkfit_user', JSON.stringify(mappedUser))

      // Set state
      set({ user: mappedUser, token: token })
      
      // Load user logs and group
      await get().fetchLogs()
      await get().fetchGroup()
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อหลังบ้านได้ กรุณาตรวจสอบการเปิดเซิร์ฟเวอร์ (พอร์ต 8000) นะคะ 🔌')
      }
      throw err;
    } finally {
      set({ isSyncing: false })
    }
  },

  register: async (email, password, gender, weightKg) => {
    const { apiEndpoint } = get()
    set({ isSyncing: true })
    try {
      const response = await fetch(`${apiEndpoint}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          gender, 
          weight_kg: parseFloat(weightKg) 
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errMsg = errorData.detail || 'การสมัครสมาชิกล้มเหลว'
        if (errMsg === 'Email already registered' || errMsg === 'Username already registered') {
          errMsg = 'ชื่อผู้ใช้นี้ถูกลงทะเบียนไปแล้วค่ะ 🌸 ลองใช้ชื่ออื่นดูนะคะ'
        }
        throw new Error(errMsg)
      }

      // Auto-login after registration
      await get().login(email, password)
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อหลังบ้านได้ กรุณาตรวจสอบการเปิดเซิร์ฟเวอร์ (พอร์ต 8000) นะคะ 🔌')
      }
      throw err;
    } finally {
      set({ isSyncing: false })
    }
  },

  logout: () => {
    localStorage.removeItem('pinkfit_user')
    localStorage.removeItem('pinkfit_token')
    localStorage.removeItem('pinkfit_group')
    localStorage.removeItem('pinkfit_members')
    localStorage.removeItem('pinkfit_runs')
    localStorage.removeItem('pinkfit_food')
    set({ user: null, token: null, group: null, groupMembers: [], runLogs: [], nutritionLogs: [] })
  },

  fetchLogs: async () => {
    const { apiEndpoint, token } = get()
    if (!token) return

    try {
      const [runsRes, foodRes] = await Promise.all([
        fetch(`${apiEndpoint}/running/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiEndpoint}/nutrition/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      let runs = []
      let food = []

      if (runsRes.ok) {
        const runLogsData = await runsRes.json()
        runs = runLogsData.map(r => ({
          id: r.id,
          userId: r.user_id,
          date: r.date,
          distance: r.distance,
          pace: r.pace,
          hr: r.hr,
          cadence: r.cadence,
          fatigueScore: r.fatigue_score
        }))
      }

      if (foodRes.ok) {
        const nutritionData = await foodRes.json()
        food = nutritionData.map(f => ({
          id: f.id,
          userId: f.user_id,
          date: f.date,
          imageUrl: f.image_url || '',
          foodName: f.food_name,
          proteinAmount: f.protein_amount,
          calories: f.calories
        }))
      }

      set({ runLogs: runs, nutritionLogs: food })
      localStorage.setItem('pinkfit_runs', JSON.stringify(runs))
      localStorage.setItem('pinkfit_food', JSON.stringify(food))
    } catch (err) {
      console.error("Failed to fetch logs from backend:", err)
    }
  },

  updateProfile: async (profileData) => {
    const { apiEndpoint, token, user } = get()
    if (!token) return

    // 1. Optimistically calculate new targets locally to reflect updates instantly
    const weightVal = parseFloat(profileData.weightKg);
    const genderVal = profileData.gender;
    const targetRest = genderVal === "female" ? weightVal * 1.0 : weightVal * 1.2;
    const targetTraining = genderVal === "female" ? weightVal * 1.4 : weightVal * 1.5;

    const optimisticUser = {
      ...user,
      height: profileData.height,
      weightKg: weightVal,
      gender: genderVal,
      injuryHistory: profileData.injuryHistory,
      targetProteinRest: targetRest,
      targetProteinTraining: targetTraining
    };

    // Update state instantly
    set({ user: optimisticUser });
    localStorage.setItem('pinkfit_user', JSON.stringify(optimisticUser));

    const backendData = {
      height: profileData.height,
      weight_kg: weightVal,
      gender: genderVal,
      injury_history: profileData.injuryHistory
    }

    try {
      const response = await fetch(`${apiEndpoint}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        const mappedUser = mapUserProfile(updatedUser)
        localStorage.setItem('pinkfit_user', JSON.stringify(mappedUser))
        set({ user: mappedUser })
      }
    } catch (err) {
      console.error("Failed to update profile:", err)
      // Rollback to previous user state if network failed
      set({ user });
      localStorage.setItem('pinkfit_user', JSON.stringify(user));
    }
  },

  addRunLog: async (run) => {
    const { apiEndpoint, token } = get()
    
    const runData = {
      date: run.date || new Date().toISOString().split('T')[0],
      distance: parseFloat(run.distance),
      pace: run.pace,
      hr: parseInt(run.hr),
      cadence: parseInt(run.cadence),
    }

    // Calculate fatigue score for immediate rendering
    let min = 6;
    let sec = 0;
    const spacePos = runData.pace.indexOf(':');
    if (spacePos !== -1) {
      min = parseInt(runData.pace.substring(0, spacePos));
      sec = parseInt(runData.pace.substring(spacePos + 1));
    }
    const calculatedFatigue = Math.min(10, Math.max(1, ((runData.hr - 100) * 0.08) + (runData.distance * 0.15))).toFixed(1);

    const tempId = -Date.now(); // Negative ID for temp/optimistic log
    const newRun = {
      id: tempId,
      userId: get().user?.id || 1,
      date: runData.date,
      distance: runData.distance,
      pace: runData.pace,
      hr: runData.hr,
      cadence: runData.cadence,
      fatigueScore: parseFloat(calculatedFatigue)
    }

    // 1. Update state and localStorage instantly (Optimistic UI)
    const updatedRuns = [newRun, ...get().runLogs]
    localStorage.setItem('pinkfit_runs', JSON.stringify(updatedRuns))
    set({ runLogs: updatedRuns })

    // 2. Perform background server sync if token exists
    if (token) {
      fetch(`${apiEndpoint}/running/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(runData)
      })
      .then(async (response) => {
        if (response.ok) {
          const serverRun = await response.json();
          // Update the temp ID with server ID
          set((state) => {
            const currentRuns = state.runLogs.map(r => r.id === tempId ? {
              ...r,
              id: serverRun.id,
              fatigueScore: serverRun.fatigue_score
            } : r);
            localStorage.setItem('pinkfit_runs', JSON.stringify(currentRuns));
            return { runLogs: currentRuns };
          });
        }
      })
      .catch((err) => {
        console.error("Failed to sync run log in background:", err);
      });
    }
  },

  addNutritionLog: async (food) => {
    const { apiEndpoint, token } = get()
    
    const foodData = {
      date: food.date || new Date().toISOString().split('T')[0],
      food_name: food.foodName,
      protein_amount: parseInt(food.proteinAmount || 0),
      calories: parseInt(food.calories || 0),
      image_url: food.imageUrl || ''
    }

    const tempId = -Date.now();
    const newFood = {
      id: tempId,
      userId: get().user?.id || 1,
      date: foodData.date,
      imageUrl: foodData.image_url,
      foodName: foodData.food_name,
      proteinAmount: foodData.protein_amount,
      calories: foodData.calories
    }

    // 1. Update state and localStorage instantly (Optimistic UI)
    const updatedFood = [newFood, ...get().nutritionLogs]
    localStorage.setItem('pinkfit_food', JSON.stringify(updatedFood))
    set({ nutritionLogs: updatedFood })

    // 2. Perform background server sync if token exists
    if (token) {
      fetch(`${apiEndpoint}/nutrition/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(foodData)
      })
      .then(async (response) => {
        if (response.ok) {
          const serverFood = await response.json();
          set((state) => {
            const currentFood = state.nutritionLogs.map(f => f.id === tempId ? {
              ...f,
              id: serverFood.id
            } : f);
            localStorage.setItem('pinkfit_food', JSON.stringify(currentFood));
            return { nutritionLogs: currentFood };
          });
        }
      })
      .catch((err) => {
        console.error("Failed to sync nutrition log in background:", err);
      });
    }
  },

  runFoodSnapAnalysis: async () => {
    const { foodSnap, token, apiEndpoint } = get()
    if (!foodSnap.imagePreview) return

    set((state) => ({ foodSnap: { ...state.foodSnap, isAnalyzing: true, analysisResult: null } }))

    try {
      const response = await fetch(`${apiEndpoint}/nutrition/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ base64_image: foodSnap.imagePreview })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'วิเคราะห์รูปภาพล้มเหลว')
      }
      
      const result = await response.json()

      set((state) => ({
        foodSnap: {
          ...state.foodSnap,
          isAnalyzing: false,
          analysisResult: result,
          manualFoodName: result.foodName,
          manualCalories: String(result.calories),
          manualProtein: String(result.proteinAmount)
        }
      }))

    } catch (err) {
      console.error(err)
      // Throw error to UI instead of silent fallback
      set((state) => ({ foodSnap: { ...state.foodSnap, isAnalyzing: false } }))
      throw err
    }
  },

  estimateNutritionFromText: async (foodName) => {
    const { token, apiEndpoint } = get()
    if (!foodName) return

    set((state) => ({ foodSnap: { ...state.foodSnap, isAnalyzing: true, analysisResult: null } }))

    try {
      const response = await fetch(`${apiEndpoint}/nutrition/estimate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ food_name: foodName })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'ประเมินข้อมูลล้มเหลว')
      }
      
      const result = await response.json()

      set((state) => ({
        foodSnap: {
          ...state.foodSnap,
          isAnalyzing: false,
          analysisResult: {
            foodName: foodName,
            calories: result.calories,
            proteinAmount: result.proteinAmount,
            remarks: result.remarks
          },
          manualFoodName: foodName,
          manualCalories: String(result.calories),
          manualProtein: String(result.proteinAmount)
        }
      }))

    } catch (err) {
      console.error(err)
      set((state) => ({ foodSnap: { ...state.foodSnap, isAnalyzing: false } }))
      throw err
    }
  },

  fetchGroup: async () => {
    const { apiEndpoint, token } = get()
    if (!token) return

    try {
      const response = await fetch(`${apiEndpoint}/social/group/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const groupInfo = {
          id: data.group_info.id,
          name: data.group_info.name,
          inviteCode: data.group_info.invite_code,
          creatorId: data.group_info.creator_id
        }
        const members = data.members.map(m => ({
          id: m.user_id,
          email: m.email,
          name: m.name,
          role: 'user',
          height: m.height,
          weightKg: m.weight_kg,
          gender: m.gender,
          injuryHistory: m.injury_history,
          targetProteinRest: m.target_protein_rest,
          targetProteinTraining: m.target_protein_training,
          targetProteinToday: m.target_protein_today,
          isTrainingDay: m.is_training_day,
          todayProtein: m.today_protein,
          todayCalories: m.today_calories,
          lastRunDistance: m.last_run_distance,
          lastRunDate: m.last_run_date,
          avatar: (m.name || '').toLowerCase() === 'bunny' ? '🐰' : ((m.name || '').length % 2 === 0 ? '🐱' : '🐶')
        }))
        
        set({ group: groupInfo, groupMembers: members })
        localStorage.setItem('pinkfit_group', JSON.stringify(groupInfo))
        localStorage.setItem('pinkfit_members', JSON.stringify(members))
      } else {
        // User not in a group
        set({ group: null, groupMembers: [] })
        localStorage.removeItem('pinkfit_group')
        localStorage.removeItem('pinkfit_members')
      }
    } catch (err) {
      console.error("Failed to fetch group info from backend:", err)
    }
  },

  createGroup: async (groupName) => {
    const { apiEndpoint, token } = get()
    if (!token) return

    const response = await fetch(`${apiEndpoint}/social/group/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: groupName })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'ไม่สามารถสร้างสควอดได้')
    }

    await get().fetchGroup()
  },

  joinGroup: async (inviteCode) => {
    const { apiEndpoint, token } = get()
    if (!token) return

    const response = await fetch(`${apiEndpoint}/social/group/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ invite_code: inviteCode })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'ไม่สามารถเข้าร่วมสควอดได้ รหัสอาจไม่ถูกต้อง')
    }

    await get().fetchGroup()
  },

  leaveGroup: async () => {
    const { apiEndpoint, token } = get()
    if (!token) return

    const response = await fetch(`${apiEndpoint}/social/group/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      set({ group: null, groupMembers: [] })
      localStorage.removeItem('pinkfit_group')
      localStorage.removeItem('pinkfit_members')
    }
  },

  uploadRunSnap: async (base64Image) => {
    const { apiEndpoint, token } = get()
    if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อนทำการวิเคราะห์รูปภาพค่ะ')
    
    set({ isSyncing: true })
    try {
      const response = await fetch(`${apiEndpoint}/running/snap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ base64_image: base64Image })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'วิเคราะห์ภาพหน้าจอการวิ่งล้มเหลวค่ะ')
      }

      await get().fetchLogs()
    } finally {
      set({ isSyncing: false })
    }
  }
}))
