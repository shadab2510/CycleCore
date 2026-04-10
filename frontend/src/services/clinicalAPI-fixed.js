import api from './api'

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
