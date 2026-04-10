const BASE_URL = process.env.LIMS_API_BASE_URL || 'http://localhost:3001/api'

const USERS = {
  admin: { username: 'admin', password: 'password' },
  manager: { username: 'manager', password: 'password' },
  labtech: { username: 'labtech', password: 'password' },
}

async function request(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`
    throw new Error(`${method} ${path} failed: ${message}`)
  }

  return data
}

async function login({ username, password }) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
  return response.token
}

function printStep(step, details) {
  console.log(`\n[STEP ${step}] ${details}`)
}

function printVerification(complaint) {
  console.log('\n=== FINAL VERIFICATION ===')
  console.log(`Complaint ID: ${complaint.id}`)
  console.log(`Title: ${complaint.title}`)
  console.log(`Status: ${complaint.status}`)
  console.log(`Risk: ${complaint.riskLevel} (${complaint.riskScore})`)
  console.log(`CAPA Status: ${complaint.capaStatus}`)
  console.log(`Effectiveness: ${complaint.effectivenessCheckResult}`)
  console.log(`History Entries: ${(complaint.history || []).length}`)

  const condensedHistory = (complaint.history || []).map((h, idx) => ({
    step: idx + 1,
    from: h.from,
    to: h.to,
    by: h.changedBy,
    comment: h.comment,
  }))
  console.table(condensedHistory)
}

async function run() {
  console.log(`Running complaint workflow POC against ${BASE_URL}`)

  const [adminToken, managerToken, labToken] = await Promise.all([
    login(USERS.admin),
    login(USERS.manager),
    login(USERS.labtech),
  ])

  printStep(1, 'Create complaint as Lab Technician')
  const created = await request('/complaints', {
    method: 'POST',
    token: labToken,
    body: {
      title: 'POC - End to End Complaint for Demo',
      description: 'Demonstrates real-time multi-role complaint lifecycle with verification by API.',
      source: 'Regulator',
      complaintType: 'Product Complaint',
      productFamily: 'Surgical Devices',
      productCode: 'SD-401',
      lotNumber: 'LOT-POC-401',
      batchNumber: 'BATCH-POC-401',
      country: 'US',
      severity: 'High',
      occurrence: 4,
      detectability: 3,
      ownerId: 'manager',
      investigatorId: 'labtech',
      approverId: 'manager',
      linkedCapaId: 'CAPA-POC-401',
      capaStatus: 'Open',
    },
  })

  const complaintId = created.id
  console.log(`Created complaint: ${complaintId}`)

  printStep(2, 'Create -> Investigate by Lab Technician')
  await request(`/complaints/${complaintId}/transition`, {
    method: 'PATCH',
    token: labToken,
    body: {
      nextStatus: 'Investigate',
      stageData: {
        investigationSummary: 'Investigation started; lot check performed and defect pattern identified.',
        rootCause: 'Supplier label adhesive variability during humid storage.',
      },
      comment: 'Initial investigation completed by lab.',
    },
  })

  printStep(3, 'Investigate -> Action Plan by Lab Technician')
  await request(`/complaints/${complaintId}/transition`, {
    method: 'PATCH',
    token: labToken,
    body: {
      nextStatus: 'Action Plan',
      stageData: {
        actionPlan: 'Contain affected lot, update incoming QC checks, enforce supplier corrective action.',
      },
      comment: 'Action plan drafted and submitted for approval.',
    },
  })

  printStep(4, 'Action Plan -> Approval by Manager')
  await request(`/complaints/${complaintId}/transition`, {
    method: 'PATCH',
    token: managerToken,
    body: {
      nextStatus: 'Approval',
      stageData: {
        approvalComments: 'Requesting approval for immediate containment and 30-day monitoring.',
      },
      comment: 'Moved to approval queue.',
    },
  })

  printStep(5, 'Approval -> Execution by Manager')
  await request(`/complaints/${complaintId}/transition`, {
    method: 'PATCH',
    token: managerToken,
    body: {
      nextStatus: 'Execution',
      stageData: {
        approvalComments: 'Approved. Proceed with CAPA and verify effectiveness before closure.',
      },
      comment: 'Approved by quality manager.',
    },
  })

  printStep(6, 'Execution -> Verification by Lab Technician')
  await request(`/complaints/${complaintId}/transition`, {
    method: 'PATCH',
    token: labToken,
    body: {
      nextStatus: 'Verification',
      stageData: {
        executionSummary: 'Containment implemented, supplier notified, QC checks updated.',
        verificationSummary: 'No recurrence in monitored batches.',
        effectivenessCheckResult: 'Pass',
      },
      comment: 'Execution complete; verification evidence attached.',
    },
  })

  printStep(7, 'Try to close with CAPA Open (expected block)')
  try {
    await request(`/complaints/${complaintId}/transition`, {
      method: 'PATCH',
      token: managerToken,
      body: {
        nextStatus: 'Close',
        stageData: {
          closureComments: 'Attempted close before CAPA status update.',
        },
        comment: 'First close attempt should fail by policy.',
      },
    })
    console.log('Warning: close unexpectedly succeeded while CAPA was open.')
  } catch (error) {
    console.log(`Expected policy block: ${error.message}`)
  }

  printStep(8, 'Set CAPA to Closed by Manager')
  const updatedAfterCapaPatch = await request(`/complaints/${complaintId}`, {
    method: 'PATCH',
    token: managerToken,
    body: {
      capaStatus: 'Closed',
      approvalComments: 'CAPA closed; closure gate conditions satisfied.',
    },
  })
  console.log(`CAPA status after PATCH response: ${updatedAfterCapaPatch.capaStatus}`)

  const verifyAfterCapaPatch = await request(`/complaints/${complaintId}`, {
    method: 'GET',
    token: managerToken,
  })
  console.log(`CAPA status after GET check: ${verifyAfterCapaPatch.capaStatus}`)

  printStep(9, 'Verification -> Close by Manager')
  await request(`/complaints/${complaintId}/transition`, {
    method: 'PATCH',
    token: managerToken,
    body: {
      nextStatus: 'Close',
      stageData: {
        closureComments: 'Complaint closed after CAPA completion and pass effectiveness.',
      },
      comment: 'Closure approved by manager.',
    },
  })

  printStep(10, 'Verify final complaint data via API')
  const finalComplaint = await request(`/complaints/${complaintId}`, {
    method: 'GET',
    token: adminToken,
  })

  printVerification(finalComplaint)

  if (finalComplaint.status !== 'Close') {
    throw new Error(`Verification failed: expected status Close, got ${finalComplaint.status}`)
  }

  if (finalComplaint.capaStatus !== 'Closed') {
    throw new Error(`Verification failed: expected CAPA Closed, got ${finalComplaint.capaStatus}`)
  }

  if (finalComplaint.effectivenessCheckResult !== 'Pass') {
    throw new Error(`Verification failed: expected effectiveness Pass, got ${finalComplaint.effectivenessCheckResult}`)
  }

  console.log('\nPOC SUCCESS: Multi-role complaint lifecycle executed and verified via API.')
}

run().catch((error) => {
  console.error('\nPOC FAILED:', error.message)
  process.exitCode = 1
})
