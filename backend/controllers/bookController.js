import Book from '../models/Book.js'

// ==================== ADD BOOK ====================
export const addBook = async (req, res) => {
  try {
    const { bookId, title, author, department, category, available, shelf, cell } = req.body

    if (!title || !author || !category || available === undefined || available === '') {
      return res.status(400).json({ msg: 'All fields except Book ID and Department are required' })
    }

    // Check if bookId already exists if provided
    if (bookId && bookId !== 'undefined' && bookId.trim() !== '') {
      const existing = await Book.findOne({ bookId: bookId.trim() });
      if (existing) {
        return res.status(400).json({ msg: 'A book with this ID already exists' });
      }
    }

    const copies = Number(available)
    if (isNaN(copies) || copies < 0) {
      return res.status(400).json({ msg: 'Available copies must be a valid non-negative number' })
    }

    const bookData = {
      bookId: (bookId && bookId !== 'undefined' && bookId.trim() !== '') ? bookId.trim() : undefined,
      title: title.trim(),
      author: author.trim(),
      department: department ? department.trim() : '',
      category: category.trim(),
      available: copies,
      totalCopies: copies,
      addedBy: req.user.id || req.user._id,
      shelf: shelf ? shelf.trim() : '',
      cell: cell ? cell.trim() : '',
    }

    // Handle book image and PDF upload
    if (req.files) {
      if (req.files.bookImage && req.files.bookImage[0]) {
        bookData.bookImage = req.files.bookImage[0].path
      }
      if (req.files.bookPdf && req.files.bookPdf[0]) {
        bookData.bookPdf = req.files.bookPdf[0].path
      }
    } else if (req.file && req.file.path) {
      // Fallback for single file upload
      bookData.bookImage = req.file.path
    }

    const book = await Book.create(bookData)

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('refresh_books', {
        title: book.title,
        author: book.author,
        category: book.category,
        bookImage: book.bookImage
      });
    }

    res.status(201).json({ msg: 'Book added successfully', book })
  } catch (err) {
    console.error('Add Book Error:', err)
    res.status(500).json({ msg: err.message || 'Internal Server Error' })
  }
}

// ==================== BULK ADD BOOKS ====================
export const bulkAddBooks = async (req, res) => {
  try {
    const { books } = req.body

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ msg: 'Please provide an array of books' })
    }

    const addedBooks = []
    const errors = []

    for (const book of books) {
      try {
        const { bookId, title, author, department, category, available, shelf, cell } = book

        if (!title || !author || !category || available === undefined) {
          errors.push({ title: title || 'Unknown', error: 'Missing required fields' })
          continue
        }

        // Check if bookId already exists if provided
        if (bookId && bookId !== 'undefined' && bookId.trim() !== '') {
          const existing = await Book.findOne({ bookId: bookId.trim() });
          if (existing) {
            errors.push({ title, error: `Book ID ${bookId} already exists` })
            continue
          }
        }

        const copies = Number(available)
        if (isNaN(copies) || copies < 0) {
          errors.push({ title, error: 'Available copies must be a non-negative number' })
          continue
        }

        const bookData = {
          bookId: (bookId && bookId !== 'undefined' && bookId.trim() !== '') ? bookId.trim() : undefined,
          title: title.trim(),
          author: author.trim(),
          department: department ? department.trim() : '',
          category: category.trim(),
          available: copies,
          totalCopies: copies,
          addedBy: req.user.id || req.user._id,
          shelf: shelf ? shelf.trim() : '',
          cell: cell ? cell.trim() : '',
        }

        const newBook = await Book.create(bookData)
        addedBooks.push(newBook)
      } catch (err) {
        errors.push({ title: book.title || 'Unknown', error: err.message })
      }
    }

    // Emit socket event if any books were added
    if (addedBooks.length > 0 && req.io) {
      req.io.emit('refresh_books', {
        bulk: true,
        count: addedBooks.length
      });
    }

    res.status(201).json({
      msg: `Processed ${books.length} books. Added: ${addedBooks.length}, Failed: ${errors.length}`,
      addedCount: addedBooks.length,
      failedCount: errors.length,
      errors
    })
  } catch (err) {
    console.error('Bulk Add Error:', err)
    res.status(500).json({ msg: err.message || 'Internal Server Error' })
  }
}

// ==================== GET ALL BOOKS ====================
export const getBooks = async (req, res) => {
  try {
    const { search, department, category } = req.query
    const filter = {}

    if (department && department !== 'All') filter.department = department
    if (category) filter.category = new RegExp(category, 'i')

    if (search) {
      const q = new RegExp(search, 'i')
      filter.$or = [{ title: q }, { author: q }, { department: q }, { category: q }]
    }

    const books = await Book.find(filter).sort({ createdAt: -1 })
    res.json(books)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET SINGLE BOOK ====================
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ msg: 'Book not found' })
    res.json(book)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== UPDATE BOOK ====================
export const updateBook = async (req, res) => {
  try {
    const { bookId, title, author, department, category, available, shelf, cell } = req.body
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ msg: 'Book not found' })

    if (bookId && bookId !== book.bookId) {
      const existing = await Book.findOne({ bookId });
      if (existing) {
        return res.status(400).json({ msg: 'A book with this ID already exists' });
      }
      book.bookId = bookId.trim();
    }
    
    if (title) book.title = title.trim()
    if (author) book.author = author.trim()
    book.department = department ? department.trim() : ''
    if (category) book.category = category.trim()
    if (shelf !== undefined) book.shelf = shelf ? shelf.trim() : ''
    if (cell !== undefined) book.cell = cell ? cell.trim() : ''

    if (available !== undefined) {
      const copies = Number(available)
      if (isNaN(copies) || copies < 0) {
        return res.status(400).json({ msg: 'Available copies must be a valid non-negative number' })
      }
      book.available = copies
    }

    // Handle book image and PDF upload
    if (req.files) {
      if (req.files.bookImage && req.files.bookImage[0]) {
        book.bookImage = req.files.bookImage[0].path
      }
      if (req.files.bookPdf && req.files.bookPdf[0]) {
        book.bookPdf = req.files.bookPdf[0].path
      }
    } else if (req.file && req.file.path) {
      // Fallback for single file upload
      book.bookImage = req.file.path
    }

    const updated = await book.save()
    res.json({ msg: 'Book updated successfully', book: updated })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== DELETE BOOK ====================
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ msg: 'Book not found' })
    await book.deleteOne()
    res.json({ msg: 'Book deleted successfully' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET BOOK STATS ====================
export const getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments()
    const totalAvailable = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$available' } } }
    ])
    const lowStock = await Book.countDocuments({ available: { $lte: 2 } })
    const departments = await Book.distinct('department')

    res.json({
      totalBooks,
      totalAvailable: totalAvailable[0]?.total || 0,
      lowStock,
      totalDepartments: departments.length,
    })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
