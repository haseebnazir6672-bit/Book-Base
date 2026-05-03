import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { axiosInstance } from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineBell, HiOutlineMailOpen, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineChatAlt2, HiOutlineX, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi'
import { toast } from 'react-toastify'

function NotificationPage() {
  const { user: authUser, token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  
  // Deriving user from token if authUser is null (e.g., after refresh)
  const user = authUser || (token ? JSON.parse(atob(token.split('.')[1])) : null)
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [librarians, setLibrarians] = useState([])
  const [formData, setFormData] = useState({
    librarianId: '',
    title: '',
    message: ''
  })
  const [sending, setSending] = useState(false)

  const isStudent = user?.role === 'student'
  const isLibrarian = user?.role === 'librarian'

  const quickReplies = isStudent ? [
    "Received, thank you!",
    "I will return it today.",
    "Okay, I'm checking.",
    "Thanks for the update."
  ] : [
    "You're welcome!",
    "Please return it soon.",
    "Noted. Thank you.",
    "Come to the library."
  ]

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const endpoint = isStudent ? '/notifications/my-notifications' : '/notifications/all'
        const res = await axiosInstance.get(endpoint)
        setNotifications(res.data)
        
        // Also mark all as read when opening the page (only for students/recipients)
        if (isStudent) {
          await axiosInstance.put('/notifications/read-all')
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchLibrarians = async () => {
      if (!isStudent) return
      try {
        const res = await axiosInstance.get('/users/librarians')
        setLibrarians(res.data)
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, librarianId: res.data[0]._id }))
        }
      } catch (err) {
        console.error('Error fetching librarians:', err)
      }
    }

    fetchNotifications()
    fetchLibrarians()
  }, [isStudent])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((isStudent && !formData.librarianId) || (!isStudent && !formData.studentId) || !formData.title || !formData.message) {
      return toast.error('Please fill in all fields')
    }

    setSending(true)
    try {
      if (isStudent) {
        await axiosInstance.post('/notifications/send-to-librarian', formData)
      } else {
        await axiosInstance.post('/notifications/general', {
          recipientId: formData.studentId,
          title: formData.title,
          message: formData.message,
          type: 'general'
        })
      }
      toast.clearWaitingQueue();
      toast.success('Message sent successfully!', { toastId: 'notif-sent-success' })
      setShowModal(false)
      setFormData({ 
        librarianId: librarians[0]?._id || '', 
        studentId: '',
        title: '', 
        message: '' 
      })
    } catch (err) {
      toast.clearWaitingQueue();
      toast.error(err.response?.data?.msg || 'Failed to send message', { toastId: 'notif-sent-error' })
    } finally {
      setSending(false)
    }
  }

  const handleReply = (notif) => {
    if (!notif.sender) return
    
    if (isStudent && notif.sender.role === 'librarian') {
      setFormData({
        librarianId: notif.sender._id || notif.sender.id,
        title: `Re: ${notif.title}`,
        message: ''
      })
      setShowModal(true)
    } else if (isLibrarian && notif.sender.role === 'student') {
      setFormData({
        studentId: notif.sender._id || notif.sender.id,
        title: `Re: ${notif.title}`,
        message: ''
      })
      setShowModal(true)
    }
  }

  const handleQuickReply = async (notif, text) => {
    if (!notif.sender) return
    
    const replyData = isStudent ? {
      librarianId: notif.sender._id || notif.sender.id,
      title: `Quick Response: ${notif.title}`,
      message: text
    } : {
      recipientId: notif.sender._id || notif.sender.id,
      title: `Quick Response: ${notif.title}`,
      message: text,
      type: 'general'
    }

    try {
      setLoading(true)
      const endpoint = isStudent ? '/notifications/send-to-librarian' : '/notifications/general'
      await axiosInstance.post(endpoint, replyData)
      toast.clearWaitingQueue();
      toast.success('Quick response sent!', { toastId: `quick-reply-${notif._id}` })
    } catch (err) {
      toast.clearWaitingQueue();
      toast.error(err.response?.data?.msg || 'Failed to send response', { toastId: `quick-reply-error-${notif._id}` })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return
    
    try {
      await axiosInstance.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.clearWaitingQueue();
      toast.success('Notification deleted', { toastId: `notif-deleted-${id}` })
    } catch (err) {
      toast.clearWaitingQueue();
      toast.error(err.response?.data?.msg || 'Failed to delete notification', { toastId: `notif-deleted-error-${id}` })
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'fine': return <HiOutlineExclamationCircle className="text-rose-500" size={24} />
      case 'overdue': return <HiOutlineClock className="text-amber-500" size={24} />
      case 'borrow': return <HiOutlineCheckCircle className="text-emerald-500" size={24} />
      case 'warning': return <HiOutlineExclamationCircle className="text-red-500" size={24} />
      default: return <HiOutlineBell className="text-blue-500" size={24} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
      >
        <HiOutlineArrowLeft size={20} />
        Go Back
      </button>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Notifications</h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Messages and alerts from the library administration.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isStudent ? (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <HiOutlineChatAlt2 size={20} />
              Message Librarian
            </button>
          ) : (
            <p className="text-xs font-bold text-slate-400 max-w-[150px] text-right">
              Use the dashboard to send new messages to students.
            </p>
          )}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600">
            <HiOutlineBell size={32} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Send Message</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Contact library administration</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500"
                >
                  <HiOutlineX size={24} />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="p-8 space-y-6">
                {isStudent ? (
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Librarian</label>
                    <select 
                      value={formData.librarianId}
                      onChange={(e) => setFormData({...formData, librarianId: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
                    >
                      {librarians.map(lib => (
                        <option key={lib._id} value={lib._id}>{lib.name} ({lib.email})</option>
                      ))}
                      {librarians.length === 0 && <option disabled>No librarians available</option>}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recipient (Student)</label>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300">
                      {formData.studentId ? "Replying to Student" : "Select a student from the dashboard to send a new message"}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</label>
                  <input 
                    type="text"
                    placeholder="Enter message subject"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Message</label>
                  <textarea 
                    rows="4"
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </>
                  ) : 'Send Message Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold">Loading your messages...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <motion.article
              key={notif._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900"
            >
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform">
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {notif.message}
                  </p>

                  {isStudent && notif.sender?.role === 'librarian' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(notif, reply)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 border border-slate-100 rounded-lg text-[11px] font-bold transition-all dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-blue-900/30 dark:hover:border-blue-800"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {notif.fineAmount > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl font-bold text-sm">
                      Fine Amount: PKR {notif.fineAmount}
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <span className="uppercase tracking-tighter">
                        {notif.sender?._id === user?.id || notif.sender === user?.id ? 'To:' : 'From:'}
                      </span>
                      <span className="text-blue-500">
                        {notif.sender?._id === user?.id || notif.sender === user?.id 
                          ? notif.recipient?.name || 'Library System'
                          : notif.sender?.name || 'Library System'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="italic">
                        {notif.sender?._id === user?.id || notif.sender === user?.id
                          ? notif.recipient?.role || 'System'
                          : notif.sender?.role || 'System'}
                      </span>
                    </div>

                    {!isStudent && notif.sender?._id !== user?.id && notif.sender !== user?.id && (
                      <div className="text-[10px] font-bold text-slate-400">
                        <span className="uppercase tracking-tighter">Recipient:</span>
                        <span className="text-emerald-500 ml-1">{notif.recipient?.name || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isStudent && notif.sender?.role === 'librarian' && (
                    <button 
                      onClick={() => handleReply(notif)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-black text-xs transition-all flex items-center gap-2 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/40"
                    >
                      <HiOutlineChatAlt2 size={16} />
                      Reply
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(notif._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all dark:hover:bg-rose-900/20"
                    title="Delete Notification"
                  >
                    <HiOutlineTrash size={20} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
              <HiOutlineMailOpen size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">No notifications yet</h3>
            <p className="text-slate-500 font-bold mt-1">You're all caught up! Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPage
