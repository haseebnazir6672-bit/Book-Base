import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearHubSession,
  getHubToken,
  getHubUser,
  knowledgeHubApi,
  setHubSession,
  setHubUser,
} from '../../api/knowledgeHubApi'
import { useKnowledgeHub } from '../../contexts/KnowledgeHubContext'
import AuthScreen from '../../components/knowledgeHub/AuthScreen'
import { FiHome, FiCompass, FiFileText, FiBookmark, FiEdit, FiMenu, FiSearch, FiBell, FiMail, FiPaperclip, FiImage, FiVideo, FiFolderPlus, FiMessageCircle, FiHeart, FiShare2, FiMoreHorizontal, FiUpload, FiUsers, FiTrendingUp, FiFilter, FiUser, FiCheckCircle } from 'react-icons/fi'
import { AiOutlineDownload } from 'react-icons/ai'

const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function KnowledgeHubPortal() {
  const navigate = useNavigate()
  const { hubToken, hubUser, logout, login } = useKnowledgeHub()
  const [mode, setMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', regNo: '', employeeId: '', semester: '', designation: '', phone: '' })
  const [hubUserState, setHubUserState] = useState(getHubUser())
  const [hubTokenState, setHubTokenState] = useState(getHubToken())
  const [feed, setFeed] = useState([])
  const [summary, setSummary] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminCreateForm, setAdminCreateForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' })
  const [filters, setFilters] = useState({ search: '', department: '', type: '' })
  const [composer, setComposer] = useState({ title: '', body: '', department: '', contentType: 'post', attachmentUrl: '', files: [] })
  const [commentDrafts, setCommentDrafts] = useState({})
  const [statusMsg, setStatusMsg] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('forYou')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = hubUser?.role === 'admin'

  const loadFeed = async () => {
    if (!hubToken) return
    try {
      const res = await knowledgeHubApi.get('/posts', { params: filters })
      setFeed(res.data.items || [])
    } catch (error) {
      setStatusMsg(error?.response?.data?.msg || 'Unable to load feed')
    }
  }

  const loadAdminSummary = async () => {
    if (!hubToken || !isAdmin) return
    try {
      const res = await knowledgeHubApi.get('/admin/summary')
      setSummary(res.data)
    } catch {
      setSummary(null)
    }
  }

  const loadAdminUsers = async () => {
    if (!hubToken || !isAdmin) return
    try {
      const res = await knowledgeHubApi.get('/admin/users')
      setAdminUsers(res.data || [])
    } catch {
      setAdminUsers([])
    }
  }

  useEffect(() => {
    if (!hubToken) return
    const decoded = decodeJwt(hubToken)
    if (!decoded) {
      clearHubSession()
      return
    }
    knowledgeHubApi.get('/posts', { params: { limit: 1 } }).catch(() => {
      clearHubSession()
    })
  }, [hubToken])

  useEffect(() => {
    loadFeed()
  }, [hubToken, filters.search, filters.department, filters.type])

  useEffect(() => {
    loadAdminSummary()
    loadAdminUsers()
  }, [hubToken, hubUser?.role])

  const visibleDepartments = useMemo(
    () => Array.from(new Set(feed.map((item) => item.department).filter(Boolean))),
    [feed]
  )

  const trendingTopics = useMemo(() => {
    const topicCounts = {}
    feed.forEach(post => {
      if (post.department) {
        topicCounts[post.department] = (topicCounts[post.department] || 0) + 1
      }
      if (post.contentType) {
        const type = post.contentType.replace('_', ' ')
        topicCounts[type] = (topicCounts[type] || 0) + 1
      }
    })
    return Object.entries(topicCounts)
      .map(([name, posts]) => ({ name, posts }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5)
  }, [feed])

  const topContributors = useMemo(() => {
    const userStats = {}
    feed.forEach(post => {
      if (post.author?._id) {
        const userId = post.author._id
        if (!userStats[userId]) {
          userStats[userId] = {
            ...post.author,
            postCount: 0,
            totalLikes: 0
          }
        }
        userStats[userId].postCount++
        userStats[userId].totalLikes += post.likes?.length || 0
      }
    })
    return Object.values(userStats)
      .sort((a, b) => (b.totalLikes + b.postCount * 2) - (a.totalLikes + a.postCount * 2))
      .slice(0, 3)
  }, [feed])

  const runAuth = async (event) => {
    event.preventDefault()
    setStatusMsg('')
    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login'
      const payload = mode === 'signup'
        ? { 
            name: authForm.name, 
            email: authForm.email, 
            password: authForm.password, 
            role: authForm.role, 
            department: authForm.department,
            regNo: authForm.regNo,
            employeeId: authForm.employeeId,
            semester: authForm.semester,
            designation: authForm.designation,
            phone: authForm.phone
          }
        : { email: authForm.email, password: authForm.password }
      const res = await knowledgeHubApi.post(endpoint, payload)
      if (mode === 'signup') {
        setStatusMsg(res.data.msg || 'Registration submitted successfully! Please wait for admin approval.')
        setAuthForm({ name: '', email: '', password: '', role: 'student', department: '', regNo: '', employeeId: '', semester: '', designation: '', phone: '' })
        setMode('login')
      } else {
        login(res.data.token, res.data.user)
        setStatusMsg('Knowledge Hub login successful.')
      }
    } catch (error) {
      setStatusMsg(error?.response?.data?.msg || 'Authentication failed')
    }
  }

  const toggleLike = async (postId) => {
    await knowledgeHubApi.post(`/posts/${postId}/like`)
    await loadFeed()
  }

  const submitComment = async (postId) => {
    const text = commentDrafts[postId]
    if (!text?.trim()) return
    await knowledgeHubApi.post(`/posts/${postId}/comments`, { text })
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
    await loadFeed()
  }

  const removePost = async (postId) => {
    await knowledgeHubApi.delete(`/posts/${postId}`)
    await loadFeed()
    if (isAdmin) await loadAdminSummary()
  }

  const moderatePost = async (postId, status) => {
    await knowledgeHubApi.put(`/admin/posts/${postId}/moderate`, { status })
    await loadFeed()
    await loadAdminSummary()
  }

  const createHubUserByAdmin = async (event) => {
    event.preventDefault()
    await knowledgeHubApi.post('/admin/users', adminCreateForm)
    setAdminCreateForm({ name: '', email: '', password: '', role: 'student', department: '' })
    await loadAdminUsers()
    setStatusMsg('User added by admin.')
  }

  const removeHubUserByAdmin = async (userId) => {
    await knowledgeHubApi.delete(`/admin/users/${userId}`)
    await loadAdminUsers()
    setStatusMsg('User removed by admin.')
  }

  const logoutHub = () => {
    logout()
  }

  if (!hubToken || !hubUser) {
    return (
      <AuthScreen
        mode={mode}
        setMode={setMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        runAuth={runAuth}
        statusMsg={statusMsg}
        onBackToLibrary={() => navigate('/')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <FiMenu className="w-6 h-6 text-gray-600" />
              </button>
              <button onClick={() => navigate('/')} className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-medium">
                <FiHome className="w-5 h-5" />
                Back to Library
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FiBookmark className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Knowledge Hub</h1>
                  <p className="text-xs text-gray-500">by Book Base</p>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden sm:block">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search posts, resources, people..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border border-gray-300 px-2 py-0.5 rounded-md">
                  Ctrl + K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <FiBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <FiMail className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{hubUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{hubUser?.department || 'Computer Science'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {(hubUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-gray-200 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-0`}>
            <div className="h-full overflow-y-auto p-4 sm:p-5">
              <div className="lg:hidden flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FiBookmark className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Knowledge Hub</h1>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <FiMoreHorizontal className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              <nav className="space-y-1.5">
                <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
                  <FiHome className="w-6 h-6" />
                  <span className="text-base">Home</span>
                </a>
                <button onClick={() => { navigate('/knowledge-hub/profile'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-left">
                  <FiUser className="w-6 h-6" />
                  <span className="text-base">Profile</span>
                </button>
                <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiCompass className="w-6 h-6" />
                  <span className="text-base">Explore</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiFileText className="w-6 h-6" />
                  <span className="text-base">My Posts</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiBookmark className="w-6 h-6" />
                  <span className="text-base">Saved</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiBookmark className="w-6 h-6" />
                  <span className="text-base">My Bookmarks</span>
                </a>
                <button onClick={() => { navigate('/knowledge-hub/create'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-left">
                  <FiEdit className="w-6 h-6" />
                  <span className="text-base">Create Post</span>
                </button>
              </nav>

              <div className="mt-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3.5">Categories</h3>
                <nav className="space-y-1.5">
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
                    <FiFolderPlus className="w-6 h-6" />
                    <span className="text-base">All Categories</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFolderPlus className="w-6 h-6 text-green-500" />
                    <span className="text-base">Projects</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFolderPlus className="w-6 h-6 text-purple-500" />
                    <span className="text-base">Research Papers</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFolderPlus className="w-6 h-6 text-amber-500" />
                    <span className="text-base">Notes</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFolderPlus className="w-6 h-6 text-cyan-500" />
                    <span className="text-base">Study Materials</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFolderPlus className="w-6 h-6 text-rose-500" />
                    <span className="text-base">Videos</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFolderPlus className="w-6 h-6 text-gray-500" />
                    <span className="text-base">Others</span>
                  </a>
                </nav>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiHome className="w-6 h-6" />
                  <span className="text-base">Library Home</span>
                </button>
                <button onClick={() => { logoutHub(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-2">
                  <FiBookmark className="w-6 h-6" />
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {statusMsg && <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">{statusMsg}</div>}
            
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {(hubUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <button 
                    onClick={() => navigate('/knowledge-hub/create')}
                    className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    What are you working on?
                  </button>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => navigate('/knowledge-hub/create')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                        <FiPaperclip className="w-5 h-5" />
                        Upload File
                      </button>
                      <button onClick={() => navigate('/knowledge-hub/create')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                        <FiImage className="w-5 h-5" />
                        Image
                      </button>
                      <button onClick={() => navigate('/knowledge-hub/create')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                        <FiVideo className="w-5 h-5" />
                        Video
                      </button>
                      <button onClick={() => navigate('/knowledge-hub/create')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                        <FiFolderPlus className="w-5 h-5" />
                        Add Category
                      </button>
                    </div>
                    <button onClick={() => navigate('/knowledge-hub/create')} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:hidden bg-white rounded-2xl border border-gray-200 p-5 mb-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FiEdit className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Create Post</span>
                </button>
                <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <FiUpload className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Upload File</span>
                </button>
                <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Write Note</span>
                </button>
                <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <FiShare2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Share Link</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1 border-b border-gray-100 pb-0">
                <button 
                  onClick={() => setActiveTab('forYou')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all ${activeTab === 'forYou' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <FiHeart className="w-4 h-4" />
                  For You
                </button>
                <button 
                  onClick={() => setActiveTab('following')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all ${activeTab === 'following' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <FiUsers className="w-4 h-4" />
                  Following
                </button>
                <button 
                  onClick={() => setActiveTab('latest')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all ${activeTab === 'latest' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <FiCompass className="w-4 h-4" />
                  Latest
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.department}
                  onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  {visibleDepartments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <FiFilter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {feed.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
                  <button 
                    onClick={() => navigate('/knowledge-hub/create')}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                feed.map((post) => (
                  <article key={post._id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {(post.author?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{post.author?.name}</h4>
                            {post.author?.role === 'admin' && <FiCheckCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-500">
                            {post.department} • {new Date(post.createdAt || Date.now()).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })} ago
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(isAdmin || post.author?._id === hubUser?._id) && (
                          <button type="button" className="p-2 rounded-lg hover:bg-red-50 text-red-600" onClick={() => removePost(post._id)}>
                            <FiEdit className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                          <FiMoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">
                      {post.body?.length > 150 ? `${post.body.substring(0, 150)}... ` : post.body}
                      {post.body?.length > 150 && <span className="text-blue-600 font-medium hover:underline">Read more</span>}
                    </p>
                    {post.attachments?.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                        {post.attachments.map((att, idx) => (
                          <div key={`${post._id}-att-${idx}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <FiFileText className="w-5 h-5 text-red-600" />
                                <span className="ml-1 text-xs font-bold text-red-600">PDF</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{att.url.split('/').pop() || 'file.pdf'}</span>
                            </div>
                            <a href={att.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600">
                              <AiOutlineDownload className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {post.contentType.replace('_', ' ').charAt(0).toUpperCase() + post.contentType.replace('_', ' ').slice(1)}
                      </span>
                      {post.department && <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">{post.department}</span>}
                      {post.title.includes('Face') && <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-medium">Face Recognition</span>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6">
                        <button onClick={() => toggleLike(post._id)} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                          <FiHeart className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <FiMessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                        </button>
                      </div>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <FiShare2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    </div>
                    {post.comments?.length > 0 && (
                      <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                        {post.comments.slice(0, 2).map((comment) => (
                          <div key={comment._id} className="text-sm">
                            <span className="font-semibold text-gray-900">{comment.user?.name || 'User'}:</span> <span className="text-gray-600">{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <input 
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Write a comment..." 
                        value={commentDrafts[post._id] || ''} 
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))} 
                      />
                      <button 
                        type="button" 
                        className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition-colors" 
                        onClick={() => submitComment(post._id)}
                      >
                        Post
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>

          <aside className="w-80 hidden xl:block">
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FiEdit className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Create Post</span>
                  </button>
                  <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <FiUpload className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Upload File</span>
                  </button>
                  <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Write Note</span>
                  </button>
                  <button onClick={() => navigate('/knowledge-hub/create')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <FiShare2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Share Link</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-red-500" />
                    Trending Topics
                  </h3>
                  <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
                </div>
                <div className="space-y-3">
                  {trendingTopics.length > 0 ? (
                    trendingTopics.map((topic, idx) => (
                      <a key={idx} href="#" className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                        <span className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center text-xs font-bold text-blue-600">#</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                          <p className="text-xs text-gray-500">{topic.posts} posts</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No trending topics yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Top Contributors</h3>
                  <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
                </div>
                <div className="space-y-3">
                  {topContributors.length > 0 ? (
                    topContributors.map((user, idx) => (
                      <div key={user._id || idx} className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${idx === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : idx === 1 ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                            {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          {idx < 3 && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.department || 'No department'}</p>
                          <p className="text-xs text-gray-400">{user.postCount} posts • {user.totalLikes} likes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No contributors yet</p>
                  )}
                </div>
                <a href="#" className="block text-sm text-blue-600 font-medium hover:underline mt-4">See all contributors</a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </div>
  )
}

export default KnowledgeHubPortal
