import { useMemo, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { axiosInstance } from '../../api/axios'
import {
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineCollection,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineUserCircle,
  HiOutlineClipboardList,
  HiOutlineBookmark,
  HiOutlineCurrencyDollar,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineLogout,
  HiOutlineAcademicCap,
  HiOutlineChevronDown,
  HiOutlineX,
} from 'react-icons/hi'
import AdminOverviewPage from './sections/AdminOverviewPage'
import AdminBooksPage from './sections/AdminBooksPage'
import AdminCategoriesPage from './sections/AdminCategoriesPage'
import AdminMembersPage from './sections/AdminMembersPage'
import AdminStudentsPage from './sections/AdminStudentsPage'
import AdminLibrariansPage from './sections/AdminLibrariansPage'
import AdminIssueReturnPage from './sections/AdminIssueReturnPage'
import AdminReservationsPage from './sections/AdminReservationsPage'
import AdminFinesPage from './sections/AdminFinesPage'
import AdminKnowledgeHubStudentsPage from './sections/AdminKnowledgeHubStudentsPage'

const emptyStudent = {
  fullName: '',
  regNo: '',
  email: '',
  password: '',
  department: '',
  semester: '',
  phone: '',
  status: 'active',
}

const emptyLibrarian = {
  fullName: '',
  employeeId: '',
  email: '',
  password: '',
  designation: '',
  phone: '',
  status: 'active',
}

function AdminDashboard({ books, departments, onLogout, navigate, unreadCount }) {
  const [students, setStudents] = useState([])
  const [librarians, setLibrarians] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [timeRange, setTimeRange] = useState('thisMonth') // 'thisMonth' or 'allTime'
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateRecords, setDateRecords] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    returned: 0,
    overdue: 0,
    totalFine: 0,
    monthlyStats: [],
    categoryStats: []
  })

  const totalBooks = books?.length || 0
  const totalDepartments = departments?.length - 1 || 0 // Exclude 'All'
  const availableBooks = (books || []).reduce((sum, book) => sum + book.available, 0)

  const [studentForm, setStudentForm] = useState(emptyStudent)
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatus, setStudentStatus] = useState('all')

  const [librarianForm, setLibrarianForm] = useState(emptyLibrarian)
  const [editingLibrarianId, setEditingLibrarianId] = useState(null)
  const [librarianSearch, setLibrarianSearch] = useState('')
  const [librarianStatus, setLibrarianStatus] = useState('all')
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const universityDomain = import.meta.env.VITE_UNIVERSITY_EMAIL_DOMAIN || 'university.edu'

  const [hubStudentForm, setHubStudentForm] = useState(emptyStudent)
  const [editingHubStudentId, setEditingHubStudentId] = useState(null)
  const [hubStudentSearch, setHubStudentSearch] = useState('')
  const [hubStudentStatus, setHubStudentStatus] = useState('all')

  const fetchData = async () => {
    try {
      const params = timeRange === 'thisMonth' 
        ? { month: new Date().getMonth() + 1 } 
        : {}
      
      const [usersRes, statsRes, borrowRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/borrow/stats', { params }),
        axiosInstance.get('/borrow')
      ])
      setStudents(usersRes.data.filter(u => u.role === 'student'))
      setLibrarians(usersRes.data.filter(u => u.role === 'librarian'))
      setPendingUsers(usersRes.data.filter(u => u.status === 'pending'))
      setStats(statsRes.data)
      
      const selectedDateStr = selectedDate.toISOString().split('T')[0]
      const filteredRecords = borrowRes.data.filter(record => {
        const recordDate = new Date(record.borrowedAt).toISOString().split('T')[0]
        return recordDate === selectedDateStr
      })
      setDateRecords(filteredRecords)
    } catch (err) {
      toast.error('Failed to fetch dashboard data')
    }
  }

  const approveUser = async (id) => {
    if (!window.confirm('Approve this user?')) return
    try {
      await axiosInstance.put(`/users/${id}/approve`)
      toast.success('User approved successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error approving user')
    }
  }

  const rejectUser = async (id) => {
    if (!window.confirm('Reject this user?')) return
    try {
      await axiosInstance.put(`/users/${id}/reject`)
      toast.success('User rejected')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error rejecting user')
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange])

  useEffect(() => {
    const fetchDateRecords = async () => {
      try {
        const borrowRes = await axiosInstance.get('/borrow')
        const selectedDateStr = selectedDate.toISOString().split('T')[0]
        const filteredRecords = borrowRes.data.filter(record => {
          const recordDate = new Date(record.borrowedAt).toISOString().split('T')[0]
          return recordDate === selectedDateStr
        })
        setDateRecords(filteredRecords)
      } catch (err) {
        console.error('Error fetching date records:', err)
      }
    }
    fetchDateRecords()
  }, [selectedDate])

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    return students.filter((s) => {
      const name = s.name || s.fullName || ''
      const email = s.email || ''
      const regNo = s.regNo || ''
      const department = s.department || ''
      
      const matchesText =
        !q ||
        name.toLowerCase().includes(q) ||
        regNo.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        department.toLowerCase().includes(q)
      const matchesStatus = studentStatus === 'all' || s.status === studentStatus
      return matchesText && matchesStatus
    })
  }, [studentSearch, studentStatus, students])

  const filteredLibrarians = useMemo(() => {
    const q = librarianSearch.trim().toLowerCase()
    return librarians.filter((t) => {
      const name = t.name || t.fullName || ''
      const email = t.email || ''
      const employeeId = t.employeeId || ''
      const designation = t.designation || ''

      const matchesText =
        !q ||
        name.toLowerCase().includes(q) ||
        employeeId.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        designation.toLowerCase().includes(q)
      const matchesStatus = librarianStatus === 'all' || t.status === librarianStatus
      return matchesText && matchesStatus
    })
  }, [librarianSearch, librarianStatus, librarians])

  const filteredHubStudents = useMemo(() => {
    const q = hubStudentSearch.trim().toLowerCase()
    return students.filter((s) => {
      const email = String(s.email || '').toLowerCase()
      const name = String(s.name || s.fullName || '').toLowerCase()
      const regNo = String(s.regNo || '').toLowerCase()
      const department = String(s.department || '').toLowerCase()
      const isHubEligible = s.role === 'student' && email.endsWith(`@${universityDomain.toLowerCase()}`)
      const matchesText = !q || name.includes(q) || regNo.includes(q) || email.includes(q) || department.includes(q)
      const matchesStatus = hubStudentStatus === 'all' || s.status === hubStudentStatus
      return isHubEligible && matchesText && matchesStatus
    })
  }, [students, hubStudentSearch, hubStudentStatus, universityDomain])

  const resetStudentForm = () => {
    setStudentForm(emptyStudent)
    setEditingStudentId(null)
  }

  const resetLibrarianForm = () => {
    setLibrarianForm(emptyLibrarian)
    setEditingLibrarianId(null)
  }

  const resetHubStudentForm = () => {
    setHubStudentForm(emptyStudent)
    setEditingHubStudentId(null)
  }

  const saveStudent = async (event) => {
    event.preventDefault()
    const payload = {
      name: studentForm.fullName.trim(),
      regNo: studentForm.regNo.trim(),
      email: studentForm.email.trim(),
      password: studentForm.password.trim(),
      department: studentForm.department,
      semester: String(studentForm.semester).trim(),
      phone: studentForm.phone.trim(),
      status: studentForm.status,
      role: 'student',
    }
    if (!payload.name || !payload.email) return

    try {
      if (editingStudentId) {
        if (!payload.password) delete payload.password // Don't send empty password if not changing
        await axiosInstance.put(`/users/${editingStudentId}`, payload)
        toast.success('Student updated')
      } else {
        if (!payload.password) return toast.error('Password is required')
        await axiosInstance.post('/users/create', payload)
        toast.success('Student created')
      }
      fetchData()
      resetStudentForm()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving student')
    }
  }

  const saveLibrarian = async (event) => {
    event.preventDefault()
    const payload = {
      name: librarianForm.fullName.trim(),
      employeeId: librarianForm.employeeId.trim(),
      email: librarianForm.email.trim(),
      password: librarianForm.password.trim(),
      designation: librarianForm.designation.trim(),
      phone: librarianForm.phone.trim(),
      status: librarianForm.status,
      role: 'librarian',
    }
    if (!payload.name || !payload.email) return

    try {
      if (editingLibrarianId) {
        if (!payload.password) delete payload.password
        await axiosInstance.put(`/users/${editingLibrarianId}`, payload)
        toast.success('Librarian updated')
      } else {
        if (!payload.password) return toast.error('Password is required')
        await axiosInstance.post('/users/create', payload)
        toast.success('Librarian created')
      }
      fetchData()
      resetLibrarianForm()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving librarian')
    }
  }

  const startEditStudent = (s) => {
    setEditingStudentId(s._id || s.id)
    setStudentForm({
      fullName: s.name || s.fullName || '',
      regNo: s.regNo || '',
      email: s.email || '',
      password: '',
      department: s.department || '',
      semester: s.semester || '',
      phone: s.phone || '',
      status: s.status || 'active',
    })
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    try {
      await axiosInstance.delete(`/users/${id}`)
      toast.success('Student deleted')
      fetchData()
      if (editingStudentId === id) resetStudentForm()
    } catch (err) {
      toast.error('Error deleting student')
    }
  }

  const startEditLibrarian = (t) => {
    setEditingLibrarianId(t._id || t.id)
    setLibrarianForm({
      fullName: t.name || t.fullName || '',
      employeeId: t.employeeId || '',
      email: t.email || '',
      password: '',
      designation: t.designation || '',
      phone: t.phone || '',
      status: t.status || 'active',
    })
  }

  const blockStudent = async (id) => {
    if (!window.confirm('Are you sure you want to block this student?')) return
    try {
      await axiosInstance.put(`/users/${id}/block`)
      toast.success('Student blocked successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error blocking student')
    }
  }

  const unblockStudent = async (id) => {
    if (!window.confirm('Are you sure you want to unblock this student?')) return
    try {
      await axiosInstance.put(`/users/${id}/unblock`)
      toast.success('Student unblocked successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error unblocking student')
    }
  }

  const deleteLibrarian = async (id) => {
    if (!window.confirm('Are you sure you want to delete this librarian?')) return
    try {
      await axiosInstance.delete(`/users/${id}`)
      toast.success('Librarian deleted')
      fetchData()
      if (editingLibrarianId === id) resetLibrarianForm()
    } catch (err) {
      toast.error('Error deleting librarian')
    }
  }

  const saveHubStudent = async (event) => {
    event.preventDefault()
    const payload = {
      name: hubStudentForm.fullName.trim(),
      regNo: hubStudentForm.regNo.trim(),
      email: hubStudentForm.email.trim().toLowerCase(),
      password: hubStudentForm.password.trim(),
      department: hubStudentForm.department,
      semester: String(hubStudentForm.semester).trim(),
      phone: hubStudentForm.phone.trim(),
      status: hubStudentForm.status,
      role: 'student',
    }
    if (!payload.name || !payload.email) return
    if (!payload.email.endsWith(`@${universityDomain.toLowerCase()}`)) {
      return toast.error(`Only @${universityDomain} email is allowed for Knowledge Hub students`)
    }

    try {
      if (editingHubStudentId) {
        if (!payload.password) delete payload.password
        await axiosInstance.put(`/users/${editingHubStudentId}`, payload)
        toast.success('Knowledge Hub student updated')
      } else {
        if (!payload.password) return toast.error('Password is required')
        await axiosInstance.post('/users/create', payload)
        toast.success('Knowledge Hub student created')
      }
      fetchData()
      resetHubStudentForm()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving Knowledge Hub student')
    }
  }

  const startEditHubStudent = (s) => {
    setEditingHubStudentId(s._id || s.id)
    setHubStudentForm({
      fullName: s.name || s.fullName || '',
      regNo: s.regNo || '',
      email: s.email || '',
      password: '',
      department: s.department || '',
      semester: s.semester || '',
      phone: s.phone || '',
      status: s.status || 'active',
    })
  }

  const deleteHubStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Knowledge Hub student?')) return
    try {
      await axiosInstance.delete(`/users/${id}`)
      toast.success('Knowledge Hub student deleted')
      fetchData()
      if (editingHubStudentId === id) resetHubStudentForm()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error deleting Knowledge Hub student')
    }
  }

  const handleSidebarAction = (label) => {
    setActiveMenu(label)
    setDashboardSearch('')
    setStudentSearch('')
    setLibrarianSearch('')
    setHubStudentSearch('')
  }

  const handleTopSearch = (term) => {
    console.log('handleTopSearch called with term:', term, 'activeMenu:', activeMenu)
    setDashboardSearch(term)
    if (activeMenu === 'Students' || activeMenu === 'Members') setStudentSearch(term)
    if (activeMenu === 'Librarians' || activeMenu === 'Members') setLibrarianSearch(term)
    if (activeMenu === 'Knowledge Hub Students') setHubStudentSearch(term)
  }

  const renderActivePage = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="space-y-5">
            <AdminOverviewPage totalBooks={totalBooks} totalDepartments={totalDepartments} availableBooks={availableBooks} stats={stats} />
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
        )
      case 'Approval Queue':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Approval Queue</h2>
              <p className="text-sm text-slate-500">Review and approve/reject pending registrations</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Pending Users</p>
                <p className="text-2xl font-bold text-slate-800">{pendingUsers.length}</p>
              </div>
            </div>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No pending users to review
                        </td>
                      </tr>
                    ) : (
                      pendingUsers.map((user) => (
                        <tr key={user._id || user.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {user.name || user.fullName}
                          </td>
                          <td className="px-4 py-3 capitalize">{user.role}</td>
                          <td className="px-4 py-3">{user.regNo || user.employeeId || '-'}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.department || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => approveUser(user._id || user.id)}
                                className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectUser(user._id || user.id)}
                                className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-200"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        )
      case 'Books':
        return <AdminBooksPage books={books || []} searchTerm={dashboardSearch} />
      case 'Categories':
        return <AdminCategoriesPage books={books || []} searchTerm={dashboardSearch} />
      case 'Members':
        return <AdminMembersPage students={students} librarians={librarians} searchTerm={dashboardSearch} />
      case 'Students':
        return (
          <AdminStudentsPage
            students={students}
            departments={departments}
            filteredStudents={filteredStudents}
            studentForm={studentForm}
            editingStudentId={editingStudentId}
            studentSearch={studentSearch}
            studentStatus={studentStatus}
            setStudentForm={setStudentForm}
            setStudentSearch={setStudentSearch}
            setStudentStatus={setStudentStatus}
            saveStudent={saveStudent}
            resetStudentForm={resetStudentForm}
            startEditStudent={startEditStudent}
            deleteStudent={deleteStudent}
            blockStudent={blockStudent}
            unblockStudent={unblockStudent}
          />
        )
      case 'Librarians':
        return (
          <AdminLibrariansPage
            librarians={librarians}
            filteredLibrarians={filteredLibrarians}
            librarianForm={librarianForm}
            editingLibrarianId={editingLibrarianId}
            librarianSearch={librarianSearch}
            librarianStatus={librarianStatus}
            setLibrarianForm={setLibrarianForm}
            setLibrarianSearch={setLibrarianSearch}
            setLibrarianStatus={setLibrarianStatus}
            saveLibrarian={saveLibrarian}
            resetLibrarianForm={resetLibrarianForm}
            startEditLibrarian={startEditLibrarian}
            deleteLibrarian={deleteLibrarian}
          />
        )
      case 'Issue / Return':
        return <AdminIssueReturnPage stats={stats} />
      case 'Reservations':
        return <AdminReservationsPage books={books || []} />
      case 'Fines':
        return <AdminFinesPage stats={stats} onRefresh={fetchData} />
      case 'Knowledge Hub Students':
        return (
          <AdminKnowledgeHubStudentsPage
            hubStudents={filteredHubStudents}
            departments={departments}
            hubStudentForm={hubStudentForm}
            editingHubStudentId={editingHubStudentId}
            hubStudentSearch={hubStudentSearch}
            hubStudentStatus={hubStudentStatus}
            setHubStudentForm={setHubStudentForm}
            setHubStudentSearch={setHubStudentSearch}
            setHubStudentStatus={setHubStudentStatus}
            saveHubStudent={saveHubStudent}
            resetHubStudentForm={resetHubStudentForm}
            startEditHubStudent={startEditHubStudent}
            deleteHubStudent={deleteHubStudent}
            universityDomain={universityDomain}
          />
        )
      default:
        return <AdminOverviewPage totalBooks={totalBooks} totalDepartments={totalDepartments} availableBooks={availableBooks} stats={stats} />
    }
  }

  return (
    <section className="-m-4 min-h-screen bg-[#f6f8fc]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col bg-[#082a67] px-4 py-6 text-white lg:flex">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="rounded-lg bg-white/15 p-2">
              <HiOutlineBookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Library</p>
              <p className="text-xs text-white/75">Management System</p>
            </div>
          </div>

          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Main Menu</p>
          <nav className="mt-3 space-y-1.5">
            {[
              { label: 'Dashboard', icon: HiOutlineChartBar },
              { label: 'Approval Queue', icon: HiOutlineClipboardList },
              { label: 'Books', icon: HiOutlineBookOpen },
              { label: 'Categories', icon: HiOutlineCollection },
              { label: 'Members', icon: HiOutlineUsers },
              { label: 'Librarians', icon: HiOutlineUserGroup },
              { label: 'Students', icon: HiOutlineUserCircle },
              { label: 'Issue / Return', icon: HiOutlineCalendar },
              { label: 'Reservations', icon: HiOutlineBookmark },
              { label: 'Fines', icon: HiOutlineCurrencyDollar },
              { label: 'Knowledge Hub Students', icon: HiOutlineAcademicCap },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSidebarAction(label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeMenu === label ? 'bg-[#0f57d6] text-white shadow-md shadow-black/15' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-2 pt-6">
            <button
              type="button"
              onClick={() => onLogout?.('/login')}
              className="flex w-full items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              <HiOutlineLogout className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="w-full">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full min-w-0 flex-1 md:max-w-2xl">
                <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={dashboardSearch}
                  onChange={(e) => handleTopSearch(e.target.value)}
                  placeholder="Search books, members, transactions..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex w-full items-center justify-end gap-2 md:w-auto">
                <button 
                  type="button" 
                  onClick={() => navigate('/notifications')}
                  className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
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
                  onClick={() => onLogout?.('/login')}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  <HiOutlineLogout className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-4 py-5 sm:px-6">{renderActivePage()}</div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
