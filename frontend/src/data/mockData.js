export const departments = [
  'All',
  'BSCS',
  'BBA',
  'Electrical Engineering',
  'Mathematics',
  'English Literature',
]

export const books = [
  { _id: '662650000000000000000001', id: 1, title: 'Data Structures and Algorithms', author: 'Narasimha Karumanchi', department: 'BSCS', category: 'Programming', available: 4 },
  { _id: '662650000000000000000002', id: 2, title: 'Information Technology', author: 'S. Jaiswal', department: 'BSCS', category: 'IT', available: 3 },
  { _id: '662650000000000000000003', id: 3, title: 'Digital Logic Design', author: 'Morris Mano', department: 'BSCS', category: 'Electronics', available: 5 },
  { _id: '662650000000000000000004', id: 4, title: 'Linear Algebra', author: 'Gilbert Strang', department: 'BSCS', category: 'Core', available: 6 },
  { _id: '662650000000000000000005', id: 5, title: 'Computer Networking', author: 'Andrew S. Tanenbaum', department: 'BSCS', category: 'Networking', available: 4 },
  { _id: '662650000000000000000006', id: 6, title: 'Financial Accounting', author: 'Jerry Weygandt', department: 'BBA', category: 'Finance', available: 6 },
  { _id: '662650000000000000000007', id: 7, title: 'Marketing Management', author: 'Philip Kotler', department: 'BBA', category: 'Marketing', available: 4 },
  { _id: '662650000000000000000008', id: 8, title: 'Signals and Systems', author: 'Simon Haykin', department: 'Electrical Engineering', category: 'Core', available: 3 },
  { _id: '662650000000000000000009', id: 9, title: 'Real Analysis', author: 'Walter Rudin', department: 'Mathematics', category: 'Advanced', available: 2 },
  { _id: '662650000000000000000010', id: 10, title: 'Modern Poetry', author: 'James Scully', department: 'English Literature', category: 'Poetry', available: 5 },
]

export const borrowedRecords = [
  {
    id: 1,
    student: 'Ayesha Khan',
    regNo: 'FA22-BCS-101',
    bookTitle: 'Operating System Concepts',
    type: 'Systems',
    daysBorrowed: 1,
    borrowedAt: '2026-04-18T09:30:00',
  },
  {
    id: 2,
    student: 'Ali Raza',
    regNo: 'FA21-BBA-087',
    bookTitle: 'Marketing Management',
    type: 'Marketing',
    daysBorrowed: 2,
    borrowedAt: '2026-04-17T14:15:00',
  },
  {
    id: 3,
    student: 'Hassan Malik',
    regNo: 'SP22-BEE-210',
    bookTitle: 'Signals and Systems',
    type: 'Core',
    daysBorrowed: 4,
    borrowedAt: '2026-04-14T11:05:00',
  },
  {
    id: 4,
    student: 'Noor Fatima',
    regNo: 'FA23-BSM-041',
    bookTitle: 'Linear Algebra',
    type: 'Core',
    daysBorrowed: 3,
    borrowedAt: '2026-04-15T16:45:00',
  },
]

export const monthlyBooksStats = [
  { month: 'Jan', books: 92 },
  { month: 'Feb', books: 110 },
  { month: 'Mar', books: 128 },
  { month: 'Apr', books: 121 },
  { month: 'May', books: 140 },
  { month: 'Jun', books: 156 },
]

export const borrowCategoryStats = [
  { name: 'Programming', value: 28 },
  { name: 'Systems', value: 18 },
  { name: 'Marketing', value: 16 },
  { name: 'Core', value: 24 },
  { name: 'Poetry', value: 14 },
]

export const studentBorrowedBooks = [
  { id: 1, title: 'Operating System Concepts', borrowedOn: '2026-04-10', dueInDays: 2, status: 'Due Soon' },
  { id: 2, title: 'Data Structures and Algorithms', borrowedOn: '2026-04-08', dueInDays: -1, status: 'Overdue' },
]

export const reviews = [
  { id: 1, book: 'Computer Networks', rating: 4.6, comment: 'Excellent explanation of TCP/IP concepts with practical examples.', reviewer: 'Ayesha Khan' },
  { id: 2, book: 'Linear Algebra', rating: 4.4, comment: 'Very clear exercises and useful proofs for semester preparation.', reviewer: 'Ali Raza' },
  { id: 3, book: 'Data Structures and Algorithms', rating: 4.8, comment: 'In-depth coverage of algorithms with real-world applications.', reviewer: 'Hassan Malik' },
  { id: 4, book: 'Operating System Concepts', rating: 4.5, comment: 'Great for understanding OS fundamentals.', reviewer: 'Noor Fatima' },
  { id: 5, book: 'Financial Accounting', rating: 4.2, comment: 'Comprehensive guide to accounting principles.', reviewer: 'Sara Ahmed' },
  { id: 6, book: 'Marketing Management', rating: 4.7, comment: 'Insightful strategies for marketing.', reviewer: 'Bilal Khan' },
  { id: 7, book: 'Signals and Systems', rating: 4.3, comment: 'Good mathematical foundation for engineering.', reviewer: 'Zara Iqbal' },
  { id: 8, book: 'Real Analysis', rating: 4.9, comment: 'Advanced topics explained simply.', reviewer: 'Hasan Ahmed' },
]

export const students = [
  { id: 1, fullName: 'Ayesha Khan', regNo: 'FA22-BCS-101', email: 'ayesha.khan@university.edu', department: 'BSCS', semester: '6', phone: '+92 300 1234567', status: 'active' },
  { id: 2, fullName: 'Ali Raza', regNo: 'FA21-BBA-087', email: 'ali.raza@university.edu', department: 'BBA', semester: '7', phone: '+92 301 9876543', status: 'active' },
  { id: 3, fullName: 'Noor Fatima', regNo: 'FA23-BSM-041', email: 'noor.fatima@university.edu', department: 'Mathematics', semester: '2', phone: '+92 333 7771122', status: 'inactive' },
]

export const teachers = [
  { id: 1, fullName: 'Dr. Hasan Ahmed', employeeId: 'EMP-1021', email: 'hasan.ahmed@university.edu', department: 'BSCS', designation: 'Senior Lecturer', phone: '+92 312 5558811', status: 'active' },
  { id: 2, fullName: 'Ms. Zara Iqbal', employeeId: 'EMP-1177', email: 'zara.iqbal@university.edu', department: 'English Literature', designation: 'Lecturer', phone: '+92 322 7711990', status: 'active' },
  { id: 3, fullName: 'Engr. Bilal Khan', employeeId: 'EMP-1304', email: 'bilal.khan@university.edu', department: 'Electrical Engineering', designation: 'Assistant Professor', phone: '+92 300 1122334', status: 'inactive' },
]
