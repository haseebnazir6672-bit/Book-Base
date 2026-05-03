import { useEffect, useState } from 'react'
import { HiMoon, HiOutlineBell, HiOutlineMenuAlt2, HiOutlineSearch, HiSun, HiOutlineUser, HiOutlineAcademicCap, HiOutlineLibrary, HiOutlineShieldCheck, HiOutlineChevronDown } from 'react-icons/hi'

function Navbar({
  pageTitle,
  onMenuClick,
  searchTerm,
  onSearch,
  loggedInRole,
  onLogout,
  onNotificationsClick,
  theme,
  onToggleTheme,
  centerLabel,
  hideMenuButton,
  userName,
  hideUserControls,
  onStudentProfileClick,
  hideNotifications,
  profileImage,
  userEmail,
  unreadCount,
  onLoginSelect,
  onKnowledgeHubSelect,
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm)
  const [showLoginDropdown, setShowLoginDropdown] = useState(false)

  const getInitials = (email) => {
    if (!email) return 'U'
    return email.substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    setLocalSearch(searchTerm)
  }, [searchTerm])

  const submitSearch = (event) => {
    event.preventDefault()
    onSearch(localSearch)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-blue-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 ">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-2 px-3 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">BookBase</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{pageTitle}</p>
          </div>
        </div>

          <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 lg:flex-nowrap">
            <form
              className="order-3 flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-900 lg:order-0 lg:w-80"
              onSubmit={submitSearch}
            >
            <HiOutlineSearch className="text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              value={localSearch}
              onChange={(event) => {
                setLocalSearch(event.target.value)
                if (!event.target.value.trim()) onSearch('')
              }}
              placeholder="Search your favourite books"
              className="w-full bg-transparent px-2 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500 sm:text-sm"
            />
            </form>
            <button
              type="button"
              onClick={onToggleTheme}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:p-2.5"
              aria-label={theme === 'dark' ? 'Current mode dark, switch to light mode' : 'Current mode light, switch to dark mode'}
              title={theme === 'dark' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'dark' ? <HiMoon size={18} /> : <HiSun size={18} />}
            </button>
            {hideNotifications ? null : (
              <button
                type="button"
                onClick={onNotificationsClick}
                className="relative shrink-0 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:p-2.5"
              >
                <HiOutlineBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            {loggedInRole && !hideUserControls ? (
              <div className="flex shrink-0 items-center gap-2">
                {(loggedInRole === 'student' || loggedInRole === 'librarian') && onStudentProfileClick ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    onClick={() => onStudentProfileClick()}
                    title="Open profile"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-slate-300 object-cover dark:border-slate-700 sm:h-9 sm:w-9"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-blue-600 text-[10px] font-bold text-white dark:border-slate-700 sm:h-9 sm:w-9 sm:text-xs">
                        {getInitials(userEmail)}
                      </div>
                    )}
                  </button>
                ) : (
                  profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-8 w-8 shrink-0 rounded-full border border-slate-300 object-cover dark:border-slate-700 sm:h-9 sm:w-9"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-blue-600 text-[10px] font-bold text-white dark:border-slate-700 sm:h-9 sm:w-9 sm:text-xs">
                      {getInitials(userEmail)}
                    </div>
                  )
                )}
                <div className="hidden max-w-28 flex-col leading-tight sm:flex">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {userName || 'User'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{loggedInRole}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl bg-rose-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 sm:px-3 sm:text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              onLoginSelect && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    <HiOutlineUser size={18} />
                    <span className="hidden sm:inline">Login</span>
                    <HiOutlineChevronDown className={`transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} size={16} />
                  </button>

                  {showLoginDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginDropdown(false);
                            onLoginSelect('student');
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                        >
                          <HiOutlineAcademicCap className="text-blue-600" size={20} />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">Student</p>
                            <p className="text-xs text-slate-500">Access student portal</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginDropdown(false);
                            onLoginSelect('librarian');
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                        >
                          <HiOutlineLibrary className="text-purple-600" size={20} />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">Librarian</p>
                            <p className="text-xs text-slate-500">Manage library operations</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginDropdown(false);
                            onLoginSelect('admin');
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                        >
                          <HiOutlineShieldCheck className="text-amber-600" size={20} />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">Admin</p>
                            <p className="text-xs text-slate-500">Full system administration</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginDropdown(false);
                            onKnowledgeHubSelect?.();
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                        >
                          <HiOutlineLibrary className="text-indigo-600" size={20} />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">Knowledge Hub</p>
                            <p className="text-xs text-slate-500">Open institute sharing portal</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {centerLabel ? (
          <div className="flex w-full justify-center">
            <div className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              {centerLabel}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Navbar
