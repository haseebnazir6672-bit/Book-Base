import { createElement } from 'react'
import {
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineLibrary,
  HiOutlinePencilAlt,
  HiOutlineUser,
  HiOutlineHome,
  HiX, // ✅ FIXED (added missing import)
} from 'react-icons/hi'

const navItems = [
  { id: 'admin', label: 'Admin', icon: HiOutlineChartBar },
  { id: 'librarian', label: 'Librarian', icon: HiOutlineLibrary },
  { id: 'student-library', label: 'My Library', icon: HiOutlineBookOpen },
]

function Sidebar({
  activePage,
  setActivePage,
  allowedPages,
  selectedDepartment,
  borrowedBooks,
  sidebarOpen,
  onClose,
  activeStudentSection,
  setActiveStudentSection,
}) {
  const visibleNavItems = navItems.filter((item) =>
    allowedPages.includes(item.id)
  )

  const overdueBooks = borrowedBooks.filter(
    (book) => book.status === 'Overdue'
  ).length

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-x-0 bottom-0 top-20 z-20 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed left-0 top-20 z-30 flex h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] w-[78vw] max-w-64 flex-col overflow-hidden border-r border-cyan-200 bg-cyan-50 p-3 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)] lg:max-h-none lg:w-60 lg:translate-x-0 lg:rounded-2xl lg:border ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <h2 className="text-base font-semibold text-cyan-900 dark:text-slate-100">
                Navigation
              </h2>
              <button
                type="button"
                className="rounded-lg p-1 text-cyan-700 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={onClose}
              >
                <HiX size={20} />
              </button>
            </div>

           
            {/* Navigation */}
            <nav className="space-y-1.5">
              {visibleNavItems.map(({ id, label, icon }) => {
                const isActive =
                  id === 'student-library'
                    ? activePage === 'student-profile' ||
                      activePage === 'student-library'
                    : activePage === id

                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setActivePage(id)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? 'bg-cyan-700 text-white shadow-sm'
                        : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {createElement(icon, { size: 18 })}
                    {label}
                  </button>
                )
              })}
            </nav>

            {/* Student Section */}
            {(activePage === 'student-profile' ||
              activePage === 'student-library') && (
              <div className="mt-4 space-y-2.5">

                {/* Snapshot */}
                <div className="rounded-xl bg-white p-2.5 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-slate-300">
                    Student Snapshot
                  </p>
                  <p className="mt-1.5 text-xs text-cyan-900 dark:text-slate-300">
                    Department: {selectedDepartment}
                  </p>
                  <p className="mt-1 text-xs text-cyan-900 dark:text-slate-300">
                    Borrowed: {borrowedBooks.length}
                  </p>
                  <p className="mt-1 text-xs text-rose-700">
                    Overdue: {overdueBooks}
                  </p>
                </div>

                {/* Quick Menu */}
                <div className="rounded-xl bg-white p-2.5 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-slate-300">
                    Quick Menu
                  </p>

                  <div className="mt-2 space-y-1.5 text-xs">
                    
                    <button
                      onClick={() => {
                        setActiveStudentSection('home')
                        if (activePage !== 'student-library') setActivePage('student-library')
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${
                        activePage === 'student-library' && activeStudentSection === 'home'
                          ? 'bg-cyan-700 text-white'
                          : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <HiOutlineHome size={16} />
                      Dashboard Home
                    </button>

                    <button
                      onClick={() => {
                        setActivePage('student-profile')
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${
                        activePage === 'student-profile'
                          ? 'bg-cyan-700 text-white'
                          : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <HiOutlineUser size={16} />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudentSection('departments')
                        if (activePage !== 'student-library') setActivePage('student-library')
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${
                        activePage === 'student-library' && activeStudentSection === 'departments'
                          ? 'bg-cyan-700 text-white'
                          : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <HiOutlineClipboardList size={16} />
                      Departments
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudentSection('books')
                        if (activePage !== 'student-library') setActivePage('student-library')
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${
                        activePage === 'student-library' && activeStudentSection === 'books'
                          ? 'bg-cyan-700 text-white'
                          : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <HiOutlineBookOpen size={16} />
                      Available Books
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudentSection('borrowed')
                        if (activePage !== 'student-library') setActivePage('student-library')
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${
                        activePage === 'student-library' && activeStudentSection === 'borrowed'
                          ? 'bg-cyan-700 text-white'
                          : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <HiOutlineLibrary size={16} />
                      My Borrowed Books
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudentSection('reviews')
                        if (activePage !== 'student-library') setActivePage('student-library')
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${
                        activePage === 'student-library' && activeStudentSection === 'reviews'
                          ? 'bg-cyan-700 text-white'
                          : 'text-cyan-900 hover:bg-cyan-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <HiOutlinePencilAlt size={16} />
                      My Reviews
                    </button>

                  </div>
                </div>

              </div>
            )}

          </div> {/* ✅ closed properly */}
        </div> {/* ✅ FIXED missing closing div */}
      </aside>
    </>
  )
}

export default Sidebar