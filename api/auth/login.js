// Vercel serverless function for /api/auth/login
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Mock users database - in production, this should be replaced with a real database
const users = [
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username
    const user = users.find(u => u.username === username)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
