// Vercel serverless function for /api/users
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Mock database for demonstration - replace with real database in production
let users = [
  {
    id: '69c2c679e1b47ea9b0002584',
    username: 'admin',
    email: 'admin@cyclecorelims.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    isActive: true,
    createdAt: '2026-03-24T17:14:33.114+00:00'
  },
  {
    id: '69c2c679e1b47ea9b0002589',
    username: 'labtech',
    email: 'labtech@cyclecorelims.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'lab_technician',
    firstName: 'Lab',
    lastName: 'Technician',
    isActive: true,
    createdAt: '2026-03-24T17:14:33.127+00:00'
  },
  {
    id: '69c2c679e1b47ea9b000258c',
    username: 'manager',
    email: 'manager@cyclecorelims.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'manager',
    firstName: 'Lab',
    lastName: 'Manager',
    isActive: true,
    createdAt: '2026-03-24T17:14:33.131+00:00'
  },
  {
    id: '69c2c6c4e1b47ea9b0002592',
    username: 'shadab',
    email: 'shadab@cyclecorelms.com',
    password: '$2a$10$PkJEA/nC1BAIF.8oP4/Jpu0L00tl8aRD8g6kOnfymTvLYA84Fr0tm',
    role: 'manager',
    firstName: 'Shadab',
    lastName: 'Anwar',
    isActive: true,
    createdAt: '2026-03-24T17:15:48.152+00:00'
  }
]

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'cyclecorelims-secret-key-2024'

// Middleware to authenticate token
const authenticateToken = (req) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// Middleware to check role
const requireRole = (roles) => {
  return (user) => {
    return roles.includes(user?.role)
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const user = authenticateToken(req)
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Only admins can access user management
    if (!requireRole(['admin'])(user)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    if (req.method === 'GET') {
      // Return users without passwords
      const usersWithoutPasswords = users.map(u => {
        const { password, ...userWithoutPassword } = u
        return userWithoutPassword
      })
      
      return res.status(200).json(usersWithoutPasswords)
    }
    
    if (req.method === 'POST') {
      const { username, email, password, role, firstName, lastName } = req.body
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      
      // Check if user already exists
      const existingUser = users.find(u => u.username === username || u.email === email)
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' })
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        role: role || 'lab_technician',
        firstName,
        lastName,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      
      users.push(newUser)
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser
      return res.status(201).json(userWithoutPassword)
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Users API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
