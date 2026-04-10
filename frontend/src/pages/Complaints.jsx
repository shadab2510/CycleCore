import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchComplaints,
  createComplaint,
  updateComplaint,
  transitionComplaintStage,
  seedDemoComplaints,
  clearComplaintsError,
} from '../store/complaintsSlice'

const WORKFLOW = ['Create', 'Investigate', 'Action Plan', 'Approval', 'Execution', 'Verification', 'Close']

const SOURCES = ['Call Center', 'Email', 'Distributor', 'Hospital', 'Regulator', 'Other']
const COMPLAINT_TYPES = ['Product Complaint', 'Adverse Event', 'Service Issue']
const CAPA_STATUSES = ['Not Linked', 'Open', 'Closed']
const EFFECTIVENESS_RESULTS = ['Pending', 'Pass', 'Fail']

const STAGE_DATA_FIELD_MAP = {
  Investigate: ['investigationSummary', 'rootCause'],
  'Action Plan': ['actionPlan'],
  Approval: ['approvalComments'],
  Execution: ['executionSummary'],
  Verification: ['verificationSummary', 'effectivenessCheckResult'],
  Close: ['closureComments'],
}

const DEFAULT_STAGE_FORM = {
  investigationSummary: '',
  rootCause: '',
  actionPlan: '',
  approvalComments: '',
  executionSummary: '',
  verificationSummary: '',
  closureComments: '',
  effectivenessCheckResult: 'Pending',
  comment: '',
}

const DEFAULT_OWNERSHIP_FORM = {
  ownerId: '',
  investigatorId: '',
  approverId: '',
  linkedCapaId: '',
  capaStatus: 'Not Linked',
  regulatoryReviewRequired: false,
  supplierNcrRequired: false,
}

const getComplaintIdentifier = (complaint) => complaint?.id || complaint?._id || ''

const Complaints = () => {
  const dispatch = useDispatch()
  const { items: complaints, loading, error } = useSelector(state => state.complaints)
  const { user } = useSelector(state => state.auth)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedComplaintId, setSelectedComplaintId] = useState('')
  const [localMessage, setLocalMessage] = useState('')
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    sampleId: '',
    source: 'Other',
    complaintType: 'Product Complaint',
    productFamily: '',
    productCode: '',
    lotNumber: '',
    batchNumber: '',
    serialNumber: '',
    country: '',
    dateOfAwareness: new Date().toISOString().slice(0, 10),
    severity: 'Medium',
    occurrence: 3,
    detectability: 3,
    ownerId: '',
    investigatorId: '',
    approverId: '',
    linkedCapaId: '',
    capaStatus: 'Not Linked',
  })
  const [stageForm, setStageForm] = useState(DEFAULT_STAGE_FORM)
  const [ownershipForm, setOwnershipForm] = useState(DEFAULT_OWNERSHIP_FORM)

  useEffect(() => {
    dispatch(fetchComplaints())
  }, [dispatch])

  useEffect(() => {
    if (complaints.length > 0 && !selectedComplaintId) {
      setSelectedComplaintId(getComplaintIdentifier(complaints[0]))
    }
  }, [complaints, selectedComplaintId])

  const selectedComplaint = useMemo(
    () => complaints.find(item => getComplaintIdentifier(item) === selectedComplaintId) || null,
    [complaints, selectedComplaintId]
  )

  useEffect(() => {
    if (!selectedComplaint) return

    setStageForm({
      investigationSummary: selectedComplaint.investigationSummary || '',
      rootCause: selectedComplaint.rootCause || '',
      actionPlan: selectedComplaint.actionPlan || '',
      approvalComments: selectedComplaint.approvalComments || '',
      executionSummary: selectedComplaint.executionSummary || '',
      verificationSummary: selectedComplaint.verificationSummary || '',
      closureComments: selectedComplaint.closureComments || '',
      effectivenessCheckResult: selectedComplaint.effectivenessCheckResult || 'Pending',
      comment: '',
    })

    setOwnershipForm({
      ownerId: selectedComplaint.ownerId || '',
      investigatorId: selectedComplaint.investigatorId || '',
      approverId: selectedComplaint.approverId || '',
      linkedCapaId: selectedComplaint.linkedCapaId || '',
      capaStatus: selectedComplaint.capaStatus || 'Not Linked',
      regulatoryReviewRequired: !!selectedComplaint.regulatoryReviewRequired,
      supplierNcrRequired: !!selectedComplaint.supplierNcrRequired,
    })

    setLocalMessage('')
  }, [selectedComplaint])

  const getCurrentIndex = (status) => WORKFLOW.indexOf(status)
  const getNextStage = (status) => WORKFLOW[getCurrentIndex(status) + 1] || null

  const canMoveToNextStage = (nextStage) => {
    if (!nextStage) return false

    if (nextStage === 'Approval' || nextStage === 'Close') {
      return user?.role === 'admin' || user?.role === 'manager'
    }

    return user?.role === 'admin' || user?.role === 'manager' || user?.role === 'lab_technician'
  }

  const canReopen = () => user?.role === 'admin' || user?.role === 'manager'

  const dashboardKpis = useMemo(() => {
    const now = Date.now()
    const overdue = complaints.filter((c) => c.slaDueAt && new Date(c.slaDueAt).getTime() < now && c.status !== 'Close').length
    const critical = complaints.filter((c) => c.riskLevel === 'Critical').length
    const open = complaints.filter((c) => c.status !== 'Close').length
    return { overdue, critical, open }
  }, [complaints])

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRiskClass = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getSlaClass = (slaDueAt, status) => {
    if (!slaDueAt || status === 'Close') return 'text-gray-600'
    return new Date(slaDueAt).getTime() < Date.now() ? 'text-red-600 font-semibold' : 'text-gray-600'
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLocalMessage('')

    const result = await dispatch(createComplaint(createForm))
    if (!result.error) {
      setCreateForm({
        title: '',
        description: '',
        sampleId: '',
        source: 'Other',
        complaintType: 'Product Complaint',
        productFamily: '',
        productCode: '',
        lotNumber: '',
        batchNumber: '',
        serialNumber: '',
        country: '',
        dateOfAwareness: new Date().toISOString().slice(0, 10),
        severity: 'Medium',
        occurrence: 3,
        detectability: 3,
        ownerId: '',
        investigatorId: '',
        approverId: '',
        linkedCapaId: '',
        capaStatus: 'Not Linked',
      })
      setShowCreateForm(false)
      setSelectedComplaintId(getComplaintIdentifier(result.payload))
      setLocalMessage('Complaint created with auto risk scoring and SLA due date.')
    }
  }

  const handleSaveOwnership = async () => {
    if (!selectedComplaint) return
    setLocalMessage('')

    const payload = {
      ...ownershipForm,
      capaStatus: ownershipForm.linkedCapaId ? ownershipForm.capaStatus : 'Not Linked',
    }

    const result = await dispatch(updateComplaint({ id: selectedComplaint.id, payload }))
    if (!result.error) {
      setLocalMessage('Ownership, CAPA link and automation flags saved.')
    }
  }

  const handleSeedDemoData = async () => {
    setLocalMessage('')
    const result = await dispatch(seedDemoComplaints())
    if (!result.error) {
      const firstDemo = result.payload?.items?.find(item => getComplaintIdentifier(item).startsWith('CMP-DEMO-'))
      if (firstDemo) {
        setSelectedComplaintId(getComplaintIdentifier(firstDemo))
      }
      setLocalMessage('Demo complaints loaded. You can now run the POC flow quickly.')
    }
  }

  const handleTransition = async (actionType = 'advance') => {
    if (!selectedComplaint) return
    setLocalMessage('')

    const nextStage = actionType === 'advance' ? getNextStage(selectedComplaint.status) : selectedComplaint.status
    if (actionType === 'advance' && !nextStage) return

    const requiredFields = STAGE_DATA_FIELD_MAP[actionType === 'advance' ? nextStage : selectedComplaint.status] || []
    const stageData = requiredFields.reduce((acc, field) => {
      acc[field] = stageForm[field]
      return acc
    }, {})

    const missingField = requiredFields.find(field => !stageData[field]?.trim())
    if (missingField) {
      setLocalMessage(`Please fill ${missingField} before continuing.`)
      return
    }

    if (actionType === 'reject' && !stageForm.approvalComments.trim()) {
      setLocalMessage('Approval comments are required for rejection.')
      return
    }

    if (actionType === 'advance' && nextStage === 'Close' && ownershipForm.capaStatus === 'Open') {
      setLocalMessage('Close is blocked: CAPA must be Closed first.')
      return
    }

    const payload = {
      nextStatus: actionType === 'advance' ? nextStage : undefined,
      action: actionType,
      stageData,
      comment: stageForm.comment,
    }

    const result = await dispatch(
      transitionComplaintStage({
        id: selectedComplaint.id,
        payload,
      })
    )

    setStageForm((prev) => ({ ...prev, comment: '' }))
    if (!result.error) {
      if (actionType === 'reject') {
        setLocalMessage('Approval rejected and complaint moved back to Action Plan.')
      } else if (actionType === 'reopen') {
        setLocalMessage('Complaint reopened and moved back to Action Plan.')
      } else {
        setLocalMessage(`Moved to ${nextStage}.`)
      }
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading complaints...</div>
  }

  const nextStage = selectedComplaint ? getNextStage(selectedComplaint.status) : null
  const canTransition = canMoveToNextStage(nextStage)
  const requiredFields = STAGE_DATA_FIELD_MAP[nextStage || selectedComplaint?.status] || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase">Open Complaints</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardKpis.open}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase">Critical Risk</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{dashboardKpis.critical}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase">Overdue SLA</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{dashboardKpis.overdue}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Complaint Investigation Workflow</h2>
          <p className="text-sm text-gray-600 mt-1">Create, investigate, action plan, approval, execution, verification, and close.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleSeedDemoData}>
            Load Demo Data
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? 'Hide Form' : 'Create Complaint'}
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button className="text-sm underline" onClick={() => dispatch(clearComplaintsError())}>Dismiss</button>
        </div>
      )}

      {localMessage && (
        <div className="border border-blue-200 bg-blue-50 text-blue-700 px-4 py-3 rounded-md">
          {localMessage}
        </div>
      )}

      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Complaint (Intake + Triage)</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.source}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, source: e.target.value }))}
                >
                  {SOURCES.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.complaintType}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, complaintType: e.target.value }))}
                >
                  {COMPLAINT_TYPES.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sample ID (optional)</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.sampleId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, sampleId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Family</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.productFamily}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, productFamily: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.productCode}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, productCode: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.lotNumber}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, lotNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.batchNumber}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.serialNumber}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.country}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Awareness</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.dateOfAwareness}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, dateOfAwareness: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.severity}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occurrence (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.occurrence}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, occurrence: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detectability (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.detectability}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, detectability: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                value={createForm.description}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="username"
                  value={createForm.ownerId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, ownerId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investigator</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="username"
                  value={createForm.investigatorId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, investigatorId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="username"
                  value={createForm.approverId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, approverId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked CAPA ID</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.linkedCapaId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, linkedCapaId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAPA Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={createForm.capaStatus}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, capaStatus: e.target.value }))}
                >
                  {CAPA_STATUSES.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Submit Complaint</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1 h-[72vh] flex flex-col overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {complaints.length === 0 && <p className="text-sm text-gray-500">No complaints yet.</p>}
            {complaints.map(item => (
              
              <button
                key={getComplaintIdentifier(item)}
                onClick={() => setSelectedComplaintId(getComplaintIdentifier(item))}
                className={`w-full text-left border rounded-md p-3 transition ${
                  selectedComplaintId === getComplaintIdentifier(item) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityClass(item.severity)}`}>{item.severity}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Complaint ID: {getComplaintIdentifier(item) || 'Pending'}</p>
                <p className="text-xs text-gray-600 mt-2">Stage: {item.status}</p>
                <p className={`text-xs mt-1 ${getSlaClass(item.slaDueAt, item.status)}`}>
                  SLA: {item.slaDueAt ? new Date(item.slaDueAt).toLocaleString() : 'Not set'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2 h-[72vh] overflow-hidden">
          {!selectedComplaint ? (
            <p className="text-gray-500">Select a complaint to investigate.</p>
          ) : (
            <div className="space-y-5 h-full overflow-y-auto pr-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">{selectedComplaint.title}</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  Complaint ID: {getComplaintIdentifier(selectedComplaint) || 'Pending'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityClass(selectedComplaint.severity)}`}>{selectedComplaint.severity}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getRiskClass(selectedComplaint.riskLevel)}`}>
                  Risk: {selectedComplaint.riskLevel} ({selectedComplaint.riskScore})
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Current: {selectedComplaint.status}</span>
                {selectedComplaint.escalated && <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Escalated</span>}
              </div>

              <p className="text-sm text-gray-700">{selectedComplaint.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500 uppercase">Source</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedComplaint.source || 'N/A'}</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500 uppercase">Complaint Type</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedComplaint.complaintType || 'N/A'}</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500 uppercase">SLA Due</p>
                  <p className={`mt-1 ${getSlaClass(selectedComplaint.slaDueAt, selectedComplaint.status)}`}>
                    {selectedComplaint.slaDueAt ? new Date(selectedComplaint.slaDueAt).toLocaleString() : 'Not set'}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-4 space-y-4">
                <h4 className="font-semibold text-gray-900">Ownership, CAPA and Automation Flags</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={ownershipForm.ownerId}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, ownerId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investigator</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={ownershipForm.investigatorId}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, investigatorId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={ownershipForm.approverId}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, approverId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked CAPA ID</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={ownershipForm.linkedCapaId}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, linkedCapaId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAPA Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={ownershipForm.capaStatus}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, capaStatus: e.target.value }))}
                    >
                      {CAPA_STATUSES.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      id="regulatory-flag"
                      type="checkbox"
                      checked={ownershipForm.regulatoryReviewRequired}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, regulatoryReviewRequired: e.target.checked }))}
                    />
                    <label htmlFor="regulatory-flag" className="text-sm text-gray-700">Regulatory review required</label>
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <input
                      id="supplier-flag"
                      type="checkbox"
                      checked={ownershipForm.supplierNcrRequired}
                      onChange={(e) => setOwnershipForm((prev) => ({ ...prev, supplierNcrRequired: e.target.checked }))}
                    />
                    <label htmlFor="supplier-flag" className="text-sm text-gray-700">Supplier NCR required</label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="btn btn-secondary" onClick={handleSaveOwnership}>Save Triage/Ownership</button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Workflow Progress</p>
                <div className="flex flex-wrap gap-2">
                  {WORKFLOW.map((stage, index) => {
                    const isDone = index <= getCurrentIndex(selectedComplaint.status)
                    return (
                      <span
                        key={stage}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isDone ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {index + 1}. {stage}
                      </span>
                    )
                  })}
                </div>
              </div>

              {nextStage && (
                <div className="border border-gray-200 rounded-md p-4 space-y-4">
                  <h4 className="font-semibold text-gray-900">Move to next stage: {nextStage}</h4>

                  {requiredFields.includes('investigationSummary') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Summary</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.investigationSummary}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, investigationSummary: e.target.value }))}
                      />
                    </div>
                  )}

                  {requiredFields.includes('rootCause') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.rootCause}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, rootCause: e.target.value }))}
                      />
                    </div>
                  )}

                  {requiredFields.includes('actionPlan') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Plan</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.actionPlan}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, actionPlan: e.target.value }))}
                      />
                    </div>
                  )}

                  {requiredFields.includes('approvalComments') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approval Comments</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.approvalComments}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, approvalComments: e.target.value }))}
                      />
                    </div>
                  )}

                  {requiredFields.includes('executionSummary') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Execution Summary</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.executionSummary}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, executionSummary: e.target.value }))}
                      />
                    </div>
                  )}

                  {requiredFields.includes('verificationSummary') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Summary</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.verificationSummary}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, verificationSummary: e.target.value }))}
                      />
                    </div>
                  )}

                  {requiredFields.includes('effectivenessCheckResult') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effectiveness Check Result</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.effectivenessCheckResult}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, effectivenessCheckResult: e.target.value }))}
                      >
                        {EFFECTIVENESS_RESULTS.map(option => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                  )}

                  {requiredFields.includes('closureComments') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Closure Comments</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={stageForm.closureComments}
                        onChange={(e) => setStageForm((prev) => ({ ...prev, closureComments: e.target.value }))}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transition Comment (optional)</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={stageForm.comment}
                      onChange={(e) => setStageForm((prev) => ({ ...prev, comment: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {!canTransition && (
                      <p className="text-sm text-red-600">Your role does not have permission to move to {nextStage}.</p>
                    )}
                    <div className="flex gap-2">
                      {selectedComplaint.status === 'Approval' && (user?.role === 'admin' || user?.role === 'manager') && (
                        <button type="button" className="btn btn-warning" onClick={() => handleTransition('reject')}>
                          Reject to Action Plan
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleTransition('advance')}
                        disabled={!canTransition}
                      >
                        Move to {nextStage}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(selectedComplaint.status === 'Verification' || selectedComplaint.status === 'Close') && canReopen() && (
                <div className="border border-orange-200 bg-orange-50 rounded-md p-4 flex justify-between items-center">
                  <p className="text-sm text-orange-700">Need rework? Reopen to Action Plan.</p>
                  <button type="button" className="btn btn-warning" onClick={() => handleTransition('reopen')}>
                    Reopen
                  </button>
                </div>
              )}

              {!nextStage && (
                <div className="border border-green-200 bg-green-50 rounded-md p-4">
                  <p className="text-green-700 font-medium">Complaint is fully closed.</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">History</h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {(selectedComplaint.history || []).length === 0 && (
                    <p className="text-sm text-gray-500">No workflow transitions yet.</p>
                  )}
                  {(selectedComplaint.history || []).map((entry, idx) => (
                    <div key={`${entry.changedAt}-${idx}`} className="text-sm border border-gray-200 rounded-md p-3">
                      <p className="font-medium text-gray-900">{entry.from} → {entry.to}</p>
                      <p className="text-gray-600">{entry.comment || 'No comment provided'}</p>
                      <p className="text-xs text-gray-500 mt-1">By {entry.changedBy} on {new Date(entry.changedAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Complaints
