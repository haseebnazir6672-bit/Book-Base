import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'
import BookCard from '../../components/common/BookCard'
import {
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineLibrary,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineSparkles
} from 'react-icons/hi'

function HomePage({
  onContinue,
  loggedInRole,
  currentDepartment,
  filteredBooks,
  borrowedBooks,
  catalogBooks = [],
  departments = ['All'],
  onOpenStudentDashboard,
  onOpenKnowledgeHub,
  onBorrowBook,
  onRefresh,
}) {
  const location = useLocation()
  const [selectedDepartment, setSelectedDepartment] = useState('BSCS')
  const [selectedRole, setSelectedRole] = useState('student')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('All')
  const [showAllBooks, setShowAllBooks] = useState(false)

  const departmentOnly = useMemo(() => 
    (departments || []).filter((dept) => dept !== 'All'),
    [departments]
  )
  
  const categoryPills = useMemo(() => {
    const cats = new Set(catalogBooks.map(b => b.category).filter(Boolean))
    return ['All', ...Array.from(cats)]
  }, [catalogBooks])

  const recommendedBooks = useMemo(() => {
    return catalogBooks.slice(0, 8)
  }, [catalogBooks])

  const featuredBook = useMemo(() => {
    return catalogBooks[0] || null
  }, [catalogBooks])

  const filteredCategoryBooks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return catalogBooks.filter((book) => {
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory
      const matchesDepartment = filterDepartment === 'All' || book.department === filterDepartment
      const matchesSearch =
        !normalizedQuery ||
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesDepartment && matchesSearch
    })
  }, [catalogBooks, filterDepartment, searchQuery, selectedCategory])

  const allBooksForSeeAll = useMemo(
    () => catalogBooks,
    [catalogBooks],
  )

  const isBorrowedTitle = (title) =>
    borrowedBooks?.some((item) => item.title.toLowerCase() === String(title).trim().toLowerCase()) ?? false

  const getBorrowState = (catalogBook) => {
    if (!catalogBook) return { disabled: false, text: 'Borrow' }
    
    if (loggedInRole === 'student' && isBorrowedTitle(catalogBook.title)) {
      return { disabled: true, text: 'Already Borrowed' }
    }
    
    if (catalogBook.isBorrowed || catalogBook.available <= 0) {
      return { disabled: true, text: 'Not Available' }
    }
    
    return { disabled: false, text: 'Borrow' }
  }

  const stats = [
    { label: 'Books Available', value: catalogBooks.length, icon: HiOutlineBookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Members', value: '5,000+', icon: HiOutlineAcademicCap, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Books Issued', value: '12,500+', icon: HiOutlineLibrary, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Departments', value: departmentOnly.length || '15+', icon: HiOutlineAcademicCap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const features = [
    {
      title: 'Extensive Collection',
      description: 'Access a vast collection of books, journals, e-books, and more.',
      icon: HiOutlineBookOpen
    },
    {
      title: 'Easy Issue & Return',
      description: 'Hassle-free book issue and return system for students and staff.',
      icon: HiOutlineCheckCircle
    },
    {
      title: 'Track & Manage',
      description: 'Keep track of your borrowed books, due dates and history.',
      icon: HiOutlineLibrary
    },
    {
      title: 'Smart Notifications',
      description: 'Get timely reminders for due dates and important library updates.',
      icon: HiOutlineStar
    }
  ]

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const runHeroSearch = () => {
    // Uses existing `searchQuery` which filters the catalog below.
    setShowAllBooks(true)
    scrollToSection('browse-categories')
  }

  useEffect(() => {
    const hash = location.hash?.replace('#', '')
    if (!hash) return
    const el = document.getElementById(hash)
    if (!el) return
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }, [location.hash])

  return (
    <section className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div>
                <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">
                  Welcome to BookBase
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Knowledge <span className="text-amber-400">Empowers</span> You
                </h1>
                <p className="mt-4 text-slate-300 text-lg max-w-lg">
                  Your gateway to a world of knowledge. Explore thousands of books, digital resources and academic materials.
                </p>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-2">
                <HiOutlineSearch className="text-slate-400 ml-3" size={24} />
                <input 
                  type="text" 
                  placeholder="Search books, authors, categories..." 
                  className="flex-1 px-2 py-3 text-slate-800 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={runHeroSearch}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllBooks(true)
                    scrollToSection('library-catalog')
                  }}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <HiOutlineBookOpen className="text-amber-400" />
                  <span>Search Books</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('browse-categories')}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <HiOutlineLibrary className="text-amber-400" />
                  <span>Browse Categories</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('featured-book')}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <HiOutlineCheckCircle className="text-amber-400" />
                  <span>Check Availability</span>
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-3xl p-2 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1400"
                  alt="Library" 
                  className="w-full rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-amber-400 rounded-2xl p-4 shadow-lg">
                <HiOutlineSparkles className="text-slate-900" size={32} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-6 relative z-20">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4"
              >
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <stat.icon className={stat.color} size={28} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!loggedInRole ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
              <div className="shrink-0">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <HiOutlineUser className="text-blue-600" />
                  Quick Login
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choose your role and department, then continue to sign in.
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onOpenKnowledgeHub}
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 sm:w-auto sm:shrink-0"
                >
                  Open Knowledge Hub
                </button>
                {departmentOnly.length > 0 && (
                  <select
                    value={selectedDepartment}
                    onChange={(event) => setSelectedDepartment(event.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 sm:max-w-[11rem] sm:shrink-0"
                  >
                    {departmentOnly.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                )}
                <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
                  <motion.button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold sm:min-w-[5.5rem] ${
                      selectedRole === 'student'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Student
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setSelectedRole('librarian')}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold sm:min-w-[5.5rem] ${
                      selectedRole === 'librarian'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Librarian
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold sm:min-w-[5.5rem] ${
                      selectedRole === 'admin'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Admin
                  </motion.button>
                </div>
                <button
                  type="button"
                  onClick={() => onContinue(selectedRole, selectedDepartment)}
                  className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 sm:w-auto sm:shrink-0 flex items-center gap-2"
                >
                  Continue to Dashboard
                  <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Features Section */}
      <div id="resources-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">
            Why Choose BookBase?
          </p>
          <h2 className="text-3xl font-black text-slate-800">
            Everything You Need in One Place
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="bg-blue-50 p-3 rounded-xl w-fit mb-4">
                <feature.icon className="text-blue-600" size={28} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Books Section */}
      <div id="library-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {/* Recommended Books */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <HiOutlineStar className="text-amber-500" />
                    Recommended Books
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Curated collection just for you</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllBooks((prev) => !prev)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                >
                  {showAllBooks ? 'Show Less' : 'See All'}
                </button>
              </div>
              {recommendedBooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {recommendedBooks.map((book) => {
                    const borrowed = isBorrowedTitle(book.title)
                    return (
                      <BookCard 
                        key={book._id || book.id} 
                        book={book} 
                        onBorrow={onBorrowBook} 
                        borrowDisabled={borrowed} 
                        loggedInRole={loggedInRole}
                        onRefresh={onRefresh}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">No recommended books yet.</p>
                </div>
              )}

              {showAllBooks ? (
                <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">Full Library Catalog</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-black rounded-lg">
                      {allBooksForSeeAll.length} Titles
                    </span>
                  </div>
                  {allBooksForSeeAll.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {allBooksForSeeAll.map((book) => {
                        const borrowed = isBorrowedTitle(book.title)
                        return (
                          <BookCard 
                            key={`all-${book._id || book.id}`} 
                            book={book} 
                            onBorrow={onBorrowBook} 
                            borrowDisabled={borrowed} 
                            loggedInRole={loggedInRole}
                            onRefresh={onRefresh}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-slate-500 font-bold">The library catalog is currently empty.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Categories & Filter */}
            <div id="browse-categories" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <HiOutlineLibrary className="text-blue-600" />
                Browse by Category
              </h2>
              
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Filter by title or author"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterDepartment}
                  onChange={(event) => setFilterDepartment(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department === 'All' ? 'All Departments' : department}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setFilterDepartment('All')
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {categoryPills.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {filteredCategoryBooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredCategoryBooks.map((book) => {
                    const borrowed = isBorrowedTitle(book.title)
                    return (
                      <BookCard 
                        key={book._id || book.id} 
                        book={book} 
                        onBorrow={onBorrowBook} 
                        borrowDisabled={borrowed} 
                        loggedInRole={loggedInRole}
                        onRefresh={onRefresh}
                      />
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No books found for the selected filters.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Featured Book */}
            {featuredBook ? (
              <div id="featured-book" className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-white shadow-xl">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  Featured Book
                </div>
                {featuredBook.bookImage ? (
                  <img
                    src={featuredBook.bookImage}
                    alt={featuredBook.title}
                    className="h-64 w-full rounded-2xl object-cover shadow-2xl"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-800">
                    <HiOutlineBookOpen className="text-6xl text-slate-600" />
                  </div>
                )}
                <h3 className="mt-5 text-2xl font-black truncate">{featuredBook.title}</h3>
                <p className="text-sm text-blue-200 truncate mt-1">{featuredBook.author}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  A must-read for every student. This book has transformed the way thousands approach their studies.
                </p>
                <button 
                  type="button" 
                  onClick={() => onBorrowBook?.(featuredBook)}
                  className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-900 hover:bg-amber-300 transition-colors shadow-lg"
                >
                  Borrow Now
                </button>
              </div>
            ) : null}

            {/* Quick Tips */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <HiOutlineClock className="text-blue-600" />
                Library Hours
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-bold text-slate-800">8:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-bold text-slate-800">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-bold text-slate-800">Closed</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <HiOutlineBookOpen size={48} className="text-amber-400" />
                <div>
                  <h3 className="text-xl font-black">A good library is the foundation of knowledge.</h3>
                  <p className="text-slate-300 text-sm mt-1">Join our library and start your learning journey today!</p>
                </div>
              </div>
              {!loggedInRole && (
                <button 
                  onClick={() => {
                    scrollToSection('resources-section')
                    onContinue('student', selectedDepartment)
                  }}
                  className="bg-amber-400 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors flex items-center gap-2"
                >
                  Explore Resources
                  <HiOutlineArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple informational sections for footer links */}
      <div id="about-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-black text-slate-900">About Us</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          BookBase helps institutions manage books, members, issuing, returns, and fines with a modern interface.
        </p>
      </div>

      <div id="contact-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-black text-slate-900">Contact Us</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          For support, email <span className="font-semibold">support@bookbase.com</span> or contact your library administrator.
        </p>
      </div>

      <div id="privacy" className="sr-only">Privacy</div>
      <div id="terms" className="sr-only">Terms</div>
      <div id="faq" className="sr-only">FAQ</div>
    </section>
  )
}

export default HomePage
