// Clinical Trial Management System - Inspired by J&J Janssen
export const CLINICAL_TRIAL_PHASES = {
  SCREENING: 'Screening',
  PHASE_I: 'Phase I',
  PHASE_II: 'Phase II',
  PHASE_III: 'Phase III',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}

export const TRIAL_STATUS_COLORS = {
  [CLINICAL_TRIAL_PHASES.SCREENING]: 'status-screening',
  [CLINICAL_TRIAL_PHASES.PHASE_I]: 'status-phase-i',
  [CLINICAL_TRIAL_PHASES.PHASE_II]: 'status-phase-ii',
  [CLINICAL_TRIAL_PHASES.PHASE_III]: 'status-phase-iii',
  [CLINICAL_TRIAL_PHASES.APPROVED]: 'status-approved',
  [CLINICAL_TRIAL_PHASES.REJECTED]: 'status-rejected'
}

export const SAMPLE_TYPES = {
  BLOOD: 'Blood',
  PLASMA: 'Plasma',
  SERUM: 'Serum',
  URINE: 'Urine',
  TISSUE: 'Tissue',
  CSF: 'Cerebrospinal Fluid',
  SWAB: 'Swab',
  SALIVA: 'Saliva',
  CELL_CULTURE: 'Cell Culture',
  BIOPSY: 'Biopsy'
}

export const TEST_CATEGORIES = {
  HEMATOLOGY: 'Hematology',
  CHEMISTRY: 'Chemistry',
  IMMUNOLOGY: 'Immunology',
  MICROBIOLOGY: 'Microbiology',
  MOLECULAR: 'Molecular Biology',
  PATHOLOGY: 'Pathology',
  GENETICS: 'Genetics',
  PHARMACOKINETICS: 'Pharmacokinetics',
  TOXICOLOGY: 'Toxicology',
  BIOMARKERS: 'Biomarkers'
}

export const REGULATORY_COMPLIANCE = {
  FDA_21CFR_PART_11: 'FDA 21 CFR Part 11',
  CLIA: 'CLIA',
  CAP: 'CAP',
  ISO_15189: 'ISO 15189',
  GDPR: 'GDPR',
  HIPAA: 'HIPAA'
}

export const generateClinicalSampleId = (trialId, patientId, visitNumber) => {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `TRL-${trialId}-PAT-${patientId}-VIS-${visitNumber}-${timestamp}`
}

export const validateClinicalSample = (sample, trial) => {
  const errors = []
  
  // Check if sample type is allowed for trial
  if (!trial.allowedSampleTypes.includes(sample.type)) {
    errors.push(`Sample type ${sample.type} not allowed for this trial`)
  }
  
  // Check collection timing
  const collectionDate = new Date(sample.collectionDate)
  const trialStartDate = new Date(trial.startDate)
  const trialEndDate = new Date(trial.endDate)
  
  if (collectionDate < trialStartDate || collectionDate > trialEndDate) {
    errors.push('Sample collection date outside trial period')
  }
  
  // Check required fields for clinical trials
  if (!sample.patientId) errors.push('Patient ID required')
  if (!sample.visitNumber) errors.push('Visit number required')
  if (!sample.informedConsent) errors.push('Informed consent documentation required')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const calculateTrialProgress = (samples) => {
  const totalSamples = samples.length
  const completedSamples = samples.filter(s => s.status === 'Completed').length
  const progress = totalSamples > 0 ? (completedSamples / totalSamples) * 100 : 0
  
  return {
    totalSamples,
    completedSamples,
    progress,
    status: progress >= 100 ? 'Completed' : progress >= 50 ? 'In Progress' : 'Started'
  }
}
