import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiCamera, HiMail, HiPhone, HiAcademicCap, HiIdentification, HiUser, HiSave, HiStar, HiLightningBolt, HiFire, HiBadgeCheck, HiShieldCheck, HiOutlineLibrary, HiOutlineBookOpen, HiOutlineBookmark, HiOutlineSearch, HiOutlineBell, HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineUserCircle, HiOutlineCog, HiOutlineLogout, HiOutlineClipboardList } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import BookCard from '../../components/common/BookCard'
import DepartmentCard from '../../components/common/DepartmentCard'
import { axiosInstance } from '../../api/axios'

function StudentDashboard({
  mode,
  onBackToHome,
  selectedDepartment,
  setSelectedDepartment,
  departments = [],
  libraryBooks = [],
  filteredBooks,
  borrowedBooks,
  studentReviews = [],
  onBorrow,
  activeStudentSection,
  setActiveStudentSection,
  onProfileUpdate,
  loggedInRole,
  onRefresh,
}) {
  const navigate = useNavigate()

  const [studentProfile, setStudentProfile] = useState({
    name: '',
    regNo: '',
    email: '',
    semester: '',
    phone: '',
    profileImage: '',
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState('')

  // ✅ FETCH PROFILE FROM BACKEND
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/users/profile')
        setStudentProfile(res.data)
        if (res.data.profileImage) {
          setPreviewImage(res.data.profileImage)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }

    fetchProfile()
  }, [])

  // ✅ UPDATE INPUT
  const updateProfile = (e) => {
    const { name, value } = e.target
    setStudentProfile((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ SAVE PROFILE TO BACKEND
  const handleSaveProfile = async () => {
    const loadingToast = toast.loading('Updating your profile...')
    try {
      const formData = new FormData()
      formData.append('name', studentProfile.name)
      formData.append('regNo', studentProfile.regNo)
      formData.append('semester', studentProfile.semester)
      formData.append('phone', studentProfile.phone)
      
      if (selectedFile) {
        formData.append('profileImage', selectedFile)
      }

      const res = await axiosInstance.put('/users/profile', formData)
      
      setStudentProfile(res.data)
      if (onProfileUpdate) onProfileUpdate(res.data)
      toast.update(loadingToast, {
        render: 'Profile Updated ✅',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    } catch (err) {
      console.error('Error updating profile:', err)
      const errorMsg = err.response?.data?.msg || err.response?.data?.error?.message || err.message || 'Failed to update profile'
      toast.update(loadingToast, {
        render: `Error: ${errorMsg}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      })
    }
  }

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const imageUrl = URL.createObjectURL(file)
    setPreviewImage(imageUrl)
  }

  const studentDepartments = ['BSCS', 'BBA', 'IT'] // or your data

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department)
    setActiveStudentSection('books')
  }

  useEffect(() => {
    console.log('StudentDashboard - Mode:', mode);
    console.log('StudentDashboard - Active Section:', activeStudentSection);
  }, [mode, activeStudentSection]);

  return (
    <section className="space-y-6">

      {mode === 'profile' || mode === 'library' ? (
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors group mb-6 sm:mb-4"
        >
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
            <HiArrowLeft size={18} />
          </div>
          <span className="text-sm sm:text-base">Back to Home</span>
        </button>
      ) : null}


      {/* ================= PROFILE ================= */}
      {mode === 'profile' && (
        <div className="relative min-h-[80vh] py-4">
          {/* Animated Background Decorations */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-5xl mx-auto"
          >
            {/* Elite Profile Header */}
            <div className="relative group mb-12">
              <div className="h-48 sm:h-64 w-full bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-500 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 overflow-hidden relative">
                {/* Abstract Patterns */}
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" fillOpacity="0.1" />
                    <path d="M0 0 C 50 100 80 100 100 0 Z" fill="white" fillOpacity="0.05" />
                  </svg>
                </div>
                {/* Header Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-16 left-0 right-0 px-6 sm:px-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Avatar with Glow */}
                <div className="relative group/avatar">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-[2.5rem] blur opacity-40 group-hover/avatar:opacity-75 transition duration-500"></div>
                  <div className="relative h-32 w-32 sm:h-44 sm:w-44 rounded-[2.2rem] border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="profile" 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                      />
                    ) : (
                      <div className="text-4xl sm:text-6xl font-black text-blue-600 uppercase">
                        {studentProfile.email?.substring(0, 2) || 'U'}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-3 -right-3 p-3 bg-white dark:bg-slate-800 text-blue-600 rounded-2xl shadow-xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all duration-300 border border-slate-100 dark:border-slate-700">
                    <HiCamera size={22} />
                    <input type="file" className="hidden" onChange={handleProfileImageChange} />
                  </label>
                </div>

                <div className="text-center sm:text-left mb-4 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
                      {studentProfile.name || 'Elite Member'}
                    </h1>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-800">
                      Pro Level
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-sm">
                      <HiIdentification className="text-blue-500 text-lg" />
                      {studentProfile.regNo || 'ID: UNSET'}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-sm">
                      <HiShieldCheck className="text-green-500 text-lg" />
                      Verified Student
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-24 sm:mt-28">
              {/* Left Column: Achievement & Status */}
              <div className="lg:col-span-4 space-y-8">
                {/* Achievement Badges */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-slate-700/30 shadow-xl"
                >
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Achievements</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: HiFire, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: '7 Day Streak' },
                      { icon: HiStar, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Top Reader' },
                      { icon: HiLightningBolt, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Fast Return' },
                    ].map((badge, i) => (
                      <div key={i} className="group relative flex flex-col items-center">
                        <div className={`p-4 ${badge.bg} ${badge.color} rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm`}>
                          <badge.icon size={24} />
                        </div>
                        <span className="mt-2 text-[10px] font-black text-center text-slate-500 uppercase leading-tight">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Library Stats Glass Card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <HiBadgeCheck size={120} />
                  </div>
                  <h3 className="text-xs font-black text-blue-100 uppercase tracking-[0.2em] mb-6">Library Activity</h3>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-black">{borrowedBooks.length}</span>
                        <span className="text-blue-100 text-xs font-bold uppercase">Books Borrowed</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((borrowedBooks.length / 10) * 100, 100)}%` }}
                          className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        ></motion.div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <span className="block text-2xl font-black">{studentReviews.length}</span>
                        <span className="text-[10px] font-black uppercase text-blue-100">Reviews</span>
                      </div>
                      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <span className="block text-2xl font-black">12</span>
                        <span className="text-[10px] font-black uppercase text-blue-100">Favorites</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Settings Form */}
              <div className="lg:col-span-8">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[3rem] border border-white dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/30">
                          <HiUser size={24} />
                        </div>
                        Personal Profile
                      </h2>
                      <p className="mt-1 text-slate-500 font-bold text-sm ml-14">Manage your digital identity on BookBase</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Name */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Full Name</label>
                      <div className="relative group/input">
                        <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                        <input
                          name="name"
                          value={studentProfile.name}
                          onChange={updateProfile}
                          className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-2 border-transparent dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white shadow-sm"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>

                    {/* Reg No */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Registration ID</label>
                      <div className="relative group/input">
                        <HiIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                        <input
                          name="regNo"
                          value={studentProfile.regNo}
                          onChange={updateProfile}
                          className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-2 border-transparent dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white shadow-sm"
                          placeholder="University ID"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2 group">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Email</label>
                      <div className="relative opacity-60">
                        <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          name="email"
                          value={studentProfile.email}
                          disabled
                          className="w-full bg-slate-200/50 dark:bg-slate-950/50 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Phone Contact</label>
                      <div className="relative group/input">
                        <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                        <input
                          name="phone"
                          value={studentProfile.phone}
                          onChange={updateProfile}
                          className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-2 border-transparent dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white shadow-sm"
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>

                    {/* Semester */}
                    <div className="space-y-2 sm:col-span-2 group">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Academic Standing</label>
                      <div className="relative group/input">
                        <HiAcademicCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                        <input
                          name="semester"
                          value={studentProfile.semester}
                          onChange={updateProfile}
                          className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-2 border-transparent dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white shadow-sm"
                          placeholder="Semester / Year"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-slate-400 max-w-[240px] text-center sm:text-left">
                      Your changes will be synced with the central university library database.
                    </p>
                    <button 
                      onClick={handleSaveProfile}
                      className="group relative w-full sm:w-auto overflow-hidden bg-blue-600 text-white font-black py-4 px-12 rounded-[1.8rem] shadow-2xl shadow-blue-500/40 transition-all hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[-20deg] -translate-x-full group-hover:animate-shimmer"></div>
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <HiSave size={20} />
                        Update Profile
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= LIBRARY ================= */}
      {mode === 'library' && (
        <div className="-m-4 min-h-screen bg-[#f4f7fb]">
          <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_1fr]">
            <aside className="hidden border-r border-slate-200 bg-white lg:block">
              <div className="flex items-center gap-3 px-5 py-5">
                <div className="rounded-lg bg-blue-600 p-2 text-white">
                  <HiOutlineBookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Library</p>
                  <p className="text-xs text-slate-500">Management System</p>
                </div>
              </div>
              <nav className="space-y-1 px-3 py-3">
                {[
                  { id: 'home', label: 'Dashboard', icon: HiOutlineLibrary },
                  { id: 'books', label: 'Search Books', icon: HiOutlineSearch },
                  { id: 'borrowed', label: 'My Books', icon: HiOutlineBookOpen },
                  { id: 'departments', label: 'My Reservations', icon: HiOutlineBookmark },
                  { id: 'reviews', label: 'History', icon: HiOutlineClipboardList },
                  { id: 'fees', label: 'Fines & Payments', icon: HiOutlineCurrencyRupee },
                  { id: 'profile', label: 'Profile', icon: HiOutlineUserCircle },
                  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
                ].map(({ id, label, icon: Icon }) => {
                  const isActive = (id === 'profile' && mode === 'profile') || activeStudentSection === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        if (id === 'profile') navigate('/student/profile')
                        else if (id === 'fees' || id === 'settings') alert(`${label} will be available soon.`)
                        else setActiveStudentSection(id)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  )
                })}
              </nav>
              <div className="px-3 py-4">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <HiOutlineLogout className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </aside>

            <main className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="relative w-full max-w-xl">
                  <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search books, authors, categories..."
                    onChange={(e) => setSelectedDepartment(e.target.value ? 'All' : selectedDepartment)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => navigate('/notifications')} className="relative rounded-full border border-slate-200 p-2 text-slate-600">
                    <HiOutlineBell className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => navigate('/student/profile')} className="flex items-center gap-2">
                    {previewImage ? (
                      <img src={previewImage} alt="profile" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {(studentProfile.name || 'U').slice(0, 1)}
                      </div>
                    )}
                    <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{studentProfile.name || 'Student'}</span>
                  </button>
                </div>
              </div>

              {activeStudentSection === 'home' && (
                <div className="grid gap-4 xl:grid-cols-[1fr_310px]">
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[#e9f2ff] to-[#d9e8ff] p-6">
                      <h2 className="text-3xl font-bold text-slate-900">Welcome back, {studentProfile.name || 'Student'}!</h2>
                      <p className="mt-1 text-slate-600">Keep reading, keep learning.</p>
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => setActiveStudentSection('books')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Search Books</button>
                        <button onClick={() => setActiveStudentSection('borrowed')} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">View My Books</button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Books Issued</p><p className="text-2xl font-bold">{borrowedBooks.length}</p></div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Books Due Soon</p><p className="text-2xl font-bold">{Math.min(borrowedBooks.length, 2)}</p></div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Overdue Books</p><p className="text-2xl font-bold text-rose-600">{borrowedBooks.filter((b) => b.status === 'Overdue').length}</p></div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total Fines</p><p className="text-2xl font-bold text-indigo-700">Rs {borrowedBooks.filter((b) => b.status === 'Overdue').length * 50}</p></div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Currently Issued Books</h3>
                        <button onClick={() => setActiveStudentSection('borrowed')} className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">View All</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-3 py-2">Book</th>
                              <th className="px-3 py-2">Borrowed On</th>
                              <th className="px-3 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {borrowedBooks.slice(0, 4).map((book) => (
                              <tr key={book.id} className="border-t border-slate-100">
                                <td className="px-3 py-2 font-medium text-slate-800">{book.title}</td>
                                <td className="px-3 py-2 text-slate-600">{book.borrowedOn}</td>
                                <td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-xs ${book.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{book.status}</span></td>
                              </tr>
                            ))}
                            {borrowedBooks.length === 0 && <tr><td colSpan={3} className="px-3 py-4 text-center text-slate-500">No issued books.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-bold text-slate-900">Recommended for You</h3>
                          <button onClick={() => setActiveStudentSection('books')} className="text-xs font-semibold text-blue-600">View All</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {libraryBooks.slice(0, 4).map((book) => (
                            <button key={book._id} onClick={() => onBorrow(book)} className="rounded-lg border border-slate-200 p-2 text-left hover:border-blue-300">
                              <p className="truncate text-sm font-semibold text-slate-800">{book.title}</p>
                              <p className="text-xs text-slate-500">{book.author || 'Unknown Author'}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="mb-3 font-bold text-slate-900">Library Announcements</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                          <li>Library will remain closed on Sunday.</li>
                          <li>New books have been added this week.</li>
                          <li>Return overdue books to avoid extra fines.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Upcoming Due</h3>
                        <button onClick={() => setActiveStudentSection('borrowed')} className="text-xs font-semibold text-blue-600">View All</button>
                      </div>
                      <div className="space-y-3">
                        {borrowedBooks.slice(0, 3).map((book) => (
                          <div key={book.id} className="rounded-lg bg-slate-50 p-3">
                            <p className="font-semibold text-slate-800">{book.title}</p>
                            <p className="text-xs text-slate-500">Due in 3 days</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="mb-2 font-bold text-slate-900">Quick Actions</h3>
                      <div className="space-y-2">
                        <button onClick={() => setActiveStudentSection('books')} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"><span>Search Books</span><HiOutlineSearch className="h-4 w-4" /></button>
                        <button onClick={() => setActiveStudentSection('departments')} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"><span>Browse Categories</span><HiOutlineBookOpen className="h-4 w-4" /></button>
                        <button onClick={() => setActiveStudentSection('borrowed')} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"><span>My Reservations</span><HiOutlineBookmark className="h-4 w-4" /></button>
                        <button onClick={() => setActiveStudentSection('fees')} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"><span>Pay Fines</span><HiOutlineCurrencyRupee className="h-4 w-4" /></button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <HiOutlineCalendar className="h-5 w-5 text-slate-500" />
                        <h3 className="font-bold text-slate-900">Calendar</h3>
                      </div>
                      <p className="text-sm text-slate-500">Track due dates and reminders.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeStudentSection === 'departments' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-lg font-bold text-slate-900">Browse Categories</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {departments.filter((dep) => dep !== 'All').map((dep) => (
                      <button key={dep} onClick={() => handleDepartmentSelect(dep)} className={`rounded-lg border px-4 py-3 text-left ${selectedDepartment === dep ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        {dep}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeStudentSection === 'books' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Search Books {selectedDepartment !== 'All' ? `- ${selectedDepartment}` : ''}</h3>
                    <button onClick={() => setSelectedDepartment('All')} className="text-xs font-semibold text-blue-600">Clear Filter</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredBooks.map((book) => {
                      const isAlreadyBorrowedByMe = borrowedBooks.some((b) => b.book?._id === book._id || b.book === book._id)
                      return <BookCard key={book._id} book={book} onBorrow={onBorrow} borrowDisabled={isAlreadyBorrowedByMe} loggedInRole={loggedInRole} onRefresh={onRefresh} />
                    })}
                  </div>
                </div>
              )}

              {activeStudentSection === 'borrowed' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-4 text-lg font-bold text-slate-900">My Books</h3>
                  <div className="grid gap-3">
                    {borrowedBooks.map((book) => (
                      <div key={book.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div>
                          <p className="font-semibold text-slate-800">{book.title}</p>
                          <p className="text-xs text-slate-500">Borrowed: {book.borrowedOn}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${book.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{book.status}</span>
                      </div>
                    ))}
                    {borrowedBooks.length === 0 && <p className="text-sm text-slate-500">You haven't borrowed any books yet.</p>}
                  </div>
                </div>
              )}

              {(activeStudentSection === 'reviews' || activeStudentSection === 'fees') && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{activeStudentSection === 'reviews' ? 'History' : 'Fines & Payments'}</h3>
                    <button onClick={() => navigate('/student/write-review')} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Write Review</button>
                  </div>
                  {studentReviews.length === 0 ? (
                    <p className="text-sm text-slate-500">No records yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {studentReviews.map((review) => (
                        <div key={review.id} className="rounded-lg border border-slate-200 p-3">
                          <p className="font-semibold text-slate-800">{review.book}</p>
                          <p className="text-xs text-slate-500">{review.date}</p>
                          <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

    </section>
  )
}

export default StudentDashboard