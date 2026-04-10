export const LIFECYCLE_STATUSES = {
  DESIGN: 'Design',
  VALIDATION: 'Validation',
  APPROVAL: 'Approval',
  COMPLETED: 'Completed',
}

export const STATUS_COLORS = {
  [LIFECYCLE_STATUSES.DESIGN]: 'status-design',
  [LIFECYCLE_STATUSES.VALIDATION]: 'status-validation',
  [LIFECYCLE_STATUSES.APPROVAL]: 'status-approval',
  [LIFECYCLE_STATUSES.COMPLETED]: 'status-completed',
}

export const canMoveToValidation = (sample, tests) => {
  if (!sample) return false
  return sample.status === LIFECYCLE_STATUSES.DESIGN && tests.length > 0
}

export const canMoveToApproval = (sample, tests, results) => {
  if (!sample) return false
  const hasAllTests = tests.length > 0
  const hasAllResults = tests.every(test => 
    results.some(result => result.testId === test.id)
  )
  return sample.status === LIFECYCLE_STATUSES.VALIDATION && hasAllTests && hasAllResults
}

export const canComplete = (sample, results) => {
  if (!sample) return false
  const hasComplianceFlag = results.some(result => result.complianceFlag === true)
  return sample.status === LIFECYCLE_STATUSES.APPROVAL && hasComplianceFlag
}

export const getNextStatus = (currentStatus) => {
  switch (currentStatus) {
    case LIFECYCLE_STATUSES.DESIGN:
      return LIFECYCLE_STATUSES.VALIDATION
    case LIFECYCLE_STATUSES.VALIDATION:
      return LIFECYCLE_STATUSES.APPROVAL
    case LIFECYCLE_STATUSES.APPROVAL:
      return LIFECYCLE_STATUSES.COMPLETED
    default:
      return currentStatus
  }
}

export const generateSampleId = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `SMP-${timestamp}-${random}`
}
