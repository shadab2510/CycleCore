import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSamples, updateSampleStatus, setCurrentSample } from '../store/samplesSlice'
import { fetchTests, createTest } from '../store/testsSlice'
import { fetchResults, createResult } from '../store/resultsSlice'
import { 
  LIFECYCLE_STATUSES, 
  STATUS_COLORS, 
  canMoveToValidation, 
  canMoveToApproval, 
  canComplete,
  getNextStatus 
} from '../utils/lifecycle'
import { getUnitsForTestType, getCommonValuesForTest } from '../constants/testConstants'
import { generateSampleResultsPDF, generateTestResultPDF, downloadPDF } from '../utils/pdfGenerator'

const SampleDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items: allSamples, loading: samplesLoading } = useSelector(state => state.samples)
  const { user } = useSelector(state => state.auth)
  const { items: tests, loading: testsLoading } = useSelector(state => state.tests)
  const { items: results, loading: resultsLoading } = useSelector(state => state.results)
  
  const [showTestForm, setShowTestForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [selectedTestId, setSelectedTestId] = useState(null)
  
  const [testForm, setTestForm] = useState({
    name: '',
    type: '',
    method: ''
  })
  
  const [resultForm, setResultForm] = useState({
    value: '',
    unit: '',
    status: 'Pass',
    complianceFlag: false
  })

  useEffect(() => {
    console.log('SampleDetails: Fetching samples...')
    dispatch(fetchSamples())
  }, [dispatch])

  useEffect(() => {
    console.log('SampleDetails: All samples:', allSamples)
    console.log('SampleDetails: Looking for sample ID:', id)
    if (allSamples.length > 0) {
      const sample = allSamples.find(s => s.id === id)
      console.log('SampleDetails: Found sample:', sample)
      if (sample) {
        dispatch(setCurrentSample(sample))
        dispatch(fetchTests(id))
        // Also fetch all results to ensure we have the latest data
        dispatch(fetchResults())
      } else {
        console.log('SampleDetails: Sample not found, navigating to samples')
        navigate('/samples')
      }
    }
  }, [allSamples, id, dispatch, navigate])

  useEffect(() => {
    if (tests.length > 0) {
      tests.forEach(test => {
        dispatch(fetchResults(test.id))
      })
    }
  }, [tests, dispatch])

  const handleStatusUpdate = () => {
    if (!currentSample) return
    const nextStatus = getNextStatus(currentSample.status)
    dispatch(updateSampleStatus({ id: currentSample.id, status: nextStatus }))
  }

  const handleCreateTest = (e) => {
    e.preventDefault()
    if (!currentSample) return
    dispatch(createTest({
      ...testForm,
      sampleId: currentSample.id
    }))
    setTestForm({ name: '', type: '', method: '' })
    setShowTestForm(false)
  }

  const handleCreateResult = (e) => {
    e.preventDefault()
    dispatch(createResult({
      ...resultForm,
      testId: selectedTestId
    }))
    setResultForm({ value: '', unit: '', status: 'Pass', complianceFlag: false })
    setShowResultForm(false)
    setSelectedTestId(null)
  }

  const handleDownloadSamplePDF = () => {
    if (!currentSample) return
    
    const doc = generateSampleResultsPDF(currentSample, tests, results, user)
    downloadPDF(doc, `sample-results-${currentSample.id}.pdf`)
  }

  const handleDownloadTestPDF = (testId) => {
    if (!currentSample) return
    
    const test = tests.find(t => t.id === testId)
    if (!test) return
    
    const doc = generateTestResultPDF(currentSample, test, results, user)
    downloadPDF(doc, `test-result-${test.name}-${testId}.pdf`)
  }

  const { currentSample } = useSelector(state => state.samples)
  const canMoveToValidationPhase = currentSample ? canMoveToValidation(currentSample, tests) : false
  const canMoveToApprovalPhase = currentSample ? canMoveToApproval(currentSample, tests, results) : false
  const canCompleteSample = currentSample ? canComplete(currentSample, results) : false

  if (samplesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading samples...</div>
      </div>
    )
  }

  if (!currentSample) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Sample not found</div>
          <button 
            onClick={() => navigate('/samples')}
            className="btn btn-primary"
          >
            Back to Samples
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{currentSample.name}</h2>
          <p className="text-gray-500">{currentSample.id}</p>
        </div>
        <div className="flex space-x-3">
          {currentSample.status === LIFECYCLE_STATUSES.DESIGN && (
            <button
              onClick={handleStatusUpdate}
              disabled={!canMoveToValidationPhase}
              className={`btn ${canMoveToValidationPhase ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
              data-testid="move-to-validation-btn"
            >
              Move to Validation
            </button>
          )}
          {currentSample.status === LIFECYCLE_STATUSES.VALIDATION && (user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => dispatch(updateSampleStatus({ id: currentSample.id, status: 'Design' }))}
              className="btn btn-secondary"
            >
              Back to Design
            </button>
          )}
          {currentSample.status === LIFECYCLE_STATUSES.VALIDATION && (user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={handleStatusUpdate}
              disabled={!canMoveToApprovalPhase}
              className={`btn ${canMoveToApprovalPhase ? 'btn-warning' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
              data-testid="submit-for-approval-btn"
            >
              Submit for Approval
            </button>
          )}
          {currentSample.status === LIFECYCLE_STATUSES.APPROVAL && (user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={handleStatusUpdate}
              disabled={!canCompleteSample}
              className={`btn ${canCompleteSample ? 'btn-success' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
              data-testid="approve-btn"
            >
              Approve & Complete
            </button>
          )}
          <button
            onClick={handleDownloadSamplePDF}
            className="btn btn-info"
            title="Download all test results as PDF"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Sample ID</p>
                <p className="text-gray-900">{currentSample.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{currentSample.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-gray-900">{currentSample.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Source</p>
                <p className="text-gray-900">{currentSample.source}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Collection Date</p>
                <p className="text-gray-900">{new Date(currentSample.collectionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Status</p>
                <span className={`status-badge ${STATUS_COLORS[currentSample.status]}`}>
                  {currentSample.status}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tests</h3>
              <button
                onClick={() => setShowTestForm(true)}
                disabled={currentSample.status !== LIFECYCLE_STATUSES.DESIGN}
                className={`btn ${currentSample.status === LIFECYCLE_STATUSES.DESIGN ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                data-testid="add-test-btn"
              >
                Add Test
              </button>
            </div>
            
            {showTestForm && (
              <form onSubmit={handleCreateTest} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Test Name"
                    value={testForm.name}
                    onChange={(e) => setTestForm({...testForm, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Test Type"
                    value={testForm.type}
                    onChange={(e) => setTestForm({...testForm, type: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Method"
                    value={testForm.method}
                    onChange={(e) => setTestForm({...testForm, method: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button type="button" onClick={() => setShowTestForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  {currentSample.status === 'Validation' && (user?.role === 'admin' || user?.role === 'manager') && (
                  <button
                    onClick={handleSubmitForApproval}
                    className="btn btn-primary"
                    disabled={!canSubmitForApproval()}
                  >
                    Submit for Approval
                  </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    Create Test
                  </button>
                </div>
              </form>
            )}

            {tests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tests added yet</p>
            ) : (
              <div className="space-y-3">
                {tests.map(test => (
                  <div key={test.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                        <p className="text-sm text-gray-500">{test.type} • {test.method}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadTestPDF(test.id)}
                          className="btn btn-sm btn-info"
                          title="Download test result as PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTestId(test.id)
                            setShowResultForm(true)
                          }}
                          disabled={currentSample.status !== LIFECYCLE_STATUSES.VALIDATION}
                          className={`btn btn-sm ${currentSample.status === LIFECYCLE_STATUSES.VALIDATION ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                          data-testid={`add-result-${test.id}`}
                        >
                          Add Result
                        </button>
                      </div>
                    </div>
                    
                    {results.filter(r => r.testId === test.id).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {results.filter(r => r.testId === test.id).map(result => (
                          <div key={result.id} className="p-3 bg-white rounded border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{result.value} {result.unit}</p>
                                <p className="text-sm text-gray-500">Status: {result.status}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${result.complianceFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {result.complianceFlag ? 'Compliant' : 'Non-Compliant'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle Progress</h3>
            <div className="space-y-3">
              {Object.values(LIFECYCLE_STATUSES).map((status, index) => (
                <div key={status} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    Object.values(LIFECYCLE_STATUSES).indexOf(currentSample.status) >= index 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm ${
                    currentSample.status === status ? 'font-medium text-gray-900' : 'text-gray-500'
                  }`}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Rules</h3>
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${canMoveToValidationPhase ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                ✓ Tests required for Validation
              </div>
              <div className={`p-2 rounded ${canMoveToApprovalPhase ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                ✓ Results required for Approval
              </div>
              <div className={`p-2 rounded ${canCompleteSample ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                ✓ Compliance required for Completion
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResultForm && selectedTestId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Test Result</h3>
            <form onSubmit={handleCreateResult} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <select
                  value={resultForm.value}
                  onChange={(e) => setResultForm({...resultForm, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a value...</option>
                  {getCommonValuesForTest(
                    tests.find(t => t.id === selectedTestId)?.name || '',
                    tests.find(t => t.id === selectedTestId)?.type || 'GENERAL'
                  ).map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={resultForm.value}
                  onChange={(e) => setResultForm({...resultForm, value: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Or enter custom value..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={resultForm.unit}
                  onChange={(e) => setResultForm({...resultForm, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a unit...</option>
                  {getUnitsForTestType(tests.find(t => t.id === selectedTestId)?.type || 'GENERAL').map((unit, index) => (
                    <option key={index} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={resultForm.unit}
                  onChange={(e) => setResultForm({...resultForm, unit: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Or enter custom unit..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={resultForm.status}
                  onChange={(e) => setResultForm({...resultForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={resultForm.complianceFlag}
                    onChange={(e) => setResultForm({...resultForm, complianceFlag: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Compliance Flag</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResultForm(false)
                    setSelectedTestId(null)
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SampleDetails
