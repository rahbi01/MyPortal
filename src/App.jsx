import { useState, useEffect, useCallback } from 'react'
import LoginScreen   from './screens/LoginScreen.jsx'
import StudentScreen from './screens/StudentScreen.jsx'
import TeacherScreen from './screens/TeacherScreen.jsx'
import AdminScreen   from './screens/AdminScreen.jsx'
import Toast         from './components/Toast.jsx'
import { USERS, INITIAL_PLANS, SYSTEM_SETTINGS, ASSIGNMENTS, REWARD_RULES, INITIAL_POINTS_CYCLES, INITIAL_PAGES_PERIODS } from './data.js'
import { storage }   from './storage.js'

// ── تهيئة الحالة من localStorage أو البيانات الافتراضية ──────────────
function loadState() {
  return {
    users:       storage.get('users',       USERS),
    plans:       storage.get('plans',       INITIAL_PLANS),
    assignments: storage.get('assignments', ASSIGNMENTS),
    rewardRules:  storage.get('rewardRules',  REWARD_RULES),
    pointsCycles: storage.get('pointsCycles', INITIAL_POINTS_CYCLES),
    pagesPeriods: storage.get('pagesPeriods', INITIAL_PAGES_PERIODS),
    sysSettings: storage.get('sysSettings', SYSTEM_SETTINGS),
    sessionUser: storage.get('session',     null),  // تذكّر المستخدم
  }
}

export default function App() {
  const init = loadState()

  const [users,       setUsers]       = useState(init.users)
  const [plans,       setPlans]       = useState(init.plans)
  const [assignments, setAssignments] = useState(init.assignments)
  const [rewardRules,    setRewardRules]    = useState(init.rewardRules)
  const [pointsCycles,  setPointsCycles]  = useState(init.pointsCycles)
  const [pagesPeriods,  setPagesPeriods]  = useState(init.pagesPeriods)
  const [sysSettings, setSysSettings] = useState(init.sysSettings)
  const [currentUser, setCurrentUser] = useState(() => {
    // استعادة الجلسة: ابحث عن المستخدم الحي بنفس id
    if (!init.sessionUser) return null
    return init.users.find(u => u.id === init.sessionUser.id) || null
  })
  const [toast, setToast] = useState({ msg:'', type:'' })

  // ── حفظ تلقائي عند كل تغيير ─────────────────────────────────────────
  useEffect(() => { storage.set('users',       users)       }, [users])
  useEffect(() => { storage.set('plans',       plans)       }, [plans])
  useEffect(() => { storage.set('assignments', assignments) }, [assignments])
  useEffect(() => { storage.set('rewardRules',  rewardRules)  }, [rewardRules])
  useEffect(() => { storage.set('pointsCycles', pointsCycles) }, [pointsCycles])
  useEffect(() => { storage.set('pagesPeriods', pagesPeriods) }, [pagesPeriods])
  useEffect(() => { storage.set('sysSettings', sysSettings) }, [sysSettings])
  useEffect(() => {
    if (currentUser) storage.set('session', { id: currentUser.id })
    else             storage.remove('session')
  }, [currentUser])

  function showToast(msg, type = '') { setToast({ msg, type }) }

  function handleLogin(user) {
    const fresh = users.find(u => u.id === user.id) || user
    setCurrentUser(fresh)
  }

  function handleLogout() {
    setCurrentUser(null)
  }

  // تحديث المستخدم الحالي وحفظه في القائمة
  function updateCurrentUser(changes) {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, ...changes} : u))
    setCurrentUser(prev => ({...prev, ...changes}))
  }

  // للإدارة: تحديث قائمة المستخدمين كاملة
  const updateUsers = useCallback((updater) => {
    setUsers(typeof updater === 'function' ? updater : () => updater)
  }, [])

  // للإدارة: تحديث المقررات
  const updatePlans = useCallback((updater) => {
    setPlans(typeof updater === 'function' ? updater : () => updater)
  }, [])

  // للإدارة: تحديث الربط
  const updateAssignments = useCallback((updater) => {
    setAssignments(typeof updater === 'function' ? updater : () => updater)
  }, [])

  // للإدارة: إعادة ضبط كل البيانات للافتراضي
  function resetToDefaults() {
    storage.clearAll()
    setUsers(USERS)
    setPlans(INITIAL_PLANS)
    setAssignments(ASSIGNMENTS)
    setRewardRules(REWARD_RULES)
    setPointsCycles(INITIAL_POINTS_CYCLES)
    setPagesPeriods(INITIAL_PAGES_PERIODS)
    setSysSettings(SYSTEM_SETTINGS)
    setCurrentUser(null)
  }

  const commonProps = {
    currentUser,
    allUsers: users,
    plans,
    assignments,
    rewardRules,
    sysSettings,
    onLogout: handleLogout,
    onUpdateUser: updateCurrentUser,
    onUpdateUsers: updateUsers,
    onUpdatePlans: updatePlans,
    onUpdateAssignments: updateAssignments,
    onUpdateSysSettings: setSysSettings,
    onUpdateRewardRules: setRewardRules,
    pointsCycles,
    onUpdatePointsCycles: setPointsCycles,
    pagesPeriods,
    onUpdatePagesPeriods: setPagesPeriods,
    onResetToDefaults: resetToDefaults,
    showToast,
  }

  return (
    <>
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg:'', type:'' })}/>

      {!currentUser && <LoginScreen allUsers={users} onLogin={handleLogin}/>}

      {currentUser?.role === 'student' && (
        <StudentScreen {...commonProps}/>
      )}
      {currentUser?.role === 'teacher' && (
        <TeacherScreen {...commonProps}/>
      )}
      {currentUser?.role === 'admin' && (
        <AdminScreen {...commonProps}/>
      )}
    </>
  )
}
