import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cyclecorelims_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cyclecorelims_token')
      localStorage.removeItem('cyclecorelims_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
}

export const samplesAPI = {
  getAll: () => api.get('/samples'),
  getById: (id) => api.get(`/samples/${id}`),
  create: (data) => api.post('/samples', data),
  updateStatus: (id, status) => api.patch(`/samples/${id}`, { status }),
}

export const testsAPI = {
  getBySampleId: (sampleId) => api.get(`/tests?sampleId=${sampleId}`),
  create: (data) => api.post('/tests', data),
}

export const resultsAPI = {
  getByTestId: (testId) => api.get(`/results?testId=${testId}`),
  create: (data) => api.post('/results', data),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

export const complaintsAPI = {
  getAll: () => api.get('/complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.patch(`/complaints/${id}`, data),
  seedDemo: () => api.post('/complaints/demo-seed'),
  transitionStage: (id, payload) => api.patch(`/complaints/${id}/transition`, payload),
}

// Clinical Trials API
export const clinicalAPI = {
  // Clinical Trial Management
  getTrials: () => api.get('/clinical-trials'),
  createTrial: (trialData) => api.post('/clinical-trials', trialData),
  getTrial: (trialId) => api.get(`/clinical-trials/${trialId}`),
  updateTrial: (trialId, trialData) => api.put(`/clinical-trials/${trialId}`, trialData),
  
  // Trial Sites Management
  getTrialSites: (trialId) => api.get(`/clinical-trials/${trialId}/sites`),
  createTrialSite: (trialId, siteData) => api.post(`/clinical-trials/${trialId}/sites`, siteData),
  updateTrialSite: (trialId, siteId, siteData) => api.put(`/clinical-trials/${trialId}/sites/${siteId}`, siteData),
  
  // Patient Management
  getTrialPatients: (trialId) => api.get(`/clinical-trials/${trialId}/patients`),
  createPatient: (trialId, patientData) => api.post(`/clinical-trials/${trialId}/patients`, patientData),
  updatePatient: (trialId, patientId, patientData) => api.put(`/clinical-trials/${trialId}/patients/${patientId}`, patientData),
  
  // Clinical Sample Management
  getClinicalSamples: (trialId) => api.get(`/clinical-trials/${trialId}/samples`),
  createClinicalSample: (sampleData) => api.post('/clinical-samples', sampleData),
  getClinicalSample: (sampleId) => api.get(`/clinical-samples/${sampleId}`),
  updateClinicalSample: (sampleId, sampleData) => api.put(`/clinical-samples/${sampleId}`, sampleData),
  
  // Chain of Custody
  getChainOfCustody: (sampleId) => api.get(`/clinical-samples/${sampleId}/chain-of-custody`),
  updateChainOfCustody: (sampleId, custodyData) => api.post(`/clinical-samples/${sampleId}/chain-of-custody`, custodyData),
  
  // Regulatory Compliance
  validateRegulatoryCompliance: (trialId) => api.get(`/clinical-trials/${trialId}/compliance`),
  getComplianceReports: (trialId) => api.get(`/clinical-trials/${trialId}/compliance-reports`),
  
  // MedTech Device Testing
  getDeviceTests: () => api.get('/medtech/device-tests'),
  createDeviceTest: (testData) => api.post('/medtech/device-tests', testData),
  updateDeviceTest: (testId, testData) => api.put(`/medtech/device-tests/${testId}`, testData),
  
  // Sterility Assurance
  getSterilityTests: (sampleId) => api.get(`/medtech/sterility-tests/${sampleId}`),
  createSterilityTest: (testData) => api.post('/medtech/sterility-tests', testData),
  
  // Environmental Monitoring
  getEnvironmentalMonitoring: (siteId) => api.get(`/medtech/environmental-monitoring/${siteId}`),
  createEnvironmentalReading: (readingData) => api.post('/medtech/environmental-monitoring', readingData),
  
  // Consumer Health
  getHomeTestKits: () => api.get('/consumer-health/test-kits'),
  createHomeTestKit: (kitData) => api.post('/consumer-health/test-kits', kitData),
  updateKitStatus: (kitId, statusData) => api.put(`/consumer-health/test-kits/${kitId}`, statusData),
  
  // Mobile App Integration
  getMobileResults: (patientId) => api.get(`/mobile-app/results/${patientId}`),
  sendMobileNotification: (notificationData) => api.post('/mobile-app/notifications', notificationData),
  
  // Pharmaceutical Manufacturing
  getBatches: () => api.get('/pharma/batches'),
  createBatch: (batchData) => api.post('/pharma/batches', batchData),
  updateBatch: (batchId, batchData) => api.put(`/pharma/batches/${batchId}`, batchData),
  
  // Stability Testing
  getStabilityTests: (batchId) => api.get(`/pharma/stability-tests/${batchId}`),
  createStabilityTest: (testData) => api.post('/pharma/stability-tests', testData),
  
  // Quality Control
  getQualityTests: (batchId) => api.get(`/pharma/quality-tests/${batchId}`),
  createQualityTest: (testData) => api.post('/pharma/quality-tests', testData),
  
  // Analytics and Reporting
  getTrialAnalytics: (trialId) => api.get(`/analytics/trial/${trialId}`),
  getComplianceAnalytics: (trialId) => api.get(`/analytics/compliance/${trialId}`),
  getPerformanceMetrics: () => api.get('/analytics/performance'),
  
  // AI/ML Predictions
  getTrialRiskAssessment: (trialId) => api.get(`/ai/risk-assessment/${trialId}`),
  getPredictiveAnalytics: (trialId) => api.get(`/ai/predictive/${trialId}`),
  getAnomalyDetection: (sampleId) => api.get(`/ai/anomaly-detection/${sampleId}`),
  
  // Blockchain Integration
  getBlockchainTransactions: (sampleId) => api.get(`/blockchain/transactions/${sampleId}`),
  createBlockchainEntry: (entryData) => api.post('/blockchain/entries', entryData),
  verifyBlockchainIntegrity: (sampleId) => api.get(`/blockchain/verify/${sampleId}`),
  
  // IoT Sensor Integration
  getIoTReadings: (deviceId) => api.get(`/iot/readings/${deviceId}`),
  updateIoTDevice: (deviceId, deviceData) => api.put(`/iot/devices/${deviceId}`, deviceData),
  getIoTAlerts: () => api.get('/iot/alerts'),
  
  // Advanced Features
  getVoiceCommands: () => api.get('/voice/commands'),
  processVoiceCommand: (commandData) => api.post('/voice/process', commandData),
  getARProcedures: (procedureId) => api.get(`/ar/procedures/${procedureId}`)
}

export default api
