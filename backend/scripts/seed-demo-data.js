require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

async function seedDemoData() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const now = new Date().toISOString()
  const sampleA = {
    id: 'SMP-ABC123-DEF',
    name: 'Blood Sample A',
    type: 'Blood',
    source: 'Patient 001',
    collectionDate: '2024-01-15',
    status: 'Design',
    createdAt: now,
    updatedAt: now
  }

  const sampleB = {
    id: 'SMP-XYZ789-GHI',
    name: 'Tissue Sample B',
    type: 'Tissue',
    source: 'Patient 002',
    collectionDate: '2024-01-16',
    status: 'Validation',
    createdAt: now,
    updatedAt: now
  }

  const test1Id = uuidv4()
  const test2Id = uuidv4()
  const test1 = {
    _id: test1Id,
    sampleId: sampleA.id,
    name: 'Complete Blood Count',
    type: 'Hematology',
    method: 'Automated Cell Counter',
    createdAt: now
  }

  const test2 = {
    _id: test2Id,
    sampleId: sampleB.id,
    name: 'Histopathology',
    type: 'Pathology',
    method: 'Microscopic Examination',
    createdAt: now
  }

  const result1 = {
    value: '4.5 million cells/mcL',
    unit: 'cells/mcL',
    status: 'Pass',
    complianceFlag: true,
    testId: test1Id,
    createdAt: now
  }

  const complaint = {
    id: 'CMP-INITIAL-001',
    title: 'Sample tube labeling mismatch',
    description: 'Observed mismatch between sample tube barcode and intake form for one incoming sample.',
    source: 'Hospital',
    complaintType: 'Product Complaint',
    productFamily: 'Diagnostic Consumables',
    productCode: 'DC-1204',
    lotNumber: 'LOT-2026-04-A',
    batchNumber: 'BATCH-7781',
    country: 'US',
    dateOfAwareness: now.slice(0, 10),
    sampleId: sampleA.id,
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
        changedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  }

  const collections = ['samples', 'tests', 'results', 'complaints']
  const counts = {}
  for (const name of collections) {
    const exists = await db.listCollections({ name }).toArray()
    counts[name] = exists.length ? await db.collection(name).countDocuments() : 0
  }

  if (counts.samples === 0) await db.collection('samples').insertMany([sampleA, sampleB])
  if (counts.tests === 0) await db.collection('tests').insertMany([test1, test2])
  if (counts.results === 0) await db.collection('results').insertOne(result1)
  if (counts.complaints === 0) await db.collection('complaints').insertOne(complaint)

  const updatedCounts = {}
  for (const name of collections) {
    updatedCounts[name] = await db.collection(name).countDocuments()
  }

  console.log('Seed complete:', updatedCounts)
  await mongoose.disconnect()
}

seedDemoData().catch(async (err) => {
  console.error(err)
  try {
    await mongoose.disconnect()
  } catch (_) {
    // ignore
  }
  process.exit(1)
})
