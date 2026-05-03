import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiHome, FiCompass, FiFileText, FiBookmark, FiEdit, FiMenu, FiSearch, FiBell, FiMail, FiFolderPlus, FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiUpload, FiUser, FiCalendar, FiPhone, FiMail as FiMailIcon, FiMapPin, FiCheckCircle, FiCamera, FiBookOpen, FiVideo, FiImage } from 'react-icons/fi'
import { useKnowledgeHub } from '../../contexts/KnowledgeHubContext'

function UserProfilePage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { hubToken, hubUser, knowledgeHubApi, login } = useKnowledgeHub()
  
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)

  const isOwnProfile = !userId || userId === hubUser?._id

  useEffect(() => {
    if (!hubToken) return
    loadProfile()
  }, [hubToken, userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profileId = userId || hubUser?._id
      if (!profileId) return

      const [profileRes, postsRes, likedRes] = await Promise.all([
        knowledgeHubApi.get(`/users/${profileId}`),
        knowledgeHubApi.get('/posts', { params: { author: profileId, limit: 50 } }),
        knowledgeHubApi.get(`/users/${profileId}/liked-posts`)
      ])

      setProfile(profileRes.data)
      setUserPosts(postsRes.data.items || [])
      setLikedPosts(likedRes.data.items || [])
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (postId) => {
    await knowledgeHubApi.post(`/posts/${postId}/like`)
    await loadProfile()
  }

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadingProfileImage(true)
      const formData = new FormData()
      formData.append('profileImage', file)

      const res = await knowledgeHubApi.put('/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      login(hubToken, res.data)
      setProfile(res.data)
    } catch (error) {
      console.error('Failed to upload profile image:', error)
    } finally {
      setUploadingProfileImage(false)
    }
  }

  if (!hubToken || !hubUser) {
    navigate('/knowledge-hub')
    return null
  }

  const displayProfile = isOwnProfile ? hubUser : profile

  const totalPosts = userPosts.length
  const totalUploads = userPosts.filter(p => p.attachments?.length > 0).length
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
  const totalComments = userPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <FiMenu className="w-6 h-6 text-gray-600" />
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
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <FiMail className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                  {hubUser?.profileImage ? (
                    <img src={hubUser.profileImage} alt={hubUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (hubUser?.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{hubUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{hubUser?.department || 'Computer Science'}</p>
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
                  <FiMenu className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              <nav className="space-y-1.5">
                <a href="/knowledge-hub" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiHome className="w-6 h-6" />
                  <span className="text-base">Home</span>
                </a>
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
                <button onClick={() => { navigate('/knowledge-hub'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-2">
                  <FiBookmark className="w-6 h-6" />
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
                  <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 relative">
                    <div className="absolute inset-0 opacity-20">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#pattern)" />
                        <defs>
                          <pattern id="pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                          </pattern>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                      <div className="relative">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                          {displayProfile?.profileImage ? (
                            <img src={displayProfile.profileImage} alt={displayProfile.name} className="w-full h-full object-cover" />
                          ) : (
                            (displayProfile?.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        {isOwnProfile && (
                          <label className="absolute bottom-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 cursor-pointer">
                            {uploadingProfileImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                              <FiCamera className="w-4 h-4 text-gray-600" />
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleProfileImageUpload} 
                              disabled={uploadingProfileImage}
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{displayProfile?.name}</h1>
                            <FiCheckCircle className="w-5 h-5 text-blue-500" />
                          </div>
                          <p className="text-gray-600">{displayProfile?.department} • {displayProfile?.semester || 'Final Year'}</p>
                          <p className="text-sm text-gray-500 mt-1">Passionate about {displayProfile?.department || 'Computer Science'}, learning new technologies and sharing knowledge.</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            {displayProfile?.location && (
                              <span className="flex items-center gap-1.5">
                                <FiMapPin className="w-4 h-4" />
                                {displayProfile.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <FiCalendar className="w-4 h-4" />
                              Joined March 2024
                            </span>
                          </div>
                        </div>

                        {isOwnProfile && (
                          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                            <FiEdit className="w-4 h-4" />
                            Edit Profile
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-100">
                    <div className="p-5 text-center border-r border-gray-100">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FiFileText className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
                      <p className="text-sm text-gray-500">Total Posts</p>
                    </div>
                    <div className="p-5 text-center border-r border-gray-100">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                          <FiUpload className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalUploads}</p>
                      <p className="text-sm text-gray-500">Total Uploads</p>
                    </div>
                    <div className="p-5 text-center border-r border-gray-100">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                          <FiHeart className="w-5 h-5 text-red-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
                      <p className="text-sm text-gray-500">Total Likes</p>
                    </div>
                    <div className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                          <FiMessageCircle className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
                      <p className="text-sm text-gray-500">Total Comments</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 mb-6">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setActiveTab('posts')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'posts' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiFileText className="w-4 h-4" />
                        My Posts
                      </button>
                      <button 
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'saved' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiBookmark className="w-4 h-4" />
                        Saved
                      </button>
                      <button 
                        onClick={() => setActiveTab('bookmarks')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'bookmarks' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiBookmark className="w-4 h-4" />
                        Bookmarks
                      </button>
                      <button 
                        onClick={() => setActiveTab('liked')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'liked' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiHeart className="w-4 h-4" />
                        Liked Posts
                      </button>
                      <button 
                        onClick={() => setActiveTab('about')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'about' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiUser className="w-4 h-4" />
                        About
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Recent First</option>
                        <option>Oldest First</option>
                        <option>Most Liked</option>
                      </select>
                    </div>
                  </div>

                  {activeTab === 'posts' && (
                    <div className="p-6">
                      {userPosts.length === 0 ? (
                        <div className="text-center py-12">
                          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                          <p className="text-gray-500 mb-6">Share your first post with the community!</p>
                          <button 
                            onClick={() => navigate('/knowledge-hub/create')}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            Create First Post
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {userPosts.map((post) => (
                            <article key={post._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                    post.contentType === 'project' ? 'bg-blue-50 text-blue-700' :
                                    post.contentType === 'research_paper' ? 'bg-green-50 text-green-700' :
                                    post.contentType === 'note' ? 'bg-amber-50 text-amber-700' :
                                    post.contentType === 'study_material' ? 'bg-purple-50 text-purple-700' :
                                    post.contentType === 'video' ? 'bg-rose-50 text-rose-700' :
                                    'bg-gray-50 text-gray-700'
                                  }`}>
                                    {post.contentType?.replace('_', ' ')}
                                  </span>
                                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                    <FiMoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.body}</p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <div className="flex items-center gap-4">
                                    {post.attachments?.length > 0 && (
                                      <span className="flex items-center gap-1.5">
                                        <FiFileText className="w-4 h-4" />
                                        {post.attachments.length}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                      <FiHeart className="w-4 h-4" />
                                      {post.likes?.length || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <FiMessageCircle className="w-4 h-4" />
                                      {post.comments?.length || 0}
                                    </span>
                                  </div>
                                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}

                      {userPosts.length > 0 && (
                        <div className="mt-8 flex justify-center">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCheckCircle className="w-4 h-4" />
                            <span>You've reached the end</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'liked' && (
                    <div className="p-6">
                      {likedPosts.length === 0 ? (
                        <div className="text-center py-12">
                          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No liked posts yet</h3>
                          <p className="text-gray-500 mb-6">Start liking posts to see them here!</p>
                          <button 
                            onClick={() => navigate('/knowledge-hub')}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            Explore Posts
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {likedPosts.map((post) => (
                            <article key={post._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                    post.contentType === 'project' ? 'bg-blue-50 text-blue-700' :
                                    post.contentType === 'research_paper' ? 'bg-green-50 text-green-700' :
                                    post.contentType === 'note' ? 'bg-amber-50 text-amber-700' :
                                    post.contentType === 'study_material' ? 'bg-purple-50 text-purple-700' :
                                    post.contentType === 'video' ? 'bg-rose-50 text-rose-700' :
                                    'bg-gray-50 text-gray-700'
                                  }`}>
                                    {post.contentType?.replace('_', ' ')}
                                  </span>
                                  <button 
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                                    onClick={() => toggleLike(post._id)}
                                  >
                                    <FiHeart className="w-4 h-4 fill-current" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                    {(post.author?.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{post.author?.name}</span>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.body}</p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <div className="flex items-center gap-4">
                                    {post.attachments?.length > 0 && (
                                      <span className="flex items-center gap-1.5">
                                        <FiFileText className="w-4 h-4" />
                                        {post.attachments.length}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                      <FiHeart className="w-4 h-4" />
                                      {post.likes?.length || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <FiMessageCircle className="w-4 h-4" />
                                      {post.comments?.length || 0}
                                    </span>
                                  </div>
                                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}

                      {likedPosts.length > 0 && (
                        <div className="mt-8 flex justify-center">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCheckCircle className="w-4 h-4" />
                            <span>You've reached the end</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-900">{displayProfile?.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <FiBookOpen className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Department</p>
                                <p className="font-medium text-gray-900">{displayProfile?.department}</p>
                              </div>
                            </div>
                            {displayProfile?.email && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                  <FiMailIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="font-medium text-gray-900">{displayProfile.email}</p>
                                </div>
                              </div>
                            )}
                            {displayProfile?.phone && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                  <FiPhone className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="font-medium text-gray-900">{displayProfile.phone}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Activity Summary</h3>
                          <div className="bg-blue-50 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FiEdit className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Share Knowledge</p>
                                <p className="text-xs text-gray-600">Grow Together</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">Your knowledge can inspire someone today.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab !== 'posts' && activeTab !== 'about' && activeTab !== 'liked' && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiFileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                      <p className="text-gray-500">This feature is under development.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </div>
  )
}

export default UserProfilePage
