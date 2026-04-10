const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3002
const JWT_SECRET = 'cyclecorelims-secret-key-2024'

app.use(cors())
app.use(express.json())

// In-memory users with properly hashed passwords
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@cyclecorelims.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'labtech',
    email: 'labtech@cyclecorelims.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'lab_technician',
    firstName: 'Lab',
    lastName: 'Technician',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    username: 'manager',
    email: 'manager@cyclecorelims.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'manager',
    firstName: 'Lab',
    lastName: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString()
  }
]

let samples = [
  {
    id: 'SMP-ABC123-DEF',
    name: 'Blood Sample A',
    type: 'Blood',
    source: 'Patient 001',
    collectionDate: '2024-01-15',
    status: 'Design',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SMP-XYZ789-GHI',
    name: 'Tissue Sample B',
    type: 'Tissue',
    source: 'Patient 002',
    collectionDate: '2024-01-16',
    status: 'Validation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

let tests = [
  {
    id: uuidv4(),
    sampleId: 'SMP-ABC123-DEF',
    name: 'Complete Blood Count',
    type: 'Hematology',
    method: 'Automated Cell Counter',
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    sampleId: 'SMP-XYZ789-GHI',
    name: 'Histopathology',
    type: 'Pathology',
    method: 'Microscopic Examination',
    createdAt: new Date().toISOString()
  }
]

let results = [
  {
    id: uuidv4(),
    testId: tests[0].id,
    value: '4.5 million cells/mcL',
    unit: 'cells/mcL',
    status: 'Pass',
    complianceFlag: true,
    createdAt: new Date().toISOString()
  }
]

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    console.log('Login attempt:', { username, password })
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }
    
    const user = users.find(u => u.username === username && u.isActive)
    
    if (!user) {
      console.log('User not found:', username)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('Invalid password for:', username)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    console.log('Login successful for:', username)
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

function generateSampleId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `SMP-${timestamp}-${random}`
}

app.get('/api/samples', authenticateToken, (req, res) => {
  res.json(samples)
})

app.get('/api/samples/:id', authenticateToken, (req, res) => {
  const sample = samples.find(s => s.id === req.params.id)
  if (!sample) {
    return res.status(404).json({ error: 'Sample not found' })
  }
  res.json(sample)
})

app.post('/api/samples', authenticateToken, requireRole(['admin', 'lab_technician', 'manager']), (req, res) => {
  const { name, type, source, collectionDate } = req.body
  
  if (!name || !type || !source || !collectionDate) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const newSample = {
    id: generateSampleId(),
    name,
    type,
    source,
    collectionDate,
    status: 'Design',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  samples.push(newSample)
  res.status(201).json(newSample)
})

app.get('/api/tests', (req, res) => {
  const { sampleId } = req.query
  if (sampleId) {
    const sampleTests = tests.filter(t => t.sampleId === sampleId)
    res.json(sampleTests)
  } else {
    res.json(tests)
  }
})

app.post('/api/tests', (req, res) => {
  const { sampleId, name, type, method } = req.body
  
  if (!sampleId || !name || !type || !method) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const sampleExists = samples.find(s => s.id === sampleId)
  if (!sampleExists) {
    return res.status(400).json({ error: 'Sample not found' })
  }

  const newTest = {
    id: uuidv4(),
    sampleId,
    name,
    type,
    method,
    createdAt: new Date().toISOString()
  }

  tests.push(newTest)
  res.status(201).json(newTest)
})

app.get('/api/results', (req, res) => {
  const { testId } = req.query
  if (testId) {
    const testResults = results.filter(r => r.testId === testId)
    res.json(testResults)
  } else {
    res.json(results)
  }
})

app.post('/api/results', (req, res) => {
  const { testId, value, unit, status, complianceFlag } = req.body
  
  if (!testId || !value || !unit || !status || complianceFlag === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const testExists = tests.find(t => t.id === testId)
  if (!testExists) {
    return res.status(400).json({ error: 'Test not found' })
  }

  const newResult = {
    id: uuidv4(),
    testId,
    value,
    unit,
    status,
    complianceFlag: Boolean(complianceFlag),
    createdAt: new Date().toISOString()
  }

  results.push(newResult)
  res.status(201).json(newResult)
})

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalSamples: samples.length,
    samplesByStatus: {
      Design: samples.filter(s => s.status === 'Design').length,
      Validation: samples.filter(s => s.status === 'Validation').length,
      Approval: samples.filter(s => s.status === 'Approval').length,
      Completed: samples.filter(s => s.status === 'Completed').length,
    },
    totalTests: tests.length,
    totalResults: results.length,
    recentActivity: [
      ...samples.slice(-3).map(s => ({
        id: s.id,
        type: 'sample',
        action: 'created',
        timestamp: s.createdAt
      })),
      ...tests.slice(-3).map(t => ({
        id: t.id,
        type: 'test',
        action: 'created',
        timestamp: t.createdAt
      })),
      ...results.slice(-3).map(r => ({
        id: r.id,
        type: 'result',
        action: 'created',
        timestamp: r.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
  }
  
  res.json(stats)
})

app.listen(PORT, () => {
  console.log(`CycleCoreLIMS Server running on http://localhost:${PORT}`)
  console.log(`API Documentation: http://localhost:${PORT}/api`)
  console.log('\nDefault Login Credentials:')
  console.log('Admin: username=admin, password=password')
  console.log('Lab Technician: username=labtech, password=password')
  console.log('Manager: username=manager, password=password')
})
