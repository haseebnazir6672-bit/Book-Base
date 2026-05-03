import { useEffect, useMemo, useState, useCallback } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import ChatbotWidget from './components/chatbot/ChatbotWidget'

import HomePage from './pages/Home/HomePage'
import AboutUsPage from './pages/Home/AboutUsPage'
import PrivacyPolicyPage from './pages/Home/PrivacyPolicyPage'
import TermsOfServicePage from './pages/Home/TermsOfServicePage'
import ContactUsPage from './pages/Home/ContactUsPage'
import FAQPage from './pages/Home/FAQPage'
import LoginPage from './pages/Auth/LoginPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import LibrarianDashboard from './pages/Librarian/LibrarianDashboard'
import NotificationPage from './pages/Notification/NotificationPage'
import StudentDashboard from './pages/Student/StudentDashboard'
import BorrowBookPage from './pages/Student/BorrowBookPage'
import WriteReviewPage from './pages/Student/WriteReviewPage'
import KnowledgeHubPortal from './pages/KnowledgeHub/KnowledgeHubPortal'
import CreatePostPage from './pages/KnowledgeHub/CreatePostPage'
import UserProfilePage from './pages/KnowledgeHub/UserProfilePage'
import { KnowledgeHubProvider } from './contexts/KnowledgeHubContext'

// import { studentBorrowedBooks } from './data/mockData' // Removed unused import
import { logout } from './redux/authSlice'
import { axiosInstance } from './api/axios'

function App() {
  const [userName] = useState('zeeshan')

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('elibrary-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // ================= AUTH STATE =================
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const user = useMemo(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return { id: payload.id, role: payload.role }
      } catch (err) {
        return null
      }
    }
    return null
  }, [token])

  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [libraryBooks, setLibraryBooks] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [teachersList, setTeachersList] = useState([])
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [studentReviews, setStudentReviews] = useState([])
  const [borrowingBook, setBorrowingBook] = useState(null)
  const [activeStudentSection, setActiveStudentSection] = useState('home')
  const [userProfile, setUserProfile] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const location = useLocation()
  const navigate = useNavigate()

  // ================= FETCH DATA HELPERS =================
  const fetchBooks = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/books');
      setLibraryBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  }, []);

  // Load public catalog (works without login)
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // ================= FETCH USER PROFILE =================
  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const res = await axiosInstance.get('/users/profile');
          setUserProfile(res.data);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [token]);



  // ================= ROLE HELPERS =================
  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'
  const isLibrarian = user?.role === 'librarian'

  // ================= AUTHENTICATED USER UPDATES =================
  useEffect(() => {
    if (!token || !user) return;

    const fetchMyBorrowed = async () => {
      if (isStudent) {
        try {
          const res = await axiosInstance.get('/borrow/my-books');
          const mapped = res.data.map(r => ({
            id: r._id,
            title: r.book?.title || 'Unknown Book',
            borrowedOn: new Date(r.borrowedAt).toISOString().slice(0, 10),
            status: r.status === 'borrowed' ? 'Borrowed' : 'Returned'
          }));
          setBorrowedBooks(mapped);
        } catch (err) {
          console.error('Error fetching borrowed books:', err);
        }
      }
    };

    const fetchUsers = async () => {
      if (isAdmin) {
        try {
          const res = await axiosInstance.get('/users');
          const users = res.data;
          setStudentsList(users.filter(u => u.role === 'student'));
          setTeachersList(users.filter(u => u.role === 'teacher'));
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await axiosInstance.get('/notifications/unread-count');
        setUnreadCount(res.data.unread);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchBooks();
    fetchMyBorrowed();
    fetchUsers();
    fetchUnreadCount();
  }, [token, user, userProfile, isStudent, isAdmin, fetchBooks]);

  const handleAddReview = (review) => {
    setStudentReviews((prev) => [
      { id: Date.now(), ...review, date: new Date().toLocaleDateString() },
      ...prev,
    ])
  }

  // ================= THEME =================
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('elibrary-theme', theme)
  }, [theme])

  // ================= ACTIVE PAGE =================
  const activePage = useMemo(() => {
    if (location.pathname.startsWith('/knowledge-hub')) return 'knowledge-hub'
    if (location.pathname === '/about') return 'about'
    if (location.pathname === '/privacy') return 'privacy'
    if (location.pathname === '/terms') return 'terms'
    if (location.pathname === '/contact') return 'contact'
    if (location.pathname === '/faq') return 'faq'
    if (location.pathname === '/admin') return 'admin'
    if (location.pathname === '/librarian') return 'librarian'
    if (location.pathname === '/student/profile') return 'student-profile'
    if (location.pathname === '/student/library') return 'student-library'
    if (location.pathname === '/student/borrow') return 'student-borrow'
    if (location.pathname === '/notifications') return 'notifications'
    if (location.pathname === '/login') return 'login'
    return 'home'
  }, [location.pathname])

  useEffect(() => {
    if (activePage === 'notifications') {
      setUnreadCount(0)
    }
  }, [activePage])

  const departments = useMemo(() => {
    const depts = new Set(libraryBooks.map(b => b.department).filter(Boolean))
    return ['All', ...Array.from(depts)]
  }, [libraryBooks])

  // ================= SEARCH =================
  const filteredBooks = useMemo(() => {
    const byDept =
      selectedDepartment === 'All'
        ? libraryBooks
        : libraryBooks.filter(b => b.department === selectedDepartment)

    if (!searchTerm.trim()) return byDept

    const q = searchTerm.toLowerCase()

    return byDept.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    )
  }, [libraryBooks, selectedDepartment, searchTerm])

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (user?.role === 'librarian' || user?.role === 'admin') {
      // For librarian, we might be in the dashboard, let's see how books are passed
      // The books state is in App.jsx and passed to LibrarianDashboard
      // So setting searchTerm here should trigger the useMemo in LibrarianDashboard
    }
  }

  // ================= BORROW =================
  const handleBorrow = (book) => {
    if (book.available <= 0) {
      toast.clearWaitingQueue();
      toast.error('This book is currently not available.', { toastId: 'book-unavailable' })
      return
    }
    
    if (user?.role === 'librarian') {
      navigate('/librarian', { state: { borrowBook: book } })
    } else {
      setBorrowingBook(book)
      navigate('/student/borrow')
    }
  }

  const handleConfirmBorrow = async (book) => {
    toast.clearWaitingQueue();
    const loadingToastId = `borrow-loading-${book._id || book.id}`;
    const toastId = toast.loading(`Processing borrow request for "${book.title}"...`, { toastId: loadingToastId })
    try {
      // Call backend to borrow book
      const bookId = book._id || book.id;
      if (!bookId) {
        console.error('Book object missing ID:', book);
        toast.update(toastId, { 
          render: 'System Error: Book ID missing. Please contact librarian.', 
          type: 'error', 
          isLoading: false, 
          autoClose: 3000 
        });
        return;
      }

      const res = await axiosInstance.post('/borrow/student-borrow', {
        bookId: bookId
      });

      const newRecord = res.data.record;

      setBorrowedBooks(prev => [
        {
          id: newRecord._id,
          title: newRecord.book.title,
          borrowedOn: new Date(newRecord.borrowedAt).toISOString().slice(0, 10),
          status: 'Borrowed'
        },
        ...prev
      ]);

      // Refresh library books to update availability
      const booksRes = await axiosInstance.get('/books');
      setLibraryBooks(booksRes.data);
      
      setBorrowingBook(null)
      navigate('/student/library')
      toast.update(toastId, { render: `Successfully borrowed "${book.title}"!`, type: 'success', isLoading: false, autoClose: 3000 });
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to borrow book';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
    }
  }

  // ================= LOGOUT =================
  const handleLogout = (redirectPath = '/') => {
    dispatch(logout())
    setSelectedDepartment('All')
    setSearchTerm('')
    setUserProfile(null)
    navigate(redirectPath)
    toast.clearWaitingQueue();
    toast.success('Logged out successfully', { toastId: 'logout-success' })
  }

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  }

  // ================= PAGE TITLE =================
  const pageTitle = {
    home: 'Library Home',
    about: 'About Us',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact Us',
    faq: 'FAQ',
    admin: 'Admin Dashboard',
    librarian: 'Librarian Dashboard',
    'student-profile': 'Student Profile',
    'student-library': 'Student Dashboard',
    notifications: 'Notifications',
    login: 'Login'
  }[activePage]

  const hideSidebar =
    ['home', 'about', 'privacy', 'terms', 'contact', 'faq', 'login', 'notifications', 'student-borrow', 'admin', 'librarian', 'student-library'].includes(activePage)
  const useAdminFullLayout = activePage === 'admin'
  const useStudentLibraryFullLayout = activePage === 'student-library'
  const useLibrarianFullLayout = activePage === 'librarian'

  const isKnowledgeHubRoute = activePage === 'knowledge-hub'

  // ================= APP =================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-white">

      {!['login', 'admin', 'student-library', 'librarian'].includes(activePage) && !isKnowledgeHubRoute && (
        <Navbar
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          loggedInRole={user?.role || ''}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onNotificationsClick={() => navigate('/notifications')}
          onStudentProfileClick={() => {
            if (isStudent) navigate('/student/profile')
            else if (isLibrarian) navigate('/librarian', { state: { view: 'profile' } })
          }}
          onLoginSelect={(role) => {
            localStorage.setItem('selectedRole', role);
            navigate('/login');
          }}
          onKnowledgeHubSelect={() => navigate('/knowledge-hub')}
          userName={userProfile?.name || userName}
          profileImage={userProfile?.profileImage}
          userEmail={userProfile?.email}
          hideNotifications={activePage === 'login'}
          unreadCount={unreadCount}
        />
      )}

      <div className="flex">

        {!hideSidebar && (
          <Sidebar
            activePage={activePage}
            setActivePage={(page) => {
              if (page === 'admin') navigate('/admin');
              else if (page === 'librarian') navigate('/librarian');
              else if (page === 'student-library') navigate('/student/library');
              else if (page === 'student-profile') navigate('/student/profile');
            }}
            allowedPages={user?.role === 'admin' ? ['admin'] : user?.role === 'librarian' ? ['librarian'] : ['student-library']}
            selectedDepartment={selectedDepartment}
            borrowedBooks={borrowedBooks}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeStudentSection={activeStudentSection}
            setActiveStudentSection={setActiveStudentSection}
          />
        )}

        <main className={`w-full ${activePage === 'login' || useAdminFullLayout || useStudentLibraryFullLayout || useLibrarianFullLayout ? 'p-0' : 'p-4'}`}>

          <Routes>

            {/* HOME */}
            <Route 
              path="/" 
              element={
                isLibrarian ? (
                  <Navigate to="/librarian" replace />
                ) : (
                  <HomePage 
                    filteredBooks={filteredBooks} 
                    catalogBooks={libraryBooks}
                    departments={departments}
                    borrowedBooks={borrowedBooks}
                    loggedInRole={user?.role}
                    currentDepartment={selectedDepartment}
                    onBorrowBook={handleBorrow}
                    onOpenStudentDashboard={() => navigate('/student/library')}
                    onContinue={(role, dept) => {
                      localStorage.setItem('selectedRole', role);
                      navigate('/login');
                    }}
                    onOpenKnowledgeHub={() => navigate('/knowledge-hub')}
                    onRefresh={fetchBooks}
                  />
                )
              } 
            />

            {/* ABOUT US */}
            <Route path="/about" element={<AboutUsPage />} />

            {/* PRIVACY POLICY */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* TERMS OF SERVICE */}
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* CONTACT US */}
            <Route path="/contact" element={<ContactUsPage />} />

            {/* FAQ */}
            <Route path="/faq" element={<FAQPage />} />

            {/* LOGIN */}
            <Route path="/login" element={
              <LoginPage role={localStorage.getItem('selectedRole') || 'student'} />
            } />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={isAdmin ? <AdminDashboard books={libraryBooks} departments={departments} onLogout={handleLogout} students={studentsList} setStudents={setStudentsList} teachers={teachersList} setTeachers={setTeachersList} bookSearch={searchTerm} setBookSearch={setSearchTerm} navigate={navigate} unreadCount={unreadCount} /> : <Navigate to="/login" replace />}
            />

            {/* LIBRARIAN */}
            <Route
              path="/librarian"
              element={isLibrarian ? (
                <LibrarianDashboard 
                  books={libraryBooks} 
                  setBooks={setLibraryBooks} 
                  bookSearch={searchTerm} 
                  setBookSearch={setSearchTerm} 
                  onLogout={handleLogout}
                  userProfile={userProfile}
                  onProfileUpdate={handleProfileUpdate}
                  navigate={navigate}
                  unreadCount={unreadCount}
                />
              ) : <Navigate to="/login" replace />}
            />

            {/* STUDENT */}
            <Route
              path="/student/profile"
              element={isStudent ? <StudentDashboard 
                mode="profile"
                departments={departments}
                filteredBooks={filteredBooks}
                borrowedBooks={borrowedBooks}
                studentReviews={studentReviews}
                onBorrow={handleBorrow}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                activeStudentSection={activeStudentSection}
                setActiveStudentSection={setActiveStudentSection}
                onBackToHome={() => navigate('/')}
                onProfileUpdate={handleProfileUpdate}
                loggedInRole={user?.role}
                onRefresh={fetchBooks}
              /> : <Navigate to="/" />}
            />

            <Route
              path="/student/library"
              element={isStudent ? <StudentDashboard 
                mode="library"
                departments={departments}
                libraryBooks={libraryBooks}
                filteredBooks={filteredBooks}
                borrowedBooks={borrowedBooks}
                studentReviews={studentReviews}
                onBorrow={handleBorrow}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                activeStudentSection={activeStudentSection}
                setActiveStudentSection={setActiveStudentSection}
                onBackToHome={() => navigate('/')}
                onProfileUpdate={handleProfileUpdate}
                loggedInRole={user?.role}
                onRefresh={fetchBooks}
              /> : <Navigate to="/" />}
            />

            <Route
              path="/student/write-review"
              element={
                isStudent 
                  ? <WriteReviewPage borrowedBooks={borrowedBooks} onAddReview={handleAddReview} /> 
                  : <Navigate to="/student/library" />
              }
            />

            <Route
              path="/student/borrow"
              element={
                isStudent && borrowingBook
                  ? <BorrowBookPage book={borrowingBook} onConfirmBorrow={handleConfirmBorrow} borrowedBooks={borrowedBooks} onBack={() => navigate('/student/library')} />
                  : <Navigate to="/student/library" />
              }
            />

            {/* NOTIFICATIONS */}
            <Route
              path="/notifications"
              element={user ? <NotificationPage /> : <Navigate to="/" />}
            />

            <Route path="/knowledge-hub/*" element={
              <KnowledgeHubProvider>
                <Routes>
                  <Route path="" element={<KnowledgeHubPortal />} />
                  <Route path="create" element={<CreatePostPage />} />
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route path="profile/:userId" element={<UserProfilePage />} />
                </Routes>
              </KnowledgeHubProvider>
            } />

          </Routes>

        </main>
      </div>

      {!['login', 'admin', 'student-library', 'librarian'].includes(activePage) && !isKnowledgeHubRoute && <Footer />}
      {!['login', 'admin', 'librarian'].includes(activePage) && !isKnowledgeHubRoute && <ChatbotWidget loggedInRole={user?.role || ''} />}

      <ToastContainer
        position="top-center"
        theme={theme}
        limit={1}
        pauseOnFocusLoss={false}
      />
    </div>
  )
}

export default App