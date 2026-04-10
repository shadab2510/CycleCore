const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'cyclecorelims-secret-key-2024'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyclecorelims'

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB')
  
  // Create default users if they don't exist
  await createDefaultUsers()
}).catch(err => {
  console.error('MongoDB connection error:', err)
  console.log('Using in-memory storage as fallback')
})

// Create default users function
async function createDefaultUsers() {
  try {
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@cyclecorelims.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true
      },
      {
        username: 'labtech',
        email: 'labtech@cyclecorelims.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        role: 'lab_technician',
        firstName: 'Lab',
        lastName: 'Technician',
        isActive: true
      },
      {
        username: 'manager',
        email: 'manager@cyclecorelims.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        role: 'manager',
        firstName: 'Lab',
        lastName: 'Manager',
        isActive: true
      }
    ]

    for (const defaultUser of defaultUsers) {
      const existingUser = await User.findOne({ username: defaultUser.username })
      if (!existingUser) {
        await User.create(defaultUser)
        console.log(`Created default user: ${defaultUser.username}`)
      }
    }
  } catch (error) {
    console.error('Error creating default users:', error)
  }
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:4000', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'lab_technician', 'manager', 'viewer'], default: 'lab_technician' },
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
})

const SampleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  source: { type: String, required: true },
  collectionDate: { type: String, required: true },
  status: { type: String, enum: ['Design', 'Validation', 'Approval', 'Completed'], default: 'Design' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const TestSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom _id field
  name: { type: String, required: true },
  type: { type: String, required: true },
  method: { type: String, required: true },
  sampleId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

const ResultSchema = new mongoose.Schema({
  value: { type: String, required: true },
  unit: { type: String, required: true },
  status: { type: String, enum: ['Pass', 'Fail'], required: true },
  complianceFlag: { type: Boolean, required: true },
  testId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

const complaintWorkflowStages = ['Create', 'Investigate', 'Action Plan', 'Approval', 'Execution', 'Verification', 'Close']

const ComplaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  source: { type: String, enum: ['Call Center', 'Email', 'Distributor', 'Hospital', 'Regulator', 'Other'], default: 'Other' },
  complaintType: { type: String, enum: ['Product Complaint', 'Adverse Event', 'Service Issue'], default: 'Product Complaint' },
  productFamily: { type: String, default: '' },
  productCode: { type: String, default: '' },
  lotNumber: { type: String, default: '' },
  batchNumber: { type: String, default: '' },
  serialNumber: { type: String, default: '' },
  country: { type: String, default: '' },
  dateOfAwareness: { type: String, default: '' },
  sampleId: { type: String, default: '' },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  occurrence: { type: Number, min: 1, max: 5, default: 3 },
  detectability: { type: Number, min: 1, max: 5, default: 3 },
  riskScore: { type: Number, default: 27 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: complaintWorkflowStages, default: 'Create' },
  ownerId: { type: String, default: '' },
  investigatorId: { type: String, default: '' },
  approverId: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  linkedCapaId: { type: String, default: '' },
  capaStatus: { type: String, enum: ['Not Linked', 'Open', 'Closed'], default: 'Not Linked' },
  effectivenessCheckResult: { type: String, enum: ['Pending', 'Pass', 'Fail'], default: 'Pending' },
  slaDueAt: { type: String, default: '' },
  escalated: { type: Boolean, default: false },
  reopenedCount: { type: Number, default: 0 },
  regulatoryReviewRequired: { type: Boolean, default: false },
  supplierNcrRequired: { type: Boolean, default: false },
  investigationSummary: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  actionPlan: { type: String, default: '' },
  approvalComments: { type: String, default: '' },
  executionSummary: { type: String, default: '' },
  verificationSummary: { type: String, default: '' },
  closureComments: { type: String, default: '' },
  history: {
    type: [{
      from: String,
      to: String,
      comment: String,
      changedBy: String,
      changedAt: String
    }],
    default: []
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema)
const Sample = mongoose.model('Sample', SampleSchema)
const Test = mongoose.model('Test', TestSchema)
const Result = mongoose.model('Result', ResultSchema)
const Complaint = mongoose.model('Complaint', ComplaintSchema)

// Fallback in-memory storage
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

let complaints = [
  {
    id: 'CMP-INITIAL-001',
    title: 'Sample tube labeling mismatch',
    description: 'Observed mismatch between sample tube barcode and intake form for one incoming sample.',
    source: 'Hospital',
    complaintType: 'Product Complaint',
    productFamily: 'Diagnostic Consumables',
    productCode: 'DC-1204',
    lotNumber: 'LOT-2026-04-A',
    batchNumber: 'BATCH-7781',
    serialNumber: '',
    country: 'US',
    dateOfAwareness: new Date().toISOString().slice(0, 10),
    sampleId: 'SMP-ABC123-DEF',
    severity: 'High',
    occurrence: 3,
    detectability: 3,
    riskScore: 36,
    riskLevel: 'High',
    status: 'Investigate',
    ownerId: 'manager',
    investigatorId: 'labtech',
    approverId: 'manager',
    approvalStatus: 'Pending',
    linkedCapaId: 'CAPA-1001',
    capaStatus: 'Open',
    effectivenessCheckResult: 'Pending',
    slaDueAt: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toISOString(),
    escalated: false,
    reopenedCount: 0,
    regulatoryReviewRequired: false,
    supplierNcrRequired: false,
    investigationSummary: 'Issue reproduced during intake review; mismatch occurred during manual relabeling step.',
    rootCause: 'Manual handoff lacked dual verification.',
    actionPlan: '',
    approvalComments: '',
    executionSummary: '',
    verificationSummary: '',
    closureComments: '',
    history: [
      {
        from: 'Create',
        to: 'Investigate',
        comment: 'Investigation initiated.',
        changedBy: 'System Administrator',
        changedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

let users = [
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
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }
    
    let user
    
    // Try MongoDB first
    try {
      user = await User.findOne({ username })
    } catch (err) {
      // Fallback to in-memory
      user = users.find(u => u.username === username && u.isActive)
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: user.id || user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    res.json({
      token,
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/register', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    let newUser
    
    // Try MongoDB first
    try {
      newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'lab_technician',
        firstName,
        lastName
      })
      await newUser.save()
    } catch (err) {
      // Fallback to in-memory
      newUser = {
        id: users.length + 1,
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
    }
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id || newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// User management endpoints
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    let userList
    
    // Try MongoDB first
    try {
      userList = await User.find().select('-password')
    } catch (err) {
      // Fallback to in-memory
      userList = users.map(u => ({ ...u, password: undefined }))
    }
    
    res.json(userList)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    let newUser
    
    // Try MongoDB first
    try {
      newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'lab_technician',
        firstName,
        lastName,
        isActive: true
      })
      await newUser.save()
    } catch (err) {
      // Fallback to in-memory
      newUser = {
        id: Date.now(),
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
    }
    
    res.status(201).json({
      id: newUser.id || newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isActive: newUser.isActive
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' })
  }
})

function generateSampleId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `SMP-${timestamp}-${random}`
}

function generateComplaintId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `CMP-${timestamp}-${random}`
}

const complaintTransitionMap = {
  Create: 'Investigate',
  Investigate: 'Action Plan',
  'Action Plan': 'Approval',
  Approval: 'Execution',
  Execution: 'Verification',
  Verification: 'Close',
  Close: null
}

const complaintSlaDaysByStage = {
  Create: 2,
  Investigate: 5,
  'Action Plan': 5,
  Approval: 3,
  Execution: 7,
  Verification: 5,
  Close: 2
}

const severityScoreMap = {
  Low: 2,
  Medium: 3,
  High: 4,
  Critical: 5
}

function calculateRiskScore(severity, occurrence = 3, detectability = 3) {
  const severityScore = severityScoreMap[severity] || severityScoreMap.Medium
  return severityScore * Number(occurrence) * Number(detectability)
}

function deriveRiskLevelFromScore(score) {
  if (score >= 75) return 'Critical'
  if (score >= 40) return 'High'
  if (score >= 20) return 'Medium'
  return 'Low'
}

function calculateSlaDueDate(stage, riskLevel, fromDate = new Date()) {
  const baseDays = complaintSlaDaysByStage[stage] || 5
  const multipliers = {
    Critical: 0.5,
    High: 0.75,
    Medium: 1,
    Low: 1.25
  }

  const targetDays = Math.max(1, Math.ceil(baseDays * (multipliers[riskLevel] || 1)))
  return new Date(fromDate.getTime() + (targetDays * 24 * 60 * 60 * 1000)).toISOString()
}

function deriveAutomationFlags(payload) {
  const supplierRootCause = (payload.rootCause || '').toLowerCase().includes('supplier')
  const regulatedSources = ['Regulator']
  return {
    regulatoryReviewRequired: regulatedSources.includes(payload.source),
    supplierNcrRequired: supplierRootCause
  }
}

const complaintStagePermissions = {
  Investigate: ['admin', 'lab_technician', 'manager'],
  'Action Plan': ['admin', 'lab_technician', 'manager'],
  Approval: ['admin', 'manager'],
  Execution: ['admin', 'lab_technician', 'manager'],
  Verification: ['admin', 'lab_technician', 'manager'],
  Close: ['admin', 'manager']
}

function canTransitionComplaint(currentStatus, nextStatus) {
  return complaintTransitionMap[currentStatus] === nextStatus
}

app.get('/api/samples', authenticateToken, async (req, res) => {
  try {
    let sampleList
    
    // Try MongoDB first
    try {
      sampleList = await Sample.find().populate('createdBy', 'username firstName lastName')
    } catch (err) {
      // Fallback to in-memory
      sampleList = samples
    }
    
    res.json(sampleList)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch samples' })
  }
})

app.get('/api/samples/:id', (req, res) => {
  const sample = samples.find(s => s.id === req.params.id)
  if (!sample) {
    return res.status(404).json({ error: 'Sample not found' })
  }
  res.json(sample)
})

app.post('/api/samples', authenticateToken, requireRole(['admin', 'lab_technician', 'manager']), async (req, res) => {
  try {
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
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let savedSample
    
    // Try MongoDB first
    try {
      const sample = new Sample(newSample)
      savedSample = await sample.save()
      await savedSample.populate('createdBy', 'username firstName lastName')
    } catch (err) {
      // Fallback to in-memory
      samples.push(newSample)
      savedSample = newSample
    }

    res.status(201).json(savedSample)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sample' })
  }
})

app.patch('/api/samples/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    let updatedSample
    
    // Try MongoDB first
    try {
      updatedSample = await Sample.findOneAndUpdate(
        { id: req.params.id },
        { 
          status: status,
          updatedAt: new Date().toISOString()
        },
        { new: true }
      )
      
      if (!updatedSample) {
        // Fallback to in-memory if not found in MongoDB
        const sampleIndex = samples.findIndex(s => s.id === req.params.id)
        if (sampleIndex === -1) {
          return res.status(404).json({ error: 'Sample not found' })
        }
        
        samples[sampleIndex].status = status
        samples[sampleIndex].updatedAt = new Date().toISOString()
        updatedSample = samples[sampleIndex]
      }
    } catch (err) {
      // Fallback to in-memory
      const sampleIndex = samples.findIndex(s => s.id === req.params.id)
      if (sampleIndex === -1) {
        return res.status(404).json({ error: 'Sample not found' })
      }
      
      samples[sampleIndex].status = status
      samples[sampleIndex].updatedAt = new Date().toISOString()
      updatedSample = samples[sampleIndex]
    }
    
    res.json(updatedSample)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sample status' })
  }
})

app.get('/api/complaints', authenticateToken, async (req, res) => {
  try {
    let complaintList

    try {
      complaintList = await Complaint.find().sort({ updatedAt: -1 })
    } catch (err) {
      complaintList = complaints.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    }

    res.json(complaintList)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' })
  }
})

app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
  try {
    let complaint

    try {
      complaint = await Complaint.findOne({ id: req.params.id })
    } catch (err) {
      complaint = complaints.find(c => c.id === req.params.id)
    }

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    res.json(complaint)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaint' })
  }
})

app.post('/api/complaints', authenticateToken, requireRole(['admin', 'lab_technician', 'manager']), async (req, res) => {
  try {
    const {
      title,
      description,
      source,
      complaintType,
      productFamily,
      productCode,
      lotNumber,
      batchNumber,
      serialNumber,
      country,
      dateOfAwareness,
      sampleId,
      severity,
      occurrence,
      detectability,
      ownerId,
      investigatorId,
      approverId,
      linkedCapaId,
      capaStatus
    } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const createdAt = new Date().toISOString()
    const calculatedRiskScore = calculateRiskScore(severity || 'Medium', occurrence || 3, detectability || 3)
    const calculatedRiskLevel = deriveRiskLevelFromScore(calculatedRiskScore)
    const slaDueAt = calculateSlaDueDate('Create', calculatedRiskLevel)
    const derivedFlags = deriveAutomationFlags({ source, rootCause: '' })

    const newComplaint = {
      id: generateComplaintId(),
      title,
      description,
      source: source || 'Other',
      complaintType: complaintType || 'Product Complaint',
      productFamily: productFamily || '',
      productCode: productCode || '',
      lotNumber: lotNumber || '',
      batchNumber: batchNumber || '',
      serialNumber: serialNumber || '',
      country: country || '',
      dateOfAwareness: dateOfAwareness || createdAt.slice(0, 10),
      sampleId: sampleId || '',
      severity: severity || 'Medium',
      occurrence: Number(occurrence || 3),
      detectability: Number(detectability || 3),
      riskScore: calculatedRiskScore,
      riskLevel: calculatedRiskLevel,
      status: 'Create',
      ownerId: ownerId || req.user.username,
      investigatorId: investigatorId || '',
      approverId: approverId || '',
      approvalStatus: 'Pending',
      linkedCapaId: linkedCapaId || '',
      capaStatus: capaStatus || (linkedCapaId ? 'Open' : 'Not Linked'),
      effectivenessCheckResult: 'Pending',
      slaDueAt,
      escalated: false,
      reopenedCount: 0,
      regulatoryReviewRequired: derivedFlags.regulatoryReviewRequired,
      supplierNcrRequired: derivedFlags.supplierNcrRequired,
      investigationSummary: '',
      rootCause: '',
      actionPlan: '',
      approvalComments: '',
      executionSummary: '',
      verificationSummary: '',
      closureComments: '',
      history: [],
      createdBy: req.user.id,
      createdAt,
      updatedAt: createdAt
    }

    let savedComplaint

    try {
      const complaint = new Complaint(newComplaint)
      savedComplaint = await complaint.save()
    } catch (err) {
      complaints.push(newComplaint)
      savedComplaint = newComplaint
    }

    res.status(201).json(savedComplaint)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' })
  }
})

app.patch('/api/complaints/:id', authenticateToken, requireRole(['admin', 'lab_technician', 'manager']), async (req, res) => {
  try {
    const editableFields = [
      'title',
      'description',
      'source',
      'complaintType',
      'productFamily',
      'productCode',
      'lotNumber',
      'batchNumber',
      'serialNumber',
      'country',
      'dateOfAwareness',
      'sampleId',
      'severity',
      'occurrence',
      'detectability',
      'ownerId',
      'investigatorId',
      'approverId',
      'linkedCapaId',
      'capaStatus',
      'regulatoryReviewRequired',
      'supplierNcrRequired',
      'investigationSummary',
      'rootCause',
      'actionPlan',
      'approvalComments',
      'executionSummary',
      'verificationSummary',
      'closureComments',
      'effectivenessCheckResult'
    ]

    const incomingUpdates = {}
    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        incomingUpdates[field] = req.body[field]
      }
    })

    let complaint
    let isMongo = true

    try {
      complaint = await Complaint.findOne({ id: req.params.id })
    } catch (err) {
      isMongo = false
      complaint = complaints.find(c => c.id === req.params.id)
    }

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    const baseComplaint = complaint.toObject ? complaint.toObject() : complaint
    const merged = {
      ...baseComplaint,
      ...incomingUpdates
    }

    const updatePayload = {
      ...incomingUpdates
    }

    if (incomingUpdates.severity || incomingUpdates.occurrence || incomingUpdates.detectability) {
      const recalculatedScore = calculateRiskScore(
        merged.severity,
        merged.occurrence,
        merged.detectability
      )
      updatePayload.riskScore = recalculatedScore
      updatePayload.riskLevel = deriveRiskLevelFromScore(recalculatedScore)
    }

    if (!merged.slaDueAt || incomingUpdates.severity || incomingUpdates.occurrence || incomingUpdates.detectability) {
      updatePayload.slaDueAt = calculateSlaDueDate(merged.status, updatePayload.riskLevel || merged.riskLevel)
    }

    const autoFlags = deriveAutomationFlags(merged)
    updatePayload.regulatoryReviewRequired = incomingUpdates.regulatoryReviewRequired !== undefined
      ? incomingUpdates.regulatoryReviewRequired
      : autoFlags.regulatoryReviewRequired
    updatePayload.supplierNcrRequired = incomingUpdates.supplierNcrRequired !== undefined
      ? incomingUpdates.supplierNcrRequired
      : autoFlags.supplierNcrRequired
    updatePayload.updatedAt = new Date().toISOString()

    if (isMongo && complaint._id) {
      const updatedComplaint = await Complaint.findOneAndUpdate(
        { id: req.params.id },
        { $set: updatePayload },
        { new: true }
      )
      return res.json(updatedComplaint)
    }

    const index = complaints.findIndex(c => c.id === req.params.id)
    complaints[index] = {
      ...complaints[index],
      ...updatePayload
    }
    res.json(complaints[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' })
  }
})

app.patch('/api/complaints/:id/transition', authenticateToken, async (req, res) => {
  try {
    const { nextStatus, stageData = {}, comment = '', action = 'advance' } = req.body

    if (action !== 'reopen' && action !== 'reject' && (!nextStatus || !complaintWorkflowStages.includes(nextStatus))) {
      return res.status(400).json({ error: 'Valid nextStatus is required' })
    }

    let complaint
    let isMongo = true

    try {
      complaint = await Complaint.findOne({ id: req.params.id })
    } catch (err) {
      isMongo = false
      complaint = complaints.find(c => c.id === req.params.id)
    }

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    let resolvedNextStatus = nextStatus
    if (action === 'reject') {
      if (complaint.status !== 'Approval') {
        return res.status(400).json({ error: 'Reject action only allowed at Approval stage' })
      }
      resolvedNextStatus = 'Action Plan'
    }

    if (action === 'reopen') {
      if (!['Verification', 'Close'].includes(complaint.status)) {
        return res.status(400).json({ error: 'Reopen action only allowed from Verification or Close' })
      }
      resolvedNextStatus = 'Action Plan'
    }

    if (!resolvedNextStatus || !complaintWorkflowStages.includes(resolvedNextStatus)) {
      return res.status(400).json({ error: 'Valid transition target is required' })
    }

    if (resolvedNextStatus === 'Close') {
      if (complaint.capaStatus === 'Open') {
        return res.status(400).json({ error: 'Cannot close complaint while linked CAPA is Open' })
      }
      if ((stageData.effectivenessCheckResult || complaint.effectivenessCheckResult) !== 'Pass') {
        return res.status(400).json({ error: 'Verification effectiveness result must be Pass before closure' })
      }
    }

    const allowedRoles = complaintStagePermissions[resolvedNextStatus] || []
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Only ${allowedRoles.join(', ')} can move complaint to ${resolvedNextStatus}` })
    }

    if (action !== 'reopen' && action !== 'reject' && !canTransitionComplaint(complaint.status, resolvedNextStatus)) {
      return res.status(400).json({ error: `Invalid transition from ${complaint.status} to ${resolvedNextStatus}` })
    }

    const actorName = req.user.username || req.user.id
    const historyEntry = {
      from: complaint.status,
      to: resolvedNextStatus,
      comment,
      changedBy: actorName,
      changedAt: new Date().toISOString()
    }

    const mergedCandidate = {
      ...complaint.toObject?.(),
      ...complaint,
      ...stageData
    }
    const autoFlags = deriveAutomationFlags(mergedCandidate)

    const nextRiskScore = calculateRiskScore(
      mergedCandidate.severity,
      mergedCandidate.occurrence,
      mergedCandidate.detectability
    )
    const nextRiskLevel = deriveRiskLevelFromScore(nextRiskScore)

    const updateFields = {
      ...stageData,
      status: resolvedNextStatus,
      approvalStatus: action === 'reject' ? 'Rejected' : (resolvedNextStatus === 'Execution' ? 'Approved' : complaint.approvalStatus),
      riskScore: nextRiskScore,
      riskLevel: nextRiskLevel,
      regulatoryReviewRequired: autoFlags.regulatoryReviewRequired,
      supplierNcrRequired: autoFlags.supplierNcrRequired,
      escalated: nextRiskLevel === 'Critical',
      reopenedCount: action === 'reopen' ? Number(complaint.reopenedCount || 0) + 1 : Number(complaint.reopenedCount || 0),
      slaDueAt: calculateSlaDueDate(resolvedNextStatus, nextRiskLevel),
      updatedAt: new Date().toISOString()
    }

    if (isMongo && complaint._id) {
      const mergedHistory = [...(complaint.history || []), historyEntry]
      const updatedComplaint = await Complaint.findOneAndUpdate(
        { id: req.params.id },
        {
          ...updateFields,
          history: mergedHistory
        },
        { new: true }
      )
      return res.json(updatedComplaint)
    }

    const index = complaints.findIndex(c => c.id === req.params.id)
    complaints[index] = {
      ...complaints[index],
      ...updateFields,
      history: [...(complaints[index].history || []), historyEntry]
    }

    res.json(complaints[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to transition complaint workflow stage' })
  }
})

app.post('/api/complaints/demo-seed', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)

    const buildDemoComplaint = ({
      id,
      title,
      description,
      source,
      complaintType,
      severity,
      occurrence,
      detectability,
      status,
      lotNumber,
      batchNumber,
      linkedCapaId,
      capaStatus,
      effectivenessCheckResult,
      investigationSummary,
      rootCause,
      actionPlan,
      approvalComments,
      executionSummary,
      verificationSummary,
      closureComments,
      daysOffset = 0
    }) => {
      const riskScore = calculateRiskScore(severity, occurrence, detectability)
      const riskLevel = deriveRiskLevelFromScore(riskScore)
      const createdAt = new Date(now.getTime() - (daysOffset * 24 * 60 * 60 * 1000)).toISOString()

      return {
        id,
        title,
        description,
        source,
        complaintType,
        productFamily: 'Medical Devices',
        productCode: 'MD-POC-01',
        lotNumber,
        batchNumber,
        serialNumber: '',
        country: 'US',
        dateOfAwareness: today,
        sampleId: '',
        severity,
        occurrence,
        detectability,
        riskScore,
        riskLevel,
        status,
        ownerId: 'manager',
        investigatorId: 'labtech',
        approverId: 'manager',
        approvalStatus: status === 'Execution' || status === 'Verification' || status === 'Close' ? 'Approved' : 'Pending',
        linkedCapaId,
        capaStatus,
        effectivenessCheckResult,
        slaDueAt: calculateSlaDueDate(status, riskLevel),
        escalated: riskLevel === 'Critical',
        reopenedCount: 0,
        regulatoryReviewRequired: source === 'Regulator',
        supplierNcrRequired: (rootCause || '').toLowerCase().includes('supplier'),
        investigationSummary: investigationSummary || '',
        rootCause: rootCause || '',
        actionPlan: actionPlan || '',
        approvalComments: approvalComments || '',
        executionSummary: executionSummary || '',
        verificationSummary: verificationSummary || '',
        closureComments: closureComments || '',
        history: [],
        createdBy: req.user.id,
        createdAt,
        updatedAt: now.toISOString()
      }
    }

    const demoComplaints = [
      buildDemoComplaint({
        id: 'CMP-DEMO-001',
        title: 'Critical packaging integrity complaint',
        description: 'Seal breach reported from hospital inventory for sterile kit.',
        source: 'Hospital',
        complaintType: 'Product Complaint',
        severity: 'Critical',
        occurrence: 4,
        detectability: 4,
        status: 'Approval',
        lotNumber: 'LOT-DEMO-A1',
        batchNumber: 'B-DEMO-001',
        linkedCapaId: 'CAPA-DEMO-1001',
        capaStatus: 'Open',
        effectivenessCheckResult: 'Pending',
        investigationSummary: 'Leak test failed in retained samples from same lot.',
        rootCause: 'Supplier film thickness variability exceeded tolerance.',
        actionPlan: 'Supplier containment and incoming inspection tightening.',
        daysOffset: 2
      }),
      buildDemoComplaint({
        id: 'CMP-DEMO-002',
        title: 'Regulatory complaint requiring escalation',
        description: 'Regulator requested CAPA evidence for repeat labeling event.',
        source: 'Regulator',
        complaintType: 'Service Issue',
        severity: 'High',
        occurrence: 3,
        detectability: 3,
        status: 'Verification',
        lotNumber: 'LOT-DEMO-B4',
        batchNumber: 'B-DEMO-002',
        linkedCapaId: 'CAPA-DEMO-1002',
        capaStatus: 'Closed',
        effectivenessCheckResult: 'Pass',
        investigationSummary: 'Process review completed and operator training updated.',
        rootCause: 'Label reconciliation step was bypassed during shift handover.',
        actionPlan: 'Added electronic checklist and supervisor checkpoint.',
        approvalComments: 'Approved with accelerated verification window.',
        executionSummary: 'Checklist deployed at all packaging lines.',
        verificationSummary: 'No recurrence in 30-day sample audit.',
        daysOffset: 5
      }),
      buildDemoComplaint({
        id: 'CMP-DEMO-003',
        title: 'Closed demo complaint with full audit trail',
        description: 'Historical closed case for demoing final closure controls.',
        source: 'Email',
        complaintType: 'Product Complaint',
        severity: 'Medium',
        occurrence: 2,
        detectability: 3,
        status: 'Close',
        lotNumber: 'LOT-DEMO-C9',
        batchNumber: 'B-DEMO-003',
        linkedCapaId: 'CAPA-DEMO-1003',
        capaStatus: 'Closed',
        effectivenessCheckResult: 'Pass',
        investigationSummary: 'Issue traced to handling variation in warehouse.',
        rootCause: 'Temporary staffing without full SOP refresh.',
        actionPlan: 'Reinforced SOP and mandatory refresher training.',
        approvalComments: 'Approval granted after CAPA confirmation.',
        executionSummary: 'Training completed for all warehouse operators.',
        verificationSummary: 'Quarterly audit confirms sustained compliance.',
        closureComments: 'Complaint closed after effectiveness confirmed.',
        daysOffset: 10
      })
    ]

    try {
      await Complaint.deleteMany({ id: { $regex: '^CMP-DEMO-' } })
      await Complaint.insertMany(demoComplaints)
      const complaintList = await Complaint.find().sort({ updatedAt: -1 })
      return res.json({ message: 'Demo complaints seeded successfully', items: complaintList })
    } catch (err) {
      complaints = complaints.filter(c => !c.id.startsWith('CMP-DEMO-'))
      complaints = [...demoComplaints, ...complaints]
      complaints.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      return res.json({ message: 'Demo complaints seeded in memory', items: complaints })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed demo complaints' })
  }
})

app.get('/api/tests', authenticateToken, async (req, res) => {
  try {
    const { sampleId } = req.query
    console.log('Fetching tests for sampleId:', sampleId)
    let testList
    
    // Try MongoDB first
    try {
      if (sampleId) {
        const mongoTests = await Test.find({ sampleId })
        testList = mongoTests.map(test => ({
          id: test._id, // Convert _id to id for frontend
          sampleId: test.sampleId,
          name: test.name,
          type: test.type,
          method: test.method,
          createdAt: test.createdAt
        }))
        console.log('Found tests in MongoDB:', testList.length)
      } else {
        const mongoTests = await Test.find()
        testList = mongoTests.map(test => ({
          id: test._id, // Convert _id to id for frontend
          sampleId: test.sampleId,
          name: test.name,
          type: test.type,
          method: test.method,
          createdAt: test.createdAt
        }))
        console.log('Found all tests in MongoDB:', testList.length)
      }
    } catch (err) {
      console.log('MongoDB error, using memory:', err.message)
      // Fallback to in-memory
      if (sampleId) {
        testList = tests.filter(t => t.sampleId === sampleId)
      } else {
        testList = tests
      }
      console.log('Found tests in memory:', testList.length)
    }
    
    console.log('Returning tests:', testList)
    res.json(testList)
  } catch (error) {
    console.log('Fetch tests error:', error)
    res.status(500).json({ error: 'Failed to fetch tests' })
  }
})

app.post('/api/tests', authenticateToken, requireRole(['admin', 'lab_technician', 'manager']), async (req, res) => {
  try {
    const { sampleId, name, type, method } = req.body
    console.log('Creating test:', { sampleId, name, type, method })
    
    if (!sampleId || !name || !type || !method) {
      console.log('Missing required fields')
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if sample exists
    let sampleExists
    try {
      sampleExists = await Sample.findOne({ id: sampleId })
      console.log('Sample exists:', !!sampleExists)
    } catch (err) {
      console.log('MongoDB error, checking memory:', err.message)
      sampleExists = samples.find(s => s.id === sampleId)
    }
    
    if (!sampleExists) {
      console.log('Sample not found')
      return res.status(400).json({ error: 'Sample not found' })
    }

    const newTest = {
      _id: uuidv4(), // Use _id field
      sampleId,
      name,
      type,
      method,
      createdAt: new Date().toISOString()
    }
    console.log('New test object:', newTest)

    let savedTest
    
    // Try MongoDB first
    try {
      console.log('Trying to save to MongoDB...')
      const test = new Test(newTest)
      savedTest = await test.save()
      console.log('Saved to MongoDB:', savedTest)
    } catch (err) {
      console.log('MongoDB save failed, using memory:', err.message)
      // Fallback to in-memory
      tests.push(newTest)
      savedTest = newTest
    }

    res.status(201).json(savedTest)
  } catch (error) {
    console.log('Test creation error:', error)
    res.status(500).json({ error: 'Failed to create test' })
  }
})

app.get('/api/results', async (req, res) => {
  try {
    const { testId } = req.query
    if (testId) {
      const testResults = await Result.find({ testId }).sort({ createdAt: -1 })
      res.json(testResults)
    } else {
      const allResults = await Result.find().sort({ createdAt: -1 })
      res.json(allResults)
    }
  } catch (err) {
    console.error('Error fetching results:', err)
    // Fallback to memory
    const { testId } = req.query
    if (testId) {
      const testResults = results.filter(r => r.testId === testId)
      res.json(testResults)
    } else {
      res.json(results)
    }
  }
})

app.post('/api/results', authenticateToken, async (req, res) => {
  try {
    const { testId, value, unit, status, complianceFlag } = req.body
    console.log('Creating result:', { testId, value, unit, status, complianceFlag })
    
    if (!testId || !value || !unit || !status || complianceFlag === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if test exists in MongoDB or memory
    let testExists
    try {
      // Try MongoDB first
      testExists = await Test.findOne({ _id: testId })
      if (!testExists) {
        // Fallback to memory
        testExists = tests.find(t => t.id === testId)
      }
    } catch (err) {
      // Fallback to memory
      testExists = tests.find(t => t.id === testId)
    }
    
    if (!testExists) {
      console.log('Test not found for testId:', testId)
      return res.status(400).json({ error: 'Test not found' })
    }

    console.log('Test found:', testExists)

    // Try to save to MongoDB first
    try {
      const newResult = new Result({
        testId,
        value,
        unit,
        status,
        complianceFlag,
        createdBy: req.user.id
      })

      const savedResult = await newResult.save()
      console.log('Result saved to MongoDB:', savedResult)
      res.status(201).json(savedResult)
    } catch (mongoError) {
      console.log('MongoDB save failed, using memory:', mongoError)
      
      // Fallback to memory storage
      const newResult = {
        id: uuidv4(),
        testId,
        value,
        unit,
        status,
        complianceFlag,
        createdAt: new Date().toISOString()
      }

      results.push(newResult)
      console.log('Result saved to memory')
      res.status(201).json(newResult)
    }
  } catch (error) {
    console.log('Result creation error:', error)
    res.status(500).json({ error: 'Failed to create result' })
  }
})

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get counts from MongoDB
    const totalSamples = await Sample.countDocuments()
    const samplesByStatus = await Promise.all([
      Sample.countDocuments({ status: 'Design' }),
      Sample.countDocuments({ status: 'Validation' }),
      Sample.countDocuments({ status: 'Approval' }),
      Sample.countDocuments({ status: 'Completed' })
    ])
    const totalTests = await Test.countDocuments()
    const totalResults = await Result.countDocuments()

    // Get recent activity from MongoDB
    const recentSamples = await Sample.find().sort({ createdAt: -1 }).limit(3)
    const recentTests = await Test.find().sort({ createdAt: -1 }).limit(3)
    const recentResults = await Result.find().sort({ createdAt: -1 }).limit(3)

    const stats = {
      totalSamples,
      samplesByStatus: {
        Design: samplesByStatus[0],
        Validation: samplesByStatus[1],
        Approval: samplesByStatus[2],
        Completed: samplesByStatus[3]
      },
      totalTests,
      totalResults,
      recentActivity: [
        ...recentSamples.map(s => ({
          id: s.id || s._id,
          type: 'sample',
          action: 'created',
          timestamp: s.createdAt
        })),
        ...recentTests.map(t => ({
          id: t._id,
          type: 'test',
          action: 'created',
          timestamp: t.createdAt
        })),
        ...recentResults.map(r => ({
          id: r._id,
          type: 'result',
          action: 'created',
          timestamp: r.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
    }
    
    res.json(stats)
  } catch (err) {
    console.error('Dashboard stats error:', err)
    // Fallback to memory
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
  }
})

app.listen(PORT, () => {
  console.log(`CycleCoreLIMS Server running on http://localhost:${PORT}`)
  console.log(`API Documentation: http://localhost:${PORT}/api`)
  console.log('Connected to MongoDB')
})
