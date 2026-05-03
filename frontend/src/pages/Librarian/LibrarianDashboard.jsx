import { useMemo, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import { HiPlus, HiPencil, HiTrash, HiSearch, HiUserGroup, HiUpload, HiArrowLeft, HiChat, HiBookOpen, HiX, HiCheck, HiDocumentText, HiUserCircle, HiMail, HiIdentification, HiLockClosed, HiCamera, HiOutlineBell, HiOutlineCalendar, HiOutlineLogout, HiOutlineChartBar, HiOutlineClipboardList, HiOutlineLibrary, HiOutlineBookmark, HiOutlineCurrencyDollar, HiOutlineCollection, HiOutlinePencilAlt, HiOutlineChevronDown } from 'react-icons/hi'
import StatCard from '../../components/common/StatCard'
import BooksBarChart from '../../components/charts/BooksBarChart'
import BorrowPieChart from '../../components/charts/BorrowPieChart'
import DailyBorrowLineChart from '../../components/charts/DailyBorrowLineChart'
import { axiosInstance } from '../../api/axios'

function LibrarianDashboard({ books, setBooks, bookSearch, setBookSearch, onLogout, userProfile, onProfileUpdate, navigate, unreadCount }) {
  const location = useLocation()
  const [view, setView] = useState('list') // 'list', 'add', 'update', 'borrow', 'students', 'bulk_preview', 'profile', 'find_book'
  const [activeTab, setActiveTab] = useState('records') // 'records', 'students'
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [timeRange, setTimeRange] = useState('thisMonth') // 'thisMonth' or 'allTime'
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateRecords, setDateRecords] = useState([])
  const [bookForm, setBookForm] = useState(emptyForm)
  const [editingBookId, setEditingBookId] = useState(null)
  const [recordSearch, setRecordSearch] = useState('')
  const [recordFilter, setRecordFilter] = useState('all')
  const [findBookSearch, setFindBookSearch] = useState('')
  const [onlineStudents, setOnlineStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [borrowRecords, setBorrowRecords] = useState([])
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState(null)
  const [messageForm, setMessageForm] = useState({ title: '', message: '' })
  const [bulkBooks, setBulkBooks] = useState([])
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    returned: 0,
    overdue: 0,
    totalFine: 0,
    monthlyStats: [],
    categoryStats: []
  })
  
  // Profile states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Borrow states
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null)
  const [studentSearchForBorrow, setStudentSearchForBorrow] = useState('')
  const [selectedStudentForBorrow, setSelectedStudentForBorrow] = useState(null)

  useEffect(() => {
    if (location.state?.borrowBook) {
      setSelectedBookForBorrow(location.state.borrowBook)
      setView('borrow')
      // Clear the state to prevent re-opening on manual refreshes
      window.history.replaceState({}, document.title)
    } else if (location.state?.view === 'profile') {
      setView('profile')
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
        department: userProfile.department || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [userProfile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsUpdatingProfile(true);
    const loadingToast = toast.loading('Updating profile...');
    try {
      const res = await axiosInstance.put('/users/profile', profileForm);
      onProfileUpdate(res.data);
      toast.update(loadingToast, {
        render: 'Profile updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.msg || 'Error updating profile',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    const loadingToast = toast.loading('Uploading profile image...');
    try {
      const res = await axiosInstance.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onProfileUpdate(res.data);
      toast.update(loadingToast, {
        render: 'Profile image updated!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.msg || 'Error uploading image',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  // Memoized fetchData to be used in useEffect and socket listeners
  const fetchData = useCallback(async () => {
    try {
      const params = timeRange === 'thisMonth' 
        ? { month: new Date().getMonth() + 1 } 
        : {}
      
      const [borrowRes, usersRes, statsRes] = await Promise.all([
        axiosInstance.get('/borrow'),
        axiosInstance.get('/users'),
        axiosInstance.get('/borrow/stats', { params })
      ])
      
      setBorrowRecords(Array.isArray(borrowRes.data) ? borrowRes.data : [])
      setAllStudents(usersRes.data.filter(u => u.role === 'student'))
      setStats(statsRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load dashboard data')
    }
  }, [timeRange])

  useEffect(() => {
    fetchData()

    const handleOnlineUsers = (users) => {
      const students = users.filter(u => u.role === 'student')
      setOnlineStudents(students)
    }

    return () => {}
  }, [fetchData])

  useEffect(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0]
    const filteredRecords = borrowRecords.filter(record => {
      const recordDate = new Date(record.borrowedAt).toISOString().split('T')[0]
      return recordDate === selectedDateStr
    })
    setDateRecords(filteredRecords)
  }, [selectedDate, borrowRecords])

  const activeBorrows = borrowRecords.filter(r => r.status === 'borrowed')
  const overdueRecords = borrowRecords.filter((record) => record.daysBorrowed >= 2 && record.status === 'borrowed')
  const lowStockBooks = books.filter((book) => book.available <= 2)
  const totalInventory = books.reduce((sum, book) => sum + (Number(book.available) || 0), 0)

  const monthlyChartData = useMemo(() => {
    const counts = new Map()
    for (const r of borrowRecords || []) {
      const dt = r.borrowedAt ? new Date(r.borrowedAt) : null
      if (!dt || Number.isNaN(dt)) continue
      const key = dt.toLocaleString('en-US', { month: 'short' })
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return order.filter((m) => counts.has(m)).map((month) => ({ month, books: counts.get(month) }))
  }, [borrowRecords])

  const categoryChartData = useMemo(() => {
    const counts = new Map()
    for (const r of borrowRecords || []) {
      const cat = r.book?.category || 'Other'
      counts.set(cat, (counts.get(cat) || 0) + 1)
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
  }, [borrowRecords])
  const todayActivities = borrowRecords.slice(0, 4)
  const dueForReturn = activeBorrows.slice(0, 3)

  const filteredBorrowedRecords = useMemo(() => {
    const normalized = recordSearch.toLowerCase()
    const filtered = (borrowRecords || []).filter((record) => {
      if (!record) return false;
      
      // Be extra safe with student/book data
      const student = record.student || {}
      const book = record.book || {}
      
      const studentName = student.name || record.studentName || ''
      const regNo = student.regNo || record.regNo || ''
      const bookTitle = book.title || ''
      
      const matchesText =
        studentName.toLowerCase().includes(normalized) ||
        regNo.toLowerCase().includes(normalized) ||
        bookTitle.toLowerCase().includes(normalized)

      const fine = record.computedFine || 0
      const isOverdue = record.isOverdue || (fine > 0 && record.status === 'borrowed')
      
      const matchesFilter =
        recordFilter === 'all' ||
        (recordFilter === 'overdue' && (isOverdue || record.status === 'overdue')) ||
        (recordFilter === 'clear' && fine === 0 && record.status !== 'overdue')

      return matchesText && matchesFilter
    })
    console.log('Librarian Dashboard - Raw Borrow Records:', borrowRecords);
    console.log('Librarian Dashboard - Filtered Borrow Records:', filtered);
    return filtered
  }, [recordSearch, recordFilter, borrowRecords])

  useEffect(() => {
    if (view === 'list') {
      setBookSearch('')
    }
  }, [view])

  const filteredBooks = useMemo(() => {
    if (view === 'list') {
      const normalized = bookSearch.toLowerCase()
      return books.filter(
        (book) =>
          book.title.toLowerCase().includes(normalized) ||
          book.author.toLowerCase().includes(normalized) ||
          (book.department && book.department.toLowerCase().includes(normalized)) ||
          book.category.toLowerCase().includes(normalized),
      )
    }
    return books
  }, [bookSearch, books])

  const handleChange = (event) => {
    const { name, value } = event.target
    setBookForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handlePdfChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedPdf(file)
    } else if (file) {
      toast.error('Please select a valid PDF file!')
    }
  }

  const handleExcelExport = () => {
    try {
      const exportData = books.map(book => ({
        'Book ID': book.bookId || '',
        'Title': book.title || '',
        'Author': book.author || '',
        'Department': book.department || '',
        'Category': book.category || '',
        'Stock Available': book.available || 0,
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Books Inventory')

      const fileName = `library-inventory-${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success('Inventory exported successfully!')
    } catch (err) {
      console.error('Error exporting inventory:', err)
      toast.error('Failed to export inventory')
    }
  }

  const handleExcelUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const rawData = XLSX.utils.sheet_to_json(ws)
        
        if (!rawData || rawData.length === 0) {
          toast.error('The Excel file appears to be empty.')
          return
        }

        // Improved flexible mapping
        const mappedBooks = rawData.map((item) => {
          // Normalize keys to lowercase and remove spaces/special chars for comparison
          const normalizedItem = {}
          Object.keys(item).forEach(key => {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
            normalizedItem[normalizedKey] = item[key]
          })

          const getVal = (possibleKeys) => {
            for (const key of possibleKeys) {
              const normalizedSearchKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
              if (normalizedItem[normalizedSearchKey] !== undefined) return String(normalizedItem[normalizedSearchKey])
            }
            return ''
          }

          return {
            bookId: getVal(['BookID', 'ID', 'Serial', 'Code']),
            title: getVal(['Title', 'Name', 'BookTitle', 'Subject']),
            author: getVal(['Author', 'Writer', 'WrittenBy', 'AuthorName']),
            department: getVal(['Department', 'Dept', 'Faculty']),
            category: getVal(['Category', 'Genre', 'Type']) || 'General',
            available: getVal(['Available', 'Copies', 'Stock', 'Quantity', 'Count', 'TotalStock']) || '1',
          }
        }).filter(b => b.title && b.author)

        if (mappedBooks.length === 0) {
          const foundColumns = Object.keys(rawData[0]).join(', ')
          toast.error(
            <div>
              <p className="font-bold mb-1">Invalid Excel Format</p>
              <p className="text-[10px]">Expected columns like: Title, Author, etc.</p>
              <p className="text-[10px] mt-1 opacity-70">Found columns: {foundColumns}</p>
            </div>,
            { autoClose: 8000 }
          )
          return
        }

        setBulkBooks(mappedBooks)
        setView('bulk_preview')
        toast.success(`Successfully parsed ${mappedBooks.length} books!`)
      } catch (err) {
        console.error('Excel Parsing Error:', err)
        toast.error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.')
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const handleSaveBulk = async () => {
    if (bulkBooks.length === 0) return
    
    setBulkUploadLoading(true)
    toast.clearWaitingQueue()
    const loadingToast = toast.loading(`Saving ${bulkBooks.length} books to library...`, { toastId: 'bulk-save' })
    
    try {
      const res = await axiosInstance.post('/books/bulk', { books: bulkBooks })
      
      // Refresh books list
      const booksRes = await axiosInstance.get('/books')
      setBooks(booksRes.data)

      toast.update(loadingToast, { 
        render: res.data.msg, 
        type: 'success', 
        isLoading: false, 
        autoClose: 5000 
      })

      setBulkBooks([])
      setView('list')
    } catch (err) {
      toast.update(loadingToast, { 
        render: err.response?.data?.msg || 'Error saving bulk books', 
        type: 'error', 
        isLoading: false, 
        autoClose: 3000 
      })
    } finally {
      setBulkUploadLoading(false)
    }
  }

  const resetForm = () => {
    setBookForm(emptyForm)
    setEditingBookId(null)
    setSelectedFile(null)
    setSelectedPdf(null)
    setPreviewImage('')
    setSelectedBookForBorrow(null)
    setSelectedStudentForBorrow(null)
    setStudentSearchForBorrow('')
    setBulkBooks([])
  }

  const filteredStudentsForBorrow = useMemo(() => {
    const q = studentSearchForBorrow.toLowerCase()
    return allStudents.filter(s => 
      s.name?.toLowerCase().includes(q) || 
      s.regNo?.toLowerCase().includes(q) || 
      s.email?.toLowerCase().includes(q)
    )
  }, [studentSearchForBorrow, allStudents])

  const handleIssueBook = async () => {
    if (!selectedStudentForBorrow || !selectedBookForBorrow) return

    toast.clearWaitingQueue();
    const loadingToastId = `issue-${selectedBookForBorrow._id}-${selectedStudentForBorrow._id}`;
    const loadingToast = toast.loading(`Issuing "${selectedBookForBorrow.title}" to ${selectedStudentForBorrow.name}...`, { toastId: loadingToastId })
    try {
      await axiosInstance.post('/borrow/issue', {
        studentId: selectedStudentForBorrow._id || selectedStudentForBorrow.id,
        bookId: selectedBookForBorrow._id || selectedBookForBorrow.id
      })

      // Refresh records and books
      const [borrowRes, booksRes] = await Promise.all([
        axiosInstance.get('/borrow'),
        axiosInstance.get('/books')
      ])
      setBorrowRecords(borrowRes.data)
      setBooks(booksRes.data)

      toast.update(loadingToast, {
        render: 'Book issued successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })

      resetForm()
      setView('list')
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.msg || 'Error issuing book',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageForm.title || !messageForm.message) {
      toast.clearWaitingQueue();
      return toast.error('Please fill in both title and message', { toastId: 'message-error' })
    }

    toast.clearWaitingQueue();
    const loadingToast = toast.loading('Sending message...', { toastId: 'sending-message' })
    try {
      await axiosInstance.post('/notifications/general', {
        recipientId: selectedStudentForMessage._id || selectedStudentForMessage.id,
        title: messageForm.title,
        message: messageForm.message,
        type: 'general'
      })

      toast.update(loadingToast, {
        render: `Message sent to ${selectedStudentForMessage.name}!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })

      setMessageForm({ title: '', message: '' })
      setSelectedStudentForMessage(null)
      setView('list')
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.msg || 'Error sending message',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    toast.clearWaitingQueue();
    const loadingToast = toast.loading(editingBookId ? 'Updating book...' : 'Adding book...', { toastId: 'book-action' })

    try {
      const formData = new FormData()
      if (bookForm.bookId) {
        formData.append('bookId', bookForm.bookId)
      }
      formData.append('title', bookForm.title)
      formData.append('author', bookForm.author)
      formData.append('department', bookForm.department)
      formData.append('category', bookForm.category)
      formData.append('available', bookForm.available)
      formData.append('shelf', bookForm.shelf)
      formData.append('cell', bookForm.cell)
      
      if (selectedFile) {
        formData.append('bookImage', selectedFile)
      }
      if (selectedPdf) {
        formData.append('bookPdf', selectedPdf)
      }

      let res;
      if (editingBookId) {
        res = await axiosInstance.put(`/books/${editingBookId}`, formData)
      } else {
        res = await axiosInstance.post('/books', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      // Refresh books list
      const booksRes = await axiosInstance.get('/books')
      setBooks(booksRes.data)

      toast.update(loadingToast, { 
        render: editingBookId ? 'Book updated successfully!' : 'Book added successfully!', 
        type: 'success', 
        isLoading: false, 
        autoClose: 3000 
      })

      resetForm()
      setView('list')
    } catch (err) {
      toast.update(loadingToast, { 
        render: err.response?.data?.msg || 'Error processing request', 
        type: 'error', 
        isLoading: false, 
        autoClose: 3000 
      })
    }
  }

  const startEdit = (book) => {
    setEditingBookId(book._id || book.id)
    setBookForm({
      bookId: book.bookId || '',
      title: book.title,
      author: book.author,
      department: book.department || '',
      category: book.category,
      available: String(book.available),
      shelf: book.shelf || '',
      cell: book.cell || '',
      bookPdf: book.bookPdf || '',
    })
    setPreviewImage(book.bookImage || '')
    setView('update')
  }

  const deleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return
    
    try {
      toast.clearWaitingQueue();
      await axiosInstance.delete(`/books/${bookId}`)
      setBooks((prev) => prev.filter((b) => (b._id || b.id) !== bookId))
      toast.success('Book deleted successfully', { toastId: `delete-${bookId}` })
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error deleting book', { toastId: `delete-error-${bookId}` })
    }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this borrow record? This cannot be undone.')) return
    
    try {
      toast.clearWaitingQueue();
      const loadingToast = toast.loading('Deleting record...', { toastId: `del-rec-${recordId}` })
      await axiosInstance.delete(`/borrow/${recordId}`)
      
      // Refresh both records and books (in case stock was restored)
      const [borrowRes, booksRes] = await Promise.all([
        axiosInstance.get('/borrow'),
        axiosInstance.get('/books')
      ])
      
      setBorrowRecords(Array.isArray(borrowRes.data) ? borrowRes.data : [])
      setBooks(booksRes.data)

      toast.update(loadingToast, { 
        render: 'Record deleted successfully', 
        type: 'success', 
        isLoading: false, 
        autoClose: 3000 
      })
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete record', { toastId: `del-rec-err-${recordId}` })
    }
  }

  const scrollToId = (id) => {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  if (view === 'list') {
    return (
      <section className="-m-4 min-h-screen bg-[#f6f8fc]">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
          <aside className="hidden bg-[#082a67] px-4 py-6 text-white lg:flex lg:flex-col">
            <div className="mb-7 flex items-center gap-3 px-2">
              <div className="rounded-lg bg-white/15 p-2">
                <HiOutlineLibrary className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Library</p>
                <p className="text-xs text-white/75">Management System</p>
              </div>
            </div>

            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Librarian Panel</p>
            <nav className="mt-3 space-y-1.5">
              {[
                { label: 'Dashboard', icon: HiOutlineChartBar, onClick: () => { setActiveMenu('Dashboard'); scrollToId('lib-top') } },
                { label: 'Find Book', icon: HiSearch, onClick: () => { setActiveMenu('Find Book'); setView('find_book') } },
                { label: 'Books', icon: HiBookOpen, onClick: () => { setActiveMenu('Books'); scrollToId('inventory-section') } },
                { label: 'Issue / Return', icon: HiOutlineClipboardList, onClick: () => { setActiveMenu('Issue / Return'); scrollToId('borrow-records'); } },
                { label: 'Members', icon: HiUserGroup, onClick: () => { setActiveMenu('Members'); setActiveTab('students'); scrollToId('students-section') } },
                { label: 'Students', icon: HiUserCircle, onClick: () => { setActiveMenu('Students'); setActiveTab('students'); scrollToId('students-section') } },
                { label: 'Reservations', icon: HiOutlineBookmark, onClick: () => { setActiveMenu('Reservations'); setActiveTab('records'); setRecordFilter('clear'); scrollToId('borrow-records') } },
                { label: 'Fines', icon: HiOutlineCurrencyDollar, onClick: () => { setActiveMenu('Fines'); setActiveTab('records'); setRecordFilter('overdue'); scrollToId('borrow-records') } },
                { label: 'Categories', icon: HiOutlineCollection, onClick: () => { setActiveMenu('Categories'); scrollToId('inventory-section'); toast.info('Use inventory search to filter categories.') } },
                { label: 'Authors', icon: HiOutlinePencilAlt, onClick: () => { setActiveMenu('Authors'); scrollToId('inventory-section'); toast.info('Use inventory search to filter authors.') } },
                { label: 'Reports', icon: HiDocumentText, onClick: () => { setActiveMenu('Reports'); handleExcelExport() } },
                { label: 'Notices', icon: HiChat, onClick: () => { setActiveMenu('Notices'); setActiveTab('students'); scrollToId('students-section'); toast.info('Open a student and click the message icon to send a notice.') } },
                { label: 'Transactions', icon: HiOutlineClipboardList, onClick: () => { setActiveMenu('Transactions'); setActiveTab('records'); setRecordFilter('all'); scrollToId('borrow-records') } },
                { label: 'Settings', icon: HiUserCircle, onClick: () => { setActiveMenu('Settings'); setView('profile') } },
                { label: 'Logout', icon: HiOutlineLogout, onClick: () => onLogout('/login') },
              ].map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeMenu === label ? 'bg-[#0f57d6] text-white shadow-md shadow-black/15' : 'text-white/85 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-auto px-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Knowledge is power.
            </div>
          </aside>

          <main className="p-4 sm:p-6">
            <div id="lib-top" className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full min-w-0 flex-1 md:max-w-2xl">
                <HiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(event) => setBookSearch(event.target.value)}
                  placeholder="Search books, members, transactions..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex w-full items-center justify-end gap-2 md:w-auto">
                <button 
                  type="button" 
                  onClick={() => navigate('/notifications')}
                  className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" 
                  title="Notifications"
                >
                  <HiOutlineBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className="relative inline-flex">
                  <button 
                    type="button"
                    onClick={() => setTimeRange(timeRange === 'thisMonth' ? 'allTime' : 'thisMonth')}
                    className={`inline-flex items-center gap-2 rounded-l-lg border border-r-0 px-3 py-2 text-xs font-medium transition-colors ${
                      timeRange === 'thisMonth' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HiOutlineCalendar className="h-4 w-4" />
                    <span>{timeRange === 'thisMonth' ? 'This Month' : 'All Time'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`inline-flex items-center px-2 py-2 rounded-r-lg border transition-colors ${
                      timeRange === 'thisMonth' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HiOutlineChevronDown className="h-4 w-4" />
                  </button>
                  {showCalendar && (
                    <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-2xl border border-slate-200 shadow-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Select Date</h3>
                        <button 
                          type="button"
                          onClick={() => setShowCalendar(false)}
                          className="p-1 hover:bg-slate-100 rounded-lg"
                        >
                          <HiOutlineX className="h-5 w-5 text-slate-500" />
                        </button>
                      </div>
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          setSelectedDate(new Date(e.target.value))
                          setShowCalendar(false)
                        }}
                        className="w-full p-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setView('profile')}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                  title="Open profile"
                >
                  {userProfile?.profileImage ? (
                    <img src={userProfile.profileImage} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {(userProfile?.name || 'L')[0]}
                    </div>
                  )}
                  <span className="hidden text-xs font-semibold text-slate-700 sm:inline">{userProfile?.name || 'Librarian'}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[#e9f2ff] to-[#d9e8ff] p-6">
                  <h2 className="text-3xl font-bold text-slate-900">Welcome back, {userProfile?.name || 'Librarian'}!</h2>
                  <p className="mt-1 text-slate-600">Manage library resources and assist members efficiently.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => { setActiveMenu('Books'); scrollToId('inventory-section') }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Search Books
                    </button>
                    <button type="button" onClick={() => { setActiveMenu('Issue / Return'); scrollToId('inventory-section'); toast.info('Select a book from inventory to issue.') }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Issue / Return
                    </button>
                    <button type="button" onClick={() => setView('add')} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Add Book
                    </button>
                    <button type="button" onClick={() => handleExcelExport()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Export Report
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-5">
                  <StatCard title="Total Books" value={books.length} helper="+120 this week" color="indigo" />
                  <StatCard title="Total Members" value={allStudents.length} helper="+85 this week" color="emerald" />
                  <StatCard title="Books Issued" value={activeBorrows.length} helper="+10 this week" color="violet" />
                  <StatCard title="Books Returned" value={borrowRecords.filter((r) => r.status === 'returned').length} helper="+8 this week" color="amber" />
                  <StatCard title="Pending Fines" value={`Rs ${overdueRecords.reduce((s, r) => s + (r.computedFine || 0), 0)}`} helper={`${overdueRecords.length} overdue`} color="rose" />
                </div>

                <div id="borrow-records" className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Borrowing Records</h3>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveTab('records'); setRecordFilter('all') }} className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">All</button>
                      <button onClick={() => { setActiveTab('records'); setRecordFilter('overdue') }} className="rounded-md bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">Overdue</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Book Title</th>
                          <th className="px-3 py-2">Member / Student</th>
                          <th className="px-3 py-2">Issue Date</th>
                          <th className="px-3 py-2">Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBorrowedRecords.slice(0, 6).map((r) => (
                          <tr key={r._id || r.id} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-medium text-slate-800">{r.book?.title || 'N/A'}</td>
                            <td className="px-3 py-2">{r.student?.name || r.studentName || 'N/A'}</td>
                            <td className="px-3 py-2 text-slate-600">{formatBorrowedAt(r.borrowedAt)}</td>
                            <td className="px-3 py-2">
                              {(r.computedFine || 0) > 0 ? (
                                <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">Rs {r.computedFine}</span>
                              ) : (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Clear</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredBorrowedRecords.length === 0 && (
                          <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-500">No records found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <article id="inventory-section" className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-bold">Inventory List</h3>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setView('add')} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Add Book</button>
                      <label className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white cursor-pointer">
                        Excel Import
                        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcelUpload} />
                      </label>
                      <button onClick={() => handleExcelExport()} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Export</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-bold">Book</th>
                          <th className="px-4 py-3 font-bold">Category</th>
                          <th className="px-4 py-3 font-bold">Stock</th>
                          <th className="px-4 py-3 font-bold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBooks.slice(0, 12).map((b) => (
                          <tr key={b._id || b.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{b.title}</p>
                              <p className="text-xs text-slate-500">{b.author}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{b.category}</td>
                            <td className="px-4 py-3 font-bold">{b.available}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => { setSelectedBookForBorrow(b); setView('borrow') }} className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">Issue</button>
                                <button onClick={() => startEdit(b)} className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Edit</button>
                                <button onClick={() => deleteBook(b._id || b.id)} className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <div id="students-section" className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Student Directory</h3>
                    <button onClick={() => { setActiveTab('students'); toast.info('Scroll down to view student directory.') }} className="text-xs font-semibold text-blue-600">Open</button>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Use the Student Directory below to message members and view details.</p>
                </div>

                {/* Charts (keeps existing chart components usable) */}
                <div className="grid gap-4 xl:grid-cols-2">
                  <BooksBarChart data={monthlyChartData} />
                  <BorrowPieChart data={categoryChartData} />
                </div>
                
                {/* Date-wise records */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  {dateRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Book Title</th>
                            <th className="px-4 py-3 font-semibold">Student</th>
                            <th className="px-4 py-3 font-semibold">Reg No</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Fine</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dateRecords.map((record) => (
                            <tr key={record._id || record.id} className="border-t border-slate-100">
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {record.book?.title || 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                {record.student?.name || record.studentName || 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                {record.student?.regNo || record.regNo || 'N/A'}
                              </td>
                              <td className="px-4 py-3 capitalize">
                                {record.status}
                              </td>
                              <td className="px-4 py-3">
                                {(record.computedFine || 0) > 0 ? (
                                  <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">
                                    Rs {record.computedFine}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                                    Clear
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-slate-500">
                      No records for this date
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 font-bold text-slate-900">Today's Activities</h3>
                  <div className="space-y-3 text-sm">
                    {borrowRecords.slice(0, 4).map((item) => (
                      <div key={item._id || item.id} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold text-slate-800">{item.status === 'returned' ? 'Returned' : 'Issued'} "{item.book?.title || 'N/A'}"</p>
                        <p className="text-xs text-slate-500">by {item.student?.name || item.studentName || 'N/A'}</p>
                      </div>
                    ))}
                    {borrowRecords.length === 0 && <p className="text-slate-500">No activities yet.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Due for Return</h3>
                    <button onClick={() => { setRecordFilter('overdue'); scrollToId('borrow-records') }} className="text-xs font-semibold text-blue-600">View All</button>
                  </div>
                  <div className="space-y-2">
                    {activeBorrows.slice(0, 3).map((r) => (
                      <div key={r._id || r.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                        <p className="font-semibold text-slate-800">{r.book?.title || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{r.student?.name || r.studentName || 'N/A'}</p>
                      </div>
                    ))}
                    {activeBorrows.length === 0 && <p className="text-slate-500">No due books right now.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Library Notices</h3>
                    <button onClick={() => toast.info('Use student messaging to send notices.')} className="text-xs font-semibold text-blue-600">View All</button>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Return issued books on time to avoid late fees.</li>
                    <li>Low stock titles require restocking.</li>
                    <li>Export reports for weekly review.</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      className="space-y-6 pb-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {view === 'list' && (
            <button
              onClick={() => onLogout('/login')}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              title="Back to Login"
            >
              <HiArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {view === 'profile' ? 'Staff Profile Management' : 'Librarian Control Panel'}
            </h2>
            <p className="text-slate-500 text-sm">
              {view === 'profile' ? 'Manage your professional identity and security settings.' : 'Manage inventory, track records, and monitor activity.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onLogout('/login')}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/25"
          >
            <HiOutlineLogout size={18} />
            Logout
          </button>
          {view === 'list' ? (
            <>
              <button 
                onClick={() => setView('add')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
              >
                <HiPlus size={20} />
                Add Book
              </button>
              <button 
                onClick={() => setView('find_book')}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/25"
              >
                <HiSearch size={20} />
                Find Book
              </button>
              <div className="relative">
                <input
                  type="file"
                  id="excelUpload"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                />
                <label 
                  htmlFor="excelUpload"
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                  <HiUpload size={20} />
                  Excel Import
                </label>
              </div>
              <button 
                onClick={handleExcelExport}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/25"
              >
                <HiDocumentText size={20} />
                Excel Export
              </button>
              <button 
                onClick={() => {
                  setBookSearch('');
                  const inventorySection = document.getElementById('inventory-section');
                  inventorySection?.scrollIntoView({ behavior: 'smooth' });
                  toast.info('Search for a book in the inventory to issue it!');
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25"
              >
                <HiBookOpen size={20} />
                Issue Book
              </button>
            </>
          ) : (
            <button 
              onClick={() => { setView('list'); resetForm(); }}
              className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl font-bold transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              <HiArrowLeft size={20} />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Borrowed Records" value={activeBorrows.length} helper="Current active" color="indigo" />
            <StatCard title="Overdue (2+ Days)" value={overdueRecords.length} helper="Needs attention" color="rose" />
            <StatCard
              title="Low Stock"
              value={lowStockBooks.length}
              helper={`${lowStockBooks.length} titles alert`}
              color="amber"
            />
            <StatCard title="Total Inventory" value={books.length} helper="Unique book titles" color="emerald" />
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 xl:grid-cols-2">
            <BooksBarChart data={stats.monthlyStats} />
            <BorrowPieChart data={stats.categoryStats} />
          </div>

          <DailyBorrowLineChart data={stats.dailyStats} departments={stats.departments} />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Main Content Area */}
            <div className="xl:col-span-8 space-y-6">
              {/* Tab Switcher */}
              <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('records')}
                  className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                    activeTab === 'records'
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Borrowing Records
                  {activeTab === 'records' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                    activeTab === 'students'
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Student Directory
                  {activeTab === 'students' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
              </div>

              {activeTab === 'records' ? (
                <>
                  {/* Filter & Search Bar */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full md:w-auto">
                  <button
                    onClick={() => setRecordFilter('all')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      recordFilter === 'all'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    All Records
                  </button>
                  <button
                    onClick={() => setRecordFilter('overdue')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      recordFilter === 'overdue'
                        ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Overdue
                  </button>
                </div>
                <div className="relative w-full md:w-80">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by student or book..."
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Borrowing Monitor Table */}
              <motion.article className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Borrowing Monitor</h3>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Returned
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      Active
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                        <th className="px-6 py-4">Student Detail</th>
                        <th className="px-6 py-4">Book Info</th>
                        <th className="px-6 py-4 text-center">Duration</th>
                        <th className="px-6 py-4 text-center">Fine Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredBorrowedRecords.length > 0 ? (
                        filteredBorrowedRecords.map((record) => (
                          <tr key={record._id || record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                                  {(record.student?.name || record.studentName || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                                    {record.student?.name || record.studentName || 'Unknown Student'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                    {record.student?.regNo || record.regNo || 'No ID'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{record.book?.title || 'N/A'}</p>
                              <p className="text-xs text-slate-500 font-medium">{record.book?.author || 'N/A'}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                record.status === 'borrowed' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                              }`}>
                                {record.daysBorrowed} Days
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {record.computedFine > 0 ? (
                                <span className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg">
                                  RS. {record.computedFine}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                                  Clear
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedStudentForMessage({ id: record.student?._id || record.student?.id, name: record.student?.name });
                                    setView('message');
                                  }}
                                  className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                  title="Message Student"
                                >
                                  <HiChat size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRecord(record._id || record.id)}
                                  className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                                  title="Delete Record"
                                >
                                  <HiTrash size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-30">
                              <HiUserGroup size={48} />
                              <p className="font-bold">No records found matching criteria</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.article>
            </>
          ) : (
            <motion.article 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg">Student Directory</h3>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-xs font-bold rounded-lg">
                  {allStudents.length} Total Students
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {allStudents.length > 0 ? (
                      allStudents.map((student) => (
                        <tr key={student._id || student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-indigo-500">
                                {student.name?.[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase">{student.regNo || 'No Reg No'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">{student.email}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{student.department || 'General'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                              student.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {student.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedStudentForMessage(student);
                                setView('message');
                              }}
                              className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                              title="Message Student"
                            >
                              <HiChat size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.article>
          )}

          {/* Inventory Management */}
              <motion.article id="inventory-section" className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={bookSearch}
                        onChange={(event) => setBookSearch(event.target.value)}
                        placeholder="Search books, author, department..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mt-6">Inventory List</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-bold">Book Details</th>
                        <th className="px-4 py-3 font-bold">Category</th>
                        <th className="px-4 py-3 font-bold">Location</th>
                        <th className="px-4 py-3 font-bold">Stock</th>
                        <th className="px-4 py-3 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredBooks.map((book) => (
                        <tr key={book._id || book.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {book.bookImage ? (
                                <img src={book.bookImage} className="w-10 h-14 object-cover rounded-md shadow-sm" alt="" />
                              ) : (
                                <div className="w-10 h-14 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                                  B
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{book.title}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-slate-500">{book.author}</p>
                                  {book.bookId && book.bookId !== 'undefined' && (
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-400 font-mono">
                                      #{book.bookId}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase">{book.department || 'General'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{book.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            {book.shelf || book.cell ? (
                              <div className="flex flex-col gap-1">
                                {book.shelf && (
                                  <span className="text-xs font-bold text-indigo-600">Shelf: {book.shelf}</span>
                                )}
                                {book.cell && (
                                  <span className="text-xs font-bold text-purple-600">Cell: {book.cell}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not set</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${book.available <= 2 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                              {book.available}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedBookForBorrow(book);
                                  setView('borrow');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-[11px] font-bold shadow-sm"
                                title="Issue to Student"
                              >
                                <HiBookOpen size={14} />
                                Issue
                              </button>
                              <button onClick={() => startEdit(book)} className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Edit Book">
                                <HiPencil size={16} />
                              </button>
                              <button onClick={() => deleteBook(book._id || book.id)} className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Delete Book">
                                <HiTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.article>
            </div>

            {/* Sidebar Widgets */}
            <div className="xl:col-span-4 space-y-6">
              {/* Online Students List */}
              <motion.article className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <HiUserGroup className="text-indigo-500" />
                    Online Students
                  </h3>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 text-xs font-bold rounded-full">
                    {onlineStudents.length} Active
                  </span>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {onlineStudents.length > 0 ? (
                    onlineStudents.map((student, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setSelectedStudentForMessage(student)
                          setView('message')
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                          {student.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{student.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Online Now</span>
                          </div>
                        </div>
                        <HiChat className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">No students online</p>
                    </div>
                  )}
                </div>
              </motion.article>

              {/* Low Stock Widget */}
              <motion.article className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Low Stock Alert</h3>
                <div className="space-y-3">
                  {lowStockBooks.slice(0, 5).map((book) => (
                    <div key={book._id || book.id} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{book.title}</p>
                        <p className="text-xs text-rose-600 font-bold">{book.available} copies left</p>
                      </div>
                      <button onClick={() => startEdit(book)} className="text-xs font-bold bg-white dark:bg-slate-800 text-rose-600 px-3 py-1.5 rounded-lg shadow-sm">
                        Restock
                      </button>
                    </div>
                  ))}
                  {lowStockBooks.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-4">All stock levels healthy</p>
                  )}
                </div>
              </motion.article>
            </div>
          </div>
        </>
      ) : view === 'borrow' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Issue Book</h2>
              <p className="text-slate-500 text-sm font-medium">Select a student to issue this book</p>
            </div>
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
              <HiX size={24} />
            </button>
          </div>

          <div className="flex gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            {selectedBookForBorrow.bookImage ? (
              <img src={selectedBookForBorrow.bookImage} className="w-20 h-28 object-cover rounded-xl shadow-md" alt="" />
            ) : (
              <div className="w-20 h-28 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 font-black text-3xl shadow-sm">
                {selectedBookForBorrow.title[0]}
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{selectedBookForBorrow.title}</h3>
              <p className="text-slate-500 font-bold text-sm">{selectedBookForBorrow.author}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 text-[10px] font-black uppercase rounded-md">
                  {selectedBookForBorrow.department}
                </span>
                <span className="text-emerald-500 text-[11px] font-bold">
                  {selectedBookForBorrow.available} Available
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search student by name, Reg No, or email..."
                value={studentSearchForBorrow}
                onChange={(e) => setStudentSearchForBorrow(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-sm"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid gap-2">
                {filteredStudentsForBorrow.map((student) => (
                  <button
                    key={student._id || student.id}
                    onClick={() => setSelectedStudentForBorrow(student)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      selectedStudentForBorrow?._id === student._id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-indigo-500 shadow-sm">
                        {student.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-white text-sm">{student.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{student.regNo}</p>
                      </div>
                    </div>
                    {selectedStudentForBorrow?._id === student._id && (
                      <HiCheck className="text-indigo-600" size={20} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selectedStudentForBorrow}
              onClick={handleIssueBook}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/25 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <HiBookOpen size={20} />
              Confirm & Issue Book
            </button>
          </div>
        </motion.div>
      ) : view === 'bulk_preview' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bulk Import Preview</h2>
              <p className="text-slate-500 text-sm font-medium">Verify the parsed books before adding them to the library.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setView('list'); setBulkBooks([]); }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={bulkUploadLoading}
                onClick={handleSaveBulk}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-black transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                {bulkUploadLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiCheck size={20} />
                )}
                Save All Books
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bulkBooks.map((book, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-300 font-black text-2xl shadow-sm flex-shrink-0">
                    {book.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 dark:text-white truncate" title={book.title}>{book.title}</h3>
                    <p className="text-slate-500 text-xs font-bold truncate mb-2">{book.author}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[9px] font-black uppercase rounded">
                        {book.department || 'General'}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 text-[9px] font-black uppercase rounded">
                        {book.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Stock</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{book.available} Copies</span>
                  </div>
                  <button 
                    onClick={() => setBulkBooks(prev => prev.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <HiX size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : view === 'profile' ? (
        /* Librarian Profile View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
            {/* Profile Header */}
            <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                  {userProfile?.profileImage ? (
                    <img 
                      src={userProfile.profileImage} 
                      className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 object-cover shadow-2xl" 
                      alt="Profile" 
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-2xl">
                      <HiUserCircle size={64} className="text-slate-300" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                    <HiCamera size={32} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{userProfile?.name}</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Professional Librarian
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Account Status</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-300 uppercase">Verified</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2">Personal Information</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <div className="relative group">
                      <HiUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                    <div className="relative group opacity-60">
                      <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        value={profileForm.email}
                        readOnly
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none cursor-not-allowed font-bold text-sm"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 ml-1 italic">Email cannot be changed by staff.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2">Security Settings</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                    <div className="relative group">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    {isUpdatingProfile ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiCheck size={18} />
                    )}
                    Update Librarian Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      ) : view === 'message' ? (
        /* Message View */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {selectedStudentForMessage?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold">Message to {selectedStudentForMessage?.name}</h3>
                <p className="text-slate-500 text-sm">Send a direct real-time notification to this student.</p>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Message Subject</label>
                <input
                  value={messageForm.title}
                  onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                  placeholder="e.g. Book Return Reminder, Fine Notice..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Detailed Message</label>
                <textarea
                  rows="5"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setView('list'); setSelectedStudentForMessage(null); }}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <HiChat size={20} />
                  Send Message Now
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      ) : view === 'find_book' ? (
        /* Find Book View */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Find Book Location</h2>
                <p className="text-slate-500 text-sm font-medium">Search for a book to find its shelf and cell location</p>
              </div>
              <button onClick={() => { setView('list'); setFindBookSearch(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                <HiX size={24} />
              </button>
            </div>

            <div className="relative mb-8">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Search by book title, author, or book ID..."
                value={findBookSearch}
                onChange={(e) => setFindBookSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-cyan-500 rounded-2xl outline-none transition-all font-bold text-lg"
              />
            </div>

            <div className="space-y-4">
              {(() => {
                const normalized = findBookSearch.toLowerCase()
                const results = findBookSearch.trim() === '' 
                  ? [] 
                  : books.filter(book => 
                      book.title.toLowerCase().includes(normalized) || 
                      book.author.toLowerCase().includes(normalized) || 
                      (book.bookId && book.bookId.toLowerCase().includes(normalized))
                    )

                if (findBookSearch.trim() === '') {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <HiSearch size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold text-lg">Start typing to search for a book</p>
                    </div>
                  )
                }

                if (results.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <HiBookOpen size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold text-lg">No books found matching your search</p>
                    </div>
                  )
                }

                return results.map(book => (
                  <motion.div 
                    key={book._id || book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start gap-6">
                      {book.bookImage ? (
                        <img src={book.bookImage} className="w-20 h-28 object-cover rounded-xl shadow-sm" alt={book.title} />
                      ) : (
                        <div className="w-20 h-28 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 font-black text-3xl">
                          {book.title[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">{book.title}</h3>
                        <p className="text-slate-500 font-bold text-sm mb-4">{book.author}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Shelf</p>
                            <p className="text-2xl font-black text-indigo-600">
                              {book.shelf || <span className="text-slate-300">Not Set</span>}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cell</p>
                            <p className="text-2xl font-black text-purple-600">
                              {book.cell || <span className="text-slate-300">Not Set</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-3 text-sm text-slate-500">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold">
                              {book.category}
                            </span>
                            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded text-emerald-600 font-bold">
                              {book.available} Available
                            </span>
                          </div>
                          <button 
                            onClick={() => startEdit(book)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors"
                          >
                            Update Location
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              })()}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Add/Update View */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-8">
              {view === 'add' ? 'Add New Catalog Entry' : 'Update Book Details'}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Upload Area */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Book Cover Image</label>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-40 h-56 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center relative group">
                    {previewImage ? (
                      <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center p-4">
                        <HiUpload size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">No Image Selected</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-4">
                      Upload a high-quality cover image for the library catalog. 
                      Supported formats: JPG, PNG, WEBP. Max size: 2MB.
                    </p>
                    <input
                      type="file"
                      id="bookImage"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="bookImage"
                      className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <HiUpload size={18} />
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              {/* PDF Upload Area */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Book PDF (for online reading)</label>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-40 h-56 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    {selectedPdf || bookForm.bookPdf ? (
                      <div className="text-center p-4">
                        <HiDocumentText size={40} className="mx-auto text-red-500 mb-2" />
                        <p className="text-xs text-slate-500 font-bold">
                          {selectedPdf ? selectedPdf.name : 'PDF Uploaded'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <HiDocumentText size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">No PDF Selected</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-4">
                      Upload a PDF version of the book for students to read online. 
                      Supported format: PDF. Max size: 10MB.
                    </p>
                    <input
                      type="file"
                      id="bookPdf"
                      onChange={handlePdfChange}
                      className="hidden"
                      accept="application/pdf"
                    />
                    <label 
                      htmlFor="bookPdf"
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-opacity"
                    >
                      <HiUpload size={18} />
                      Choose PDF
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Book ID (Unique)</label>
                  <input
                    name="bookId"
                    value={bookForm.bookId}
                    onChange={handleChange}
                    placeholder="Enter unique book ID..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Book Title</label>
                  <input
                    name="title"
                    value={bookForm.title}
                    onChange={handleChange}
                    placeholder="Enter book title..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Author Name</label>
                  <input
                    name="author"
                    value={bookForm.author}
                    onChange={handleChange}
                    placeholder="Enter author name..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Department (Optional)</label>
                  <input
                    name="department"
                    value={bookForm.department}
                    onChange={handleChange}
                    placeholder="e.g. BSCS, IT, BBA (Leave empty for General)..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                  <input
                    name="category"
                    value={bookForm.category}
                    onChange={handleChange}
                    placeholder="e.g. Programming, Finance..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Total Stock Copies</label>
                  <input
                    name="available"
                    type="number"
                    min="0"
                    value={bookForm.available}
                    onChange={handleChange}
                    placeholder="Number of copies..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Shelf Number</label>
                  <input
                    name="shelf"
                    value={bookForm.shelf}
                    onChange={handleChange}
                    placeholder="e.g. A1, B3..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Cell / Position</label>
                  <input
                    name="cell"
                    value={bookForm.cell}
                    onChange={handleChange}
                    placeholder="e.g. 1, 5, Top..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {view === 'add' ? 'Confirm Addition' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('list'); resetForm(); }}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </motion.section>
  )
}

function calculateFine(daysBorrowed) {
  if (daysBorrowed < 2) return 0
  if (daysBorrowed === 2) return 100
  if (daysBorrowed === 3) return 200
  return 200 + (daysBorrowed - 3) * 75
}

function formatBorrowedAt(dateTime) {
  const date = new Date(dateTime)
  if (Number.isNaN(date)) return 'Unknown'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const emptyForm = {
  bookId: '',
  title: '',
  author: '',
  department: '',
  category: 'General',
  available: '1',
  shelf: '',
  cell: '',
  bookPdf: '',
}

export default LibrarianDashboard
