// ── بيانات المستخدمين ────────────────────────────────────────────────
export const USERS = [
  { id:1,  role:'student', username:'yousef',   password:'1234',      name:'يوسف العمري',    phone:'0501234567', avatar:'يع', color:'g', level:'الجزء 22', warned:2, suspended:false },
  { id:2,  role:'student', username:'hamza',    password:'1234',      name:'حمزة الفارسي',   phone:'0512345678', avatar:'حف', color:'b', level:'الجزء 12', warned:0, suspended:false },
  { id:3,  role:'student', username:'abdullah', password:'1234',      name:'عبدالله الشمري', phone:'',           avatar:'عش', color:'o', level:'الجزء 7',  warned:2, suspended:false },
  { id:4,  role:'student', username:'mohammed', password:'1234',      name:'محمد التميمي',   phone:'',           avatar:'مت', color:'r', level:'الجزء 3',  warned:3, suspended:true  },
  { id:5,  role:'student', username:'khaled',   password:'1234',      name:'خالد الزهراني',  phone:'',           avatar:'خز', color:'g', level:'الجزء 22', warned:0, suspended:false },
  { id:6,  role:'student', username:'ibrahim',  password:'1234',      name:'إبراهيم السالم', phone:'',           avatar:'إس', color:'p', level:'الجزء 28', warned:0, suspended:false },
  { id:10, role:'teacher', username:'omar',     password:'omar123',    name:'الشيخ عمر السعدي', phone:'0551234567', avatar:'عس', color:'b', canViewMissing:true  },
  { id:11, role:'teacher', username:'mahmoud',  password:'mahmoud123', name:'محمود العسيري',     phone:'0552345678', avatar:'مع', color:'p', canViewMissing:false },
  { id:12, role:'teacher', username:'faisal',   password:'faisal123',  name:'فيصل الخثلان',     phone:'0553456789', avatar:'فخ', color:'g', canViewMissing:false },
  { id:20, role:'admin',   username:'admin',    password:'admin123',   name:'المشرف العام',   phone:'', isSuperAdmin:true,  perms:{ students:true,editStudents:true,teachers:true,editTeachers:true,reports:true,warnings:true,backup:true,restore:true } },
  { id:21, role:'admin',   username:'ahmed_admin', password:'ahmed123', name:'أحمد الإداري', phone:'', isSuperAdmin:false, perms:{ students:true,editStudents:true,teachers:false,editTeachers:false,reports:true,warnings:false,backup:false,restore:false } },
]

export const STUDENTS   = USERS.filter(u => u.role==='student')
export const TEACHERS   = USERS.filter(u => u.role==='teacher')
export const ADMINS_LIST= USERS.filter(u => u.role==='admin')

export const ASSIGNMENTS = { 10:[1,2,5], 11:[3,4], 12:[] }

export const SYSTEM_SETTINGS = { reportDeadlineHour: 8 }

export const INITIAL_PLANS = [
  { id:1, studentId:1, teacherId:10, type:'حفظ', sardSubtype:null, startDate:'2025-04-27', newMem:'سورة القصص 1-20', recentMem:'سورة النمل كاملة', oldMem:'الجزء 17 كاملاً', sardText:null, sardNotes:null, phaseDesc:null, notes:'', evaluation:{ newScore:38, recentScore:19, oldScore:37, newPass:true, oldPass:true, notes:'أداء ممتاز', points:91, stars:3, date:'2025-05-03' }, dailyReports:{ 0:{submittedAt:'2025-04-27T09:00'},1:{submittedAt:'2025-04-28T10:00'},2:{submittedAt:'2025-04-29T08:30'},3:{submittedAt:'2025-04-30T09:15'},4:{submittedAt:'2025-05-01T11:00'} } },
  { id:2, studentId:1, teacherId:10, type:'سرد', sardSubtype:'full', startDate:'2025-05-04', newMem:null, recentMem:null, oldMem:null, sardText:'سورة الكهف كاملة', sardNotes:'', phaseDesc:null, notes:'', evaluation:{ revScore:88, revPass:true, notes:'سرد جيد مع بعض التوقف', points:88, stars:2, date:'2025-05-10' }, dailyReports:{ 0:{submittedAt:'2025-05-04T09:00'},1:{submittedAt:'2025-05-05T10:00'},3:{submittedAt:'2025-05-07T09:15'},4:{submittedAt:'2025-05-08T11:00'} } },
  { id:3, studentId:1, teacherId:10, type:'حفظ', sardSubtype:null, startDate:'2025-05-18', newMem:'الآيات 1-15 سورة الروم', recentMem:'سورة العنكبوت كاملة', oldMem:'الجزء 18 كاملاً', sardText:null, sardNotes:null, phaseDesc:null, notes:'', evaluation:null, dailyReports:{ 0:{submittedAt:'2025-05-18T09:00'},1:{submittedAt:'2025-05-19T10:30'} } },
  { id:4, studentId:1, teacherId:10, type:'حفظ', sardSubtype:null, startDate:'2025-05-25', newMem:'الآيات 16-30 سورة الروم', recentMem:'سورة الروم 1-15', oldMem:'الجزء 19 كاملاً', sardText:null, sardNotes:null, phaseDesc:null, notes:'', evaluation:null, dailyReports:{} },
  { id:5, studentId:2, teacherId:10, type:'سرد', sardSubtype:'review', startDate:'2025-05-11', newMem:null, recentMem:null, oldMem:null, sardText:'آل عمران 1-30', sardNotes:'', phaseDesc:null, notes:'', evaluation:{ revScore:74, revPass:false, notes:'يحتاج مراجعة أكثر', points:74, stars:2, date:'2025-05-17' }, dailyReports:{} },
  { id:6, studentId:2, teacherId:10, type:'سرد', sardSubtype:'review', startDate:'2025-05-18', newMem:null, recentMem:null, oldMem:null, sardText:'آل عمران 1-50', sardNotes:'التركيز على المقاطع الصعبة', phaseDesc:null, notes:'', evaluation:null, dailyReports:{} },
  { id:7, studentId:5, teacherId:10, type:'تقييم مرحلة', sardSubtype:null, startDate:'2025-05-18', newMem:null, recentMem:null, oldMem:null, sardText:null, sardNotes:null, phaseDesc:'تقييم جزء عم كاملاً', notes:'', evaluation:null, dailyReports:{} },
  { id:8, studentId:5, teacherId:10, type:'حفظ', sardSubtype:null, startDate:'2025-05-25', newMem:'سورة الملك 1-15', recentMem:'جزء تبارك', oldMem:'الجزء 29 كاملاً', sardText:null, sardNotes:null, phaseDesc:null, notes:'', evaluation:null, dailyReports:{} },
  { id:9, studentId:4, teacherId:10, type:'حفظ', sardSubtype:null, startDate:'2025-05-18', newMem:'سورة البقرة 1-10', recentMem:'الفاتحة', oldMem:'', sardText:null, sardNotes:null, phaseDesc:null, notes:'', evaluation:null, dailyReports:{} },
]

// دورات النقاط: كل دورة 6 مقررات، تُحسب النقاط من التقييمات (100 درجة لكل مقرر)
// cycleId: رقم الدورة، startDate/endDate: الفترة
// archivedCycles: الدورات المؤرشفة
export const INITIAL_POINTS_CYCLES = [
  {
    id: 1,
    name: 'الدورة الأولى',
    startDate: '2025-04-01',
    endDate:   null, // null = مفتوحة
    archived:  false,
    planLimit: 6,    // عدد المقررات في الدورة
  }
]

// فترات صفحات الحفظ والمكافآت المالية
// كل فترة: اسم + من-إلى + صفحات كل طالب مُدخلة يدوياً
export const INITIAL_PAGES_PERIODS = [
  {
    id: 1,
    name: 'الفترة الأولى',
    startDate: '2025-01-01',
    endDate:   '2025-03-31',
    archived:  true,
    // studentPages: { studentId: { pages, phaseScore, phasePass } }
    studentPages: {
      1: { pages: 40, phaseScore: 88, phasePass: true },
      2: { pages: 30, phaseScore: 74, phasePass: false },
      5: { pages: 45, phaseScore: 91, phasePass: true },
    }
  },
  {
    id: 2,
    name: 'الفترة الثانية',
    startDate: '2025-04-01',
    endDate:   null,  // مفتوحة
    archived:  false,
    studentPages: {}  // تُملأ يدوياً
  }
]

export const REWARD_RULES = [
  { id:1, name:'مكافآت ربع سنوية',   months:3,  active:true,  slabs:[{min:90,max:100,rate:15},{min:80,max:89,rate:12},{min:70,max:79,rate:10},{min:0,max:69,rate:0}] },
  { id:2, name:'مكافآت نهاية السنة', months:12, active:false, slabs:[{min:85,max:100,rate:20},{min:70,max:84,rate:15},{min:0,max:69,rate:0}] },
]

export const DAYS_AR    = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
export const DAYS_SHORT = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت']

export const TASKS_HAFIZ = [
  { key:'listening',          label:'🎧 الاستماع ثلاث مرات' },
  { key:'recitation_mastery', label:'📖 ضبط التلاوة' },
  { key:'listened_new',       label:'🔊 تسميع الجديد كاملاً' },
  { key:'repeated_new',       label:'🔁 تكرار تسميع الجديد' },
  { key:'reviewed_week',      label:'🔄 مراجعة حفظ الأسبوع', span:true },
]
