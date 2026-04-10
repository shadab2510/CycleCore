import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createSample } from '../store/samplesSlice'
import { SAMPLE_TYPES, TEST_CATEGORIES } from '../utils/clinicalTrials'

const ClinicalTrialSample = () => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    // Basic Sample Info
    name: '',
    type: SAMPLE_TYPES.BLOOD,
    source: '',
    collectionDate: new Date().toISOString().split('T')[0],
    
    // Clinical Trial Specific
    trialId: '',
    patientId: '',
    visitNumber: '',
    siteId: '',
    principalInvestigator: '',
    protocolVersion: '',
    randomizationCode: '',
    informedConsent: false,
    
    // J&J Inspired Features
    deviceType: '',
    kitId: '',
    returnTracking: '',
    temperatureLog: '',
    collectionMethod: 'Venipuncture',
    
    // Manufacturing (for pharma samples)
    batchId: '',
    manufacturingDate: '',
    expirationDate: '',
    activeIngredient: '',
    potency: ''
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Generate clinical sample ID
    const sampleId = `TRL-${formData.trialId || 'DEMO'}-PAT-${formData.patientId || '0000'}-VIS-${formData.visitNumber || '001'}-${Date.now().toString(36).toUpperCase()}`
    
    const sampleData = {
      id: sampleId,
      name: formData.name || `${formData.type} - Patient ${formData.patientId}`,
      type: formData.type,
      source: formData.source,
      collectionDate: formData.collectionDate,
      status: 'Design',
      
      // Clinical Trial Metadata
      clinicalTrial: {
        trialId: formData.trialId,
        patientId: formData.patientId,
        visitNumber: formData.visitNumber,
        siteId: formData.siteId,
        principalInvestigator: formData.principalInvestigator,
        protocolVersion: formData.protocolVersion,
        randomizationCode: formData.randomizationCode,
        informedConsent: formData.informedConsent
      },
      
      // J&J Inspired Features
      deviceInfo: formData.deviceType ? {
        type: formData.deviceType,
        kitId: formData.kitId,
        returnTracking: formData.returnTracking,
        temperatureLog: formData.temperatureLog.split(',').map(t => t.trim())
      } : null,
      
      // Manufacturing Info
      manufacturing: formData.batchId ? {
        batchId: formData.batchId,
        manufacturingDate: formData.manufacturingDate,
        expirationDate: formData.expirationDate,
        activeIngredient: formData.activeIngredient,
        potency: formData.potency
      } : null,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    dispatch(createSample(sampleData))
    
    // Reset form
    setFormData({
      name: '',
      type: SAMPLE_TYPES.BLOOD,
      source: '',
      collectionDate: new Date().toISOString().split('T')[0],
      trialId: '',
      patientId: '',
      visitNumber: '',
      siteId: '',
      principalInvestigator: '',
      protocolVersion: '',
      randomizationCode: '',
      informedConsent: false,
      deviceType: '',
      kitId: '',
      returnTracking: '',
      temperatureLog: '',
      collectionMethod: 'Venipuncture',
      batchId: '',
      manufacturingDate: '',
      expirationDate: '',
      activeIngredient: '',
      potency: ''
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🏥 Clinical Trial Sample Creation
        </h2>
        <p className="text-gray-600 mb-6">
          J&J Janssen-inspired clinical trial sample management with regulatory compliance
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Sample Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Sample Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Blood Sample - Patient 001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.values(SAMPLE_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Patient 001 - Mayo Clinic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Collection Date</label>
                <input
                  type="date"
                  name="collectionDate"
                  value={formData.collectionDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Clinical Trial Information */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 Clinical Trial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trial ID</label>
                <input
                  type="text"
                  name="trialId"
                  value={formData.trialId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., JNJ-COVID19-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., PAT-001234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visit Number</label>
                <input
                  type="text"
                  name="visitNumber"
                  value={formData.visitNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., VIS-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Site ID</label>
                <input
                  type="text"
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., MAYO-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Principal Investigator</label>
                <input
                  type="text"
                  name="principalInvestigator"
                  value={formData.principalInvestigator}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Protocol Version</label>
                <input
                  type="text"
                  name="protocolVersion"
                  value={formData.protocolVersion}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., v2.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Randomization Code</label>
                <input
                  type="text"
                  name="randomizationCode"
                  value={formData.randomizationCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., A-1234"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="informedConsent"
                  id="informedConsent"
                  checked={formData.informedConsent}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="informedConsent" className="ml-2 block text-sm text-gray-900">
                  Informed Consent Documented
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Features Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Features (J&J Inspired)
            </button>
          </div>

          {showAdvanced && (
            <>
              {/* J&J MedTech Features */}
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 MedTech Device Testing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Type</label>
                    <input
                      type="text"
                      name="deviceType"
                      value={formData.deviceType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Surgical Robot"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kit ID</label>
                    <input
                      type="text"
                      name="kitId"
                      value={formData.kitId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., JNJ-DA-VINCI-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Return Tracking</label>
                    <input
                      type="text"
                      name="returnTracking"
                      value={formData.returnTracking}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., UPS-1Z999AA10123456784"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temperature Log</label>
                    <input
                      type="text"
                      name="temperatureLog"
                      value={formData.temperatureLog}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., 2-8°C, 2-8°C, 2-8°C"
                    />
                  </div>
                </div>
              </div>

              {/* Pharmaceutical Manufacturing */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💊 Pharmaceutical Manufacturing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch ID</label>
                    <input
                      type="text"
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., JNJ-TYLENOL-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                    <input
                      type="date"
                      name="manufacturingDate"
                      value={formData.manufacturingDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                    <input
                      type="date"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Active Ingredient</label>
                    <input
                      type="text"
                      name="activeIngredient"
                      value={formData.activeIngredient}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Acetaminophen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Potency (%)</label>
                    <input
                      type="text"
                      name="potency"
                      value={formData.potency}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., 99.8%"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setFormData({
                name: '',
                type: SAMPLE_TYPES.BLOOD,
                source: '',
                collectionDate: new Date().toISOString().split('T')[0],
                trialId: '',
                patientId: '',
                visitNumber: '',
                siteId: '',
                principalInvestigator: '',
                protocolVersion: '',
                randomizationCode: '',
                informedConsent: false,
                deviceType: '',
                kitId: '',
                returnTracking: '',
                temperatureLog: '',
                collectionMethod: 'Venipuncture',
                batchId: '',
                manufacturingDate: '',
                expirationDate: '',
                activeIngredient: '',
                potency: ''
              })}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Clinical Sample
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClinicalTrialSample
