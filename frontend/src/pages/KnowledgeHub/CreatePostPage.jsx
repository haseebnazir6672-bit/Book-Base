import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiHome, FiCompass, FiFileText, FiBookmark, FiEdit, FiMenu, FiSearch, FiBell, FiMail, FiFolderPlus, FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight, FiImage, FiLink, FiMessageCircle, FiUpload, FiInfo, FiCheckCircle, FiZap, FiUsers, FiShield } from 'react-icons/fi'
import { useKnowledgeHub } from '../../contexts/KnowledgeHubContext'

function CreatePostPage() {
  const navigate = useNavigate()
  const { hubUser, hubToken, knowledgeHubApi } = useKnowledgeHub()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: 'post',
    files: []
  })
  const [isUploading, setIsUploading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    
    try {
      let uploadedAttachments = []
      if (formData.files?.length) {
        const formDataObj = new FormData()
        formData.files.forEach((file) => formDataObj.append('attachments', file))
        const uploadRes = await knowledgeHubApi.post('/posts/upload', formDataObj)
        uploadedAttachments = uploadRes.data.attachments || []
      }

      await knowledgeHubApi.post('/posts', {
        title: formData.title,
        body: formData.description,
        department: formData.department,
        contentType: formData.category,
        attachments: uploadedAttachments,
      })
      
      navigate('/knowledge-hub')
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveDraft = () => {
    console.log('Draft saved:', formData)
  }

  if (!hubToken || !hubUser) {
    navigate('/knowledge-hub')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/knowledge-hub')} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
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
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <FiMail className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {(hubUser?.name || 'U').charAt(0).toUpperCase()}
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
                <a href="#" className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
                  <FiEdit className="w-6 h-6" />
                  <span className="text-base">Create Post</span>
                </a>
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
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <form onSubmit={handleSubmit} className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
                  <p className="text-gray-500 mt-1">Share your knowledge with your peers and build the academic community.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  >
                    Save as Draft
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Publishing...' : 'Publish Post'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Title <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Enter a catchy and descriptive title"
                        maxLength={150}
                        value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                      <p className="text-xs text-gray-400 text-right mt-1">{formData.title.length}/150</p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Description <span className="text-red-500">*</span></label>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiBold className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiItalic className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiUnderline className="w-4 h-4" /></button>
                          <div className="w-px h-6 bg-gray-200 mx-1" />
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiList className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiList className="w-4 h-4" /></button>
                          <div className="w-px h-6 bg-gray-200 mx-1" />
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiAlignLeft className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiAlignCenter className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiAlignRight className="w-4 h-4" /></button>
                          <div className="w-px h-6 bg-gray-200 mx-1" />
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiImage className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiLink className="w-4 h-4" /></button>
                          <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600"><FiMessageCircle className="w-4 h-4" /></button>
                        </div>
                        <textarea 
                          rows={8}
                          placeholder="Write a detailed description about your post..."
                          maxLength={2000}
                          value={formData.description}
                          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                          className="w-full px-4 py-3 focus:outline-none border-0"
                          required
                        />
                        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                          <p className="text-xs text-gray-400 text-right">{formData.description.length}/2000</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Department <span className="text-red-500">*</span></label>
                        <select 
                          value={formData.department}
                          onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select your department</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Category <span className="text-red-500">*</span></label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="post">Select a category</option>
                          <option value="project">Project</option>
                          <option value="research_paper">Research Paper</option>
                          <option value="note">Note</option>
                          <option value="study_material">Study Material</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Upload File <span className="text-red-500">*</span></label>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                        <input 
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => setFormData(p => ({ ...p, files: Array.from(e.target.files || []) }))}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <FiUpload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <p className="text-gray-700 font-medium mb-2">Drag & drop your file here, or click to browse</p>
                          <p className="text-sm text-gray-500 mb-2">Supported formats: PDF, JPG, JPEG, PNG</p>
                          <p className="text-xs text-gray-400">Max file size: 20MB</p>
                        </label>
                      </div>
                      {formData.files?.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2">
                            <FiInfo className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-700">{formData.files.length} file(s) selected</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Post Guidelines</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiZap className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Be Original</h4>
                          <p className="text-sm text-gray-500 mt-1">Share original content or ideas.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiCheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Be Relevant</h4>
                          <p className="text-sm text-gray-500 mt-1">Make sure your post is relevant to the academic community.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiUsers className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Give Credit</h4>
                          <p className="text-sm text-gray-500 mt-1">Give proper credit if you're referencing others.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiShield className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Be Respectful</h4>
                          <p className="text-sm text-gray-500 mt-1">Maintain a respectful and professional environment.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                    <p className="text-sm text-gray-500 mb-4">Read our posting guidelines to learn more about creating high-quality content.</p>
                    <button type="button" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm">
                      View Guidelines
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </div>
  )
}

export default CreatePostPage
