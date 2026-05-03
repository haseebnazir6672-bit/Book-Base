import jwt from 'jsonwebtoken'

const verifyTokenWithScope = (req, res, expectedScope) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ msg: 'Access denied. No token provided.' })
    return null
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const tokenScope = decoded.scope || 'library'
    if (tokenScope !== expectedScope) {
      res.status(401).json({ msg: 'Session mismatch. Please login through the correct portal.' })
      return null
    }
    return decoded
  } catch (error) {
    res.status(401).json({ msg: 'Invalid or expired token.' })
    return null
  }
}

// ==================== PROTECT: Verify JWT ====================
export const protect = (req, res, next) => {
  const decoded = verifyTokenWithScope(req, res, 'library')
  if (!decoded) return
  req.user = decoded
  next()
}

// ==================== HUB PROTECT: Verify Hub JWT ====================
export const protectHub = (req, res, next) => {
  const decoded = verifyTokenWithScope(req, res, 'knowledge_hub')
  if (!decoded) return
  req.user = decoded
  next()
}

// ==================== ADMIN ONLY ====================
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' })
  }
  next()
}

// ==================== LIBRARIAN ONLY ====================
export const librarianOnly = (req, res, next) => {
  if (req.user?.role !== 'librarian') {
    return res.status(403).json({ msg: 'Access denied. Librarians only.' })
  }
  next()
}

// ==================== ADMIN OR LIBRARIAN ====================
export const adminOrLibrarian = (req, res, next) => {
  const role = req.user?.role
  if (role !== 'admin' && role !== 'librarian') {
    return res.status(403).json({ msg: 'Access denied. Admins or Librarians only.' })
  }
  next()
}

// ==================== STUDENT ONLY ====================
export const studentOnly = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ msg: 'Access denied. Students only.' })
  }
  next()
}