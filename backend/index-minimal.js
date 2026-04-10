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

// In-memory users
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
  }
]

// In-memory storage
let samples = []
let tests = []
let results = []

// In-memory samples
samples = [
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

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }
    
    const user = users.find(u => u.username === username && u.isActive)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
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

// Sample Routes
app.get('/api/samples', authenticateToken, (req, res) => {
  console.log('GET /api/samples - returning samples:', samples.length)
  res.json(samples)
})

app.get('/api/samples/:id', authenticateToken, (req, res) => {
  const sample = samples.find(s => s.id === req.params.id)
  if (!sample) {
    return res.status(404).json({ error: 'Sample not found' })
  }
  console.log('GET /api/samples/:id - returning sample:', sample.id)
  res.json(sample)
})

app.post('/api/samples', authenticateToken, (req, res) => {
  const { name, type, source, collectionDate } = req.body
  
  if (!name || !type || !source || !collectionDate) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const newSample = {
    id: 'SMP-' + Date.now().toString(36).toUpperCase(),
    name,
    type,
    source,
    collectionDate,
    status: 'Design',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  samples.push(newSample)
  console.log('POST /api/samples - created sample:', newSample.id)
  res.status(201).json(newSample)
})

app.patch('/api/samples/:id', authenticateToken, (req, res) => {
  const { status } = req.body
  const sampleIndex = samples.findIndex(s => s.id === req.params.id)
  
  if (sampleIndex === -1) {
    return res.status(404).json({ error: 'Sample not found' })
  }
  
  samples[sampleIndex].status = status
  samples[sampleIndex].updatedAt = new Date().toISOString()
  
  console.log('PATCH /api/samples/:id - updated sample status:', req.params.id, 'to', status)
  res.json(samples[sampleIndex])
})

// Test Routes
app.get('/api/tests', (req, res) => {
  const { sampleId } = req.query
  console.log('GET /api/tests - sampleId:', sampleId)
  if (sampleId) {
    const sampleTests = tests.filter(test => test.sampleId === sampleId)
    console.log('Returning tests for sample:', sampleId, 'count:', sampleTests.length)
    res.json(sampleTests)
  } else {
    res.json(tests)
  }
})

app.post('/api/tests', authenticateToken, (req, res) => {
  const { sampleId, name, type, method } = req.body
  
  if (!sampleId || !name || !type || !method) {
    return res.status(400).json({ error: 'Missing required fields' })
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
  console.log('POST /api/tests - created test for sample:', sampleId, 'test ID:', newTest.id)
  res.status(201).json(newTest)
})

// Result Routes
app.get('/api/results', (req, res) => {
  const { testId } = req.query
  console.log('GET /api/results - testId:', testId)
  res.json([])
})

app.post('/api/results', (req, res) => {
  const { testId, value, unit, status, complianceFlag } = req.body
  console.log('POST /api/results - creating result for test:', testId)
  res.status(201).json({
    id: uuidv4(),
    testId,
    value,
    unit,
    status,
    complianceFlag: Boolean(complianceFlag),
    createdAt: new Date().toISOString()
  })
})

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalSamples: samples.length,
    samplesByStatus: {
      Design: samples.filter(s => s.status === 'Design').length,
      Validation: samples.filter(s => s.status === 'Validation').length,
      Approval: samples.filter(s => s.status === 'Approval').length,
      Completed: samples.filter(s => s.status === 'Completed').length,
    },
    totalTests: 0,
    totalResults: 0,
    recentActivity: samples.slice(-3).map(s => ({
      id: s.id,
      type: 'sample',
      action: 'created',
      timestamp: s.createdAt
    }))
  }
  
  console.log('GET /api/dashboard/stats - returning stats')
  res.json(stats)
})

app.listen(PORT, () => {
  console.log(`\n🚀 CycleCoreLIMS Server running on http://localhost:${PORT}`)
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`)
  console.log(`\n🔐 Default Login Credentials:`)
  console.log(`   Admin: username=admin, password=password`)
  console.log(`\n📝 Available Samples:`)
  samples.forEach(s => console.log(`   - ${s.id}: ${s.name} (${s.status})`))
  console.log(`\n✅ Server is ready! Try the sample details page.\n`)
})
