
import jwt from 'jsonwebtoken'

// Test JWT creation and decoding
const testUser = { _id: '123', role: 'librarian' }
const token = jwt.sign(
  { id: testUser._id, role: testUser.role },
  'zees12434453',
  { expiresIn: '7d' }
)
console.log('Test Token:', token)
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Decoded Payload:', payload)
console.log('Role:', payload.role)
