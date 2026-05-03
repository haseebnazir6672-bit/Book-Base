import BorrowRecord from '../models/BorrowRecord.js'
import Book from '../models/Book.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'

// Fine calculation logic: 100 Rs per day overdue
// Let's assume borrow period is 7 days by default (from studentBorrowBook)
function calculateFine(daysBorrowed, dueDate) {
  let overdueDays = 0
  if (dueDate) {
    overdueDays = Math.max(0, Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24)))
  } else {
    // Fallback if no due date: treat as overdue after 7 days
    overdueDays = Math.max(0, daysBorrowed - 7)
  }
  return overdueDays * 100
}

// ==================== BORROW A BOOK (Librarian issues) ====================
export const borrowBook = async (req, res) => {
  try {
    const { studentId, bookId, dueDate } = req.body

    if (!studentId || !bookId) {
      return res.status(400).json({ msg: 'Student ID and Book ID are required' })
    }

    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ msg: 'Book not found' })
    if (book.available <= 0) return res.status(400).json({ msg: 'No copies available' })

    // Fetch student details to store directly
    const studentUser = await User.findById(studentId)
    if (!studentUser) return res.status(404).json({ msg: 'Student not found' })
    if (studentUser.isBlocked) return res.status(403).json({ msg: 'Student is blocked and cannot borrow books' })

    // Check student borrow limit (max 3 books)
    const activeBorrows = await BorrowRecord.countDocuments({
      student: studentId,
      status: 'borrowed'
    })
    if (activeBorrows >= 3) {
      return res.status(400).json({ msg: 'This student has already borrowed 3 books. They must return one first.' })
    }

    // Create borrow record
    const record = await BorrowRecord.create({
      student: studentId,
      studentName: studentUser.name,
      regNo: studentUser.regNo,
      book: bookId,
      borrowedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      issuedBy: req.user.id,
    })

    // Reduce available copies
    book.available -= 1
    await book.save()

    const populated = await record.populate([
      { path: 'student', select: 'name email regNo department' },
      { path: 'book', select: 'title author department' },
    ])

    // Broadcast via socket
    if (req.io) {
      req.io.emit('book_status_update', {
        title: populated.book.title,
        studentName: populated.student.name,
        regNo: populated.student.regNo
      })
    }

    res.status(201).json({ msg: 'Book borrowed successfully', record: populated })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== STUDENT SELF-BORROW ====================
export const studentBorrowBook = async (req, res) => {
  try {
    // Ensure user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can use this endpoint' })
    }

    const studentId = req.user.id
    // Check if student is blocked
    const studentUser = await User.findById(studentId)
    if (studentUser && studentUser.isBlocked) {
      return res.status(403).json({ msg: 'Your account is blocked and you cannot borrow books' })
    }
    const { bookId } = req.body

    if (!bookId) {
      return res.status(400).json({ msg: 'Book ID is required' })
    }

    // Check student borrow limit (max 3 books)
    const activeBorrows = await BorrowRecord.countDocuments({
      student: studentId,
      status: 'borrowed'
    })
    if (activeBorrows >= 3) {
      return res.status(400).json({ msg: 'You have reached your borrow limit of 3 books. Please return a book first.' })
    }

    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ msg: 'Book not found' })
    if (book.available <= 0) return res.status(400).json({ msg: 'No copies available' })

    // Check if student already borrowed this book and hasn't returned it
    const existing = await BorrowRecord.findOne({
      student: studentId,
      book: bookId,
      status: 'borrowed'
    })
    if (existing) {
      return res.status(400).json({ msg: 'You already have an active borrow for this book' })
    }

    // Default due date: 7 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    if (!studentUser) return res.status(404).json({ msg: 'Student not found' })

    // Create borrow record
    const record = await BorrowRecord.create({
      student: studentId,
      studentName: studentUser.name,
      regNo: studentUser.regNo,
      book: bookId,
      borrowedAt: new Date(),
      dueDate: dueDate,
      issuedBy: studentId, // Self-issued
    })

    // Reduce available copies
    book.available -= 1
    await book.save()

    const populated = await record.populate([
      { path: 'student', select: 'name email regNo department' },
      { path: 'book', select: 'title author department' },
    ])

    // Find a librarian or admin to receive the notification
    const adminOrLibrarian = await User.findOne({ role: { $in: ['librarian', 'admin'] } })

    // Create notification for admin/librarian
    if (adminOrLibrarian) {
      await Notification.create({
        recipient: adminOrLibrarian._id,
        sender: studentId,
        title: 'New Book Borrowed',
        message: `${populated.student.name} (${populated.student.regNo}) borrowed "${populated.book.title}"`,
        type: 'borrow',
        borrowRecord: record._id
      })
    }

    // Broadcast via socket
    if (req.io) {
      req.io.emit('book_status_update', {
        title: populated.book.title,
        studentName: populated.student.name,
        regNo: populated.student.regNo
      })
    }

    res.status(201).json({ msg: 'Book borrowed successfully', record: populated })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== RETURN A BOOK ====================
export const returnBook = async (req, res) => {
  try {
    const { id } = req.params

    const record = await BorrowRecord.findById(id).populate('book').populate('student')
    if (!record) return res.status(404).json({ msg: 'Borrow record not found' })
    if (record.status === 'returned') {
      return res.status(400).json({ msg: 'Book already returned' })
    }

    const returnedAt = new Date()
    const daysBorrowed = Math.floor((returnedAt - record.borrowedAt) / (1000 * 60 * 60 * 24))
    const fine = calculateFine(daysBorrowed, record.dueDate)

    record.returnedAt = returnedAt
    record.status = 'returned'
    record.fine = fine
    await record.save()

    // Restore available copies
    const book = await Book.findById(record.book._id)
    if (book) {
      book.available += 1
      await book.save()
    }

    // Find an admin to send receipt to
    const admin = await User.findOne({ role: 'admin' })
    if (admin) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        type: 'general',
        title: 'Book Return Receipt',
        message: `Book "${record.book.title}" returned by ${record.student.name} (${record.student.regNo}). Fine: Rs ${fine}.`,
        borrowRecord: record._id,
        fineAmount: fine
      })

      if (req.io) {
        req.io.emit('send_private_notification', {
          recipientId: admin._id
        })
      }
    }

    res.json({ msg: 'Book returned successfully', fine, record })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET ALL BORROW RECORDS (Librarian) ====================
export const getBorrowRecords = async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status

    // Fetch all records without filtering by search in backend to avoid issues with population
    const records = await BorrowRecord.find(filter)
      .populate('student', 'name email regNo department')
      .populate('book', 'title author department')
      .sort({ createdAt: -1 })

    // Attach computed fine and ensure safety
    const enriched = records.map(r => {
      const obj = r.toObject()
      
      // Calculate days borrowed accurately
      const start = obj.borrowedAt ? new Date(obj.borrowedAt) : new Date()
      const end = obj.returnedAt ? new Date(obj.returnedAt) : new Date()
      
      const diffTime = Math.max(0, end - start)
      const daysBorrowed = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      obj.daysBorrowed = daysBorrowed
      obj.computedFine = calculateFine(daysBorrowed, obj.dueDate)
      
      // If overdue but status is still 'borrowed', we treat it as 'overdue' in frontend
      const overdueDays = obj.dueDate 
        ? Math.max(0, Math.floor((new Date() - new Date(obj.dueDate)) / (1000 * 60 * 60 * 24))) 
        : Math.max(0, daysBorrowed - 7)
      if (obj.status === 'borrowed' && overdueDays > 0) {
        obj.isOverdue = true
      }
      
      // Fallback for missing student/book info from DB (if they were deleted)
      if (!obj.student && (r.studentName || r.regNo)) {
        obj.student = {
          name: r.studentName || 'Deleted Student',
          regNo: r.regNo || 'N/A'
        }
      }
      
      return obj
    })

    res.json(enriched)
  } catch (err) {
    console.error('Error in getBorrowRecords:', err);
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET MY BORROWED BOOKS (Student) ====================
export const getMyBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ student: req.user.id })
      .populate('book', 'title author department category')
      .sort({ createdAt: -1 })

    const enriched = records.map(r => {
      const obj = r.toObject()
      const daysBorrowed = Math.floor((
        (obj.returnedAt || new Date()) - new Date(obj.borrowedAt)
      ) / (1000 * 60 * 60 * 24))
      obj.daysBorrowed = daysBorrowed
      obj.computedFine = calculateFine(daysBorrowed, obj.dueDate)
      return obj
    })

    res.json(enriched)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== BORROW STATS (Librarian Dashboard) ====================
export const getBorrowStats = async (req, res) => {
  try {
    const { month } = req.query; // month is 1-12, optional
    let matchStage = {};
    
    if (month) {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, parseInt(month) - 1, 1);
      const endDate = new Date(currentYear, parseInt(month), 0, 23, 59, 59, 999);
      matchStage = { borrowedAt: { $gte: startDate, $lte: endDate } };
    }

    const total = await BorrowRecord.countDocuments(matchStage)
    const active = await BorrowRecord.countDocuments({ ...matchStage, status: 'borrowed' })
    const returned = await BorrowRecord.countDocuments({ ...matchStage, status: 'returned' })

    // Overdue: borrowed and past due date
    const allActive = await BorrowRecord.find({ ...matchStage, status: 'borrowed' })
    const overdue = allActive.filter(r => {
      const overdueDays = r.dueDate 
        ? Math.max(0, Math.floor((new Date() - new Date(r.dueDate)) / (1000 * 60 * 60 * 24))) 
        : Math.max(0, Math.floor((new Date() - r.borrowedAt) / (1000 * 60 * 60 * 24)) - 7)
      return overdueDays > 0
    })

    const totalFine = overdue.reduce((sum, r) => {
      const daysBorrowed = Math.floor((new Date() - r.borrowedAt) / (1000 * 60 * 60 * 24))
      return sum + calculateFine(daysBorrowed, r.dueDate)
    }, 0)

    // Monthly stats for graph
    const monthlyStats = await BorrowRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: "$borrowedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const formattedMonthly = monthlyStats.map(item => ({
      month: months[item._id - 1],
      books: item.count
    }))

    // Daily stats for line graph (last 30 days) grouped by department
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyStatsByDept = await BorrowRecord.aggregate([
      { $match: { borrowedAt: { $gte: thirtyDaysAgo } } },
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "bookInfo"
        }
      },
      { $unwind: "$bookInfo" },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$borrowedAt" } },
            department: "$bookInfo.department"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ])

    // Get all unique departments
    const departments = [...new Set(dailyStatsByDept.map(item => item._id.department).filter(Boolean))]
    
    // Generate date range for last 30 days
    const dateRange = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dateRange.push(date.toISOString().split('T')[0])
    }

    // Build formatted data with each department as a series
    const formattedDaily = dateRange.map(date => {
      const dayData = { date }
      departments.forEach(dept => {
        const record = dailyStatsByDept.find(
          item => item._id.date === date && item._id.department === dept
        )
        dayData[dept] = record ? record.count : 0
      })
      return dayData
    })

    // Category stats for pie chart
    const categoryStats = await BorrowRecord.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "bookInfo"
        }
      },
      { $unwind: "$bookInfo" },
      {
        $group: {
          _id: "$bookInfo.category",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0
        }
      }
    ])

    res.json({ 
      total, 
      active, 
      returned, 
      overdue: overdue.length, 
      totalFine,
      monthlyStats: formattedMonthly,
      dailyStats: formattedDaily,
      departments: departments,
      categoryStats
    })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== CHECK FOR OVERDUE BOOKS AND AUTO-BLOCK STUDENTS ====================
export const checkOverdueAndBlock = async (req, res) => {
  try {
    const activeBorrows = await BorrowRecord.find({ status: 'borrowed' })
      .populate('student')
      .populate('book')

    const blockedStudents = []
    const notifications = []

    for (const record of activeBorrows) {
      const overdueDays = record.dueDate 
        ? Math.max(0, Math.floor((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)))
        : Math.max(0, Math.floor((new Date() - record.borrowedAt) / (1000 * 60 * 60 * 24)) - 7)

      // If overdue for 15 days or more and student isn't already blocked
      if (overdueDays >= 15 && !record.student.isBlocked) {
        // Block the student
        record.student.isBlocked = true
        record.student.blockedAt = new Date()
        // If req has user (admin/librarian), set blockedBy
        if (req?.user?.id) {
          record.student.blockedBy = req.user.id
        }
        await record.student.save()
        blockedStudents.push(record.student)

        // Find an admin to notify
        const admin = await User.findOne({ role: 'admin' })

        // Create notification for admin
        if (admin) {
          const notif = await Notification.create({
            recipient: admin._id,
            sender: null,
            type: 'warning',
            title: 'Student Auto-Blocked',
            message: `${record.student.name} (${record.student.regNo}) has been automatically blocked for overdue book: "${record.book.title}". Overdue by ${overdueDays} days.`,
            borrowRecord: record._id
          })
          notifications.push(notif)

          // Emit socket event to admin
          if (req?.io) {
            req.io.emit('send_private_notification', {
              recipientId: admin._id,
              notification: notif
            })
          }
        }

        // Create notification for the student
        await Notification.create({
          recipient: record.student._id,
          sender: null,
          type: 'warning',
          title: 'Account Blocked',
          message: `Your account has been blocked because you have overdue book "${record.book.title}" for ${overdueDays} days. Please contact admin to unblock.`,
          borrowRecord: record._id
        })
      }
    }

    if (res) {
      res.json({ 
        msg: `Checked ${activeBorrows.length} active borrows. Blocked ${blockedStudents.length} student(s).`, 
        blocked: blockedStudents.map(s => ({ id: s._id, name: s.name, regNo: s.regNo })),
        notifications: notifications.length
      })
    }

    return { blockedStudents, notifications }
  } catch (err) {
    console.error('Error in checkOverdueAndBlock:', err)
    if (res) {
      res.status(500).json({ msg: err.message })
    }
  }
}

// ==================== MARK FINE AS PAID ====================
export const markFineAsPaid = async (req, res) => {
  try {
    const { id } = req.params

    const record = await BorrowRecord.findById(id)
      .populate('student')
      .populate('book')
      .populate('finePaidBy', 'name')
    if (!record) return res.status(404).json({ msg: 'Borrow record not found' })

    if (record.fine <= 0) {
      return res.status(400).json({ msg: 'No fine to mark as paid' })
    }
    if (record.finePaid) {
      return res.status(400).json({ msg: 'Fine already marked as paid' })
    }

    // Get the admin/librarian name
    const paidByUser = await User.findById(req.user.id).select('name')
    const paidByName = paidByUser?.name || 'Librarian/Admin'

    record.finePaid = true
    record.finePaidAt = new Date()
    record.finePaidBy = req.user.id
    await record.save()

    // Create notification for the student
    try {
      await Notification.create({
        recipient: record.student._id,
        sender: req.user.id,
        type: 'general',
        title: 'Fine Paid',
        message: `Your fine of Rs ${record.fine} for book "${record.book?.title || 'Unknown Book'}" has been marked as paid.`
      })
    } catch (notifErr) {
      console.error('Failed to create notification for fine paid:', notifErr)
    }

    // Generate receipt data
    const receipt = {
      receiptId: `REC-${Date.now()}`,
      studentName: record.student.name,
      regNo: record.student.regNo,
      bookTitle: record.book?.title || 'Unknown Book',
      fineAmount: record.fine,
      paidAt: record.finePaidAt,
      paidBy: paidByName
    }

    res.json({ msg: 'Fine marked as paid successfully', record, receipt })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== DELETE BORROW RECORD (Librarian) ====================
export const deleteBorrowRecord = async (req, res) => {
  try {
    const { id } = req.params

    const record = await BorrowRecord.findById(id)
    if (!record) return res.status(404).json({ msg: 'Borrow record not found' })

    // If deleting an active borrow, we should restore the book stock
    if (record.status === 'borrowed') {
      const book = await Book.findById(record.book)
      if (book) {
        book.available += 1
        await book.save()
      }
    }

    await BorrowRecord.findByIdAndDelete(id)

    // Create a notification for the student
    try {
      const book = await Book.findById(record.book)
      await Notification.create({
        recipient: record.student,
        sender: req.user.id,
        type: 'general',
        title: 'Borrow Record Deleted',
        message: `Your borrow record for the book "${book?.title || 'Unknown Book'}" has been deleted by the librarian.`
      })
    } catch (notifErr) {
      console.error('Failed to create notification for deleted record:', notifErr)
    }

    // Broadcast update so student dashboard can refresh
    if (req.io) {
      req.io.emit('borrow_record_deleted', { studentId: record.student })
      // Also emit a new notification event
      req.io.emit('new_notification', { recipientId: record.student })
    }

    res.json({ msg: 'Borrow record deleted successfully' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
