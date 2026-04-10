import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTrials, createTrial, setCurrentTrial, fetchTrialSites, fetchTrialPatients } from '../store/clinicalTrialsSlice'
import { CLINICAL_TRIAL_PHASES, TRIAL_STATUS_COLORS } from '../utils/clinicalTrials'

const ClinicalTrials = () => {
  const dispatch = useDispatch()
  const { trials, currentTrial, trialSites, trialPatients, loading, error, stats } = useSelector(state => state.clinicalTrials)
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTrial, setSelectedTrial] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [trialForm, setTrialForm] = useState({
    name: '',
    protocolNumber: '',
    phase: CLINICAL_TRIAL_PHASES.SCREENING,
    sponsor: '',
    principalInvestigator: '',
    therapeuticArea: '',
    indication: '',
    targetEnrollment: 0,
    startDate: '',
    estimatedEndDate: '',
    sites: [],
    status: 'Planning',
    description: '',
    inclusionCriteria: '',
    exclusionCriteria: '',
    primaryEndpoint: '',
    secondaryEndpoints: '',
    regulatoryApproval: 'FDA',
    budget: 0,
    currency: 'USD'
  })

  useEffect(() => {
    dispatch(fetchTrials())
  }, [dispatch])

  useEffect(() => {
    if (selectedTrial) {
      dispatch(setCurrentTrial(selectedTrial))
      dispatch(fetchTrialSites(selectedTrial.id))
      dispatch(fetchTrialPatients(selectedTrial.id))
    }
  }, [selectedTrial, dispatch])

  const handleCreateTrial = async (e) => {
    e.preventDefault()
    
    const trialData = {
      ...trialForm,
      id: `TRL-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentEnrollment: 0,
      completionRate: 0,
      riskScore: Math.floor(Math.random() * 100),
      complianceScore: 95 + Math.floor(Math.random() * 5)
    }

    await dispatch(createTrial(trialData))
    setShowCreateForm(false)
    setTrialForm({
      name: '',
      protocolNumber: '',
      phase: CLINICAL_TRIAL_PHASES.SCREENING,
      sponsor: '',
      principalInvestigator: '',
      therapeuticArea: '',
      indication: '',
      targetEnrollment: 0,
      startDate: '',
      estimatedEndDate: '',
      sites: [],
      status: 'Planning',
      description: '',
      inclusionCriteria: '',
      exclusionCriteria: '',
      primaryEndpoint: '',
      secondaryEndpoints: '',
      regulatoryApproval: 'FDA',
      budget: 0,
      currency: 'USD'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-gray-100 text-gray-800',
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Suspended': 'bg-yellow-100 text-yellow-800',
      'Terminated': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPhaseColor = (phase) => {
    return TRIAL_STATUS_COLORS[phase] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading clinical trials...</div>
      </div>
    )
  }

  if (selectedTrial) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedTrial.name}</h2>
            <p className="text-gray-500">Protocol: {selectedTrial.protocolNumber}</p>
          </div>
          <button
            onClick={() => setSelectedTrial(null)}
            className="btn btn-secondary"
          >
            Back to Trials
          </button>
        </div>

        {/* Trial Overview */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedTrial.currentEnrollment}</div>
              <div className="text-sm text-gray-500">Current Enrollment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedTrial.targetEnrollment}</div>
              <div className="text-sm text-gray-500">Target Enrollment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{trialSites.length}</div>
              <div className="text-sm text-gray-500">Active Sites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedTrial.complianceScore}%</div>
              <div className="text-sm text-gray-500">Compliance Score</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'sites', 'patients', 'samples', 'compliance', 'analytics'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Trial Information</h3>
                    <div className="mt-2 space-y-2">
                      <div><span className="font-medium">Phase:</span> {selectedTrial.phase}</div>
                      <div><span className="font-medium">Sponsor:</span> {selectedTrial.sponsor}</div>
                      <div><span className="font-medium">PI:</span> {selectedTrial.principalInvestigator}</div>
                      <div><span className="font-medium">Therapeutic Area:</span> {selectedTrial.therapeuticArea}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Timeline</h3>
                    <div className="mt-2 space-y-2">
                      <div><span className="font-medium">Start Date:</span> {selectedTrial.startDate}</div>
                      <div><span className="font-medium">Est. End:</span> {selectedTrial.estimatedEndDate}</div>
                      <div><span className="font-medium">Duration:</span> {selectedTrial.duration || 'Ongoing'}</div>
                      <div><span className="font-medium">Budget:</span> ${selectedTrial.budget.toLocaleString()} {selectedTrial.currency}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">Study Description</h3>
                  <p className="mt-2 text-gray-600">{selectedTrial.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Inclusion Criteria</h3>
                    <p className="mt-2 text-gray-600 text-sm">{selectedTrial.inclusionCriteria}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Exclusion Criteria</h3>
                    <p className="mt-2 text-gray-600 text-sm">{selectedTrial.exclusionCriteria}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sites' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Trial Sites ({trialSites.length})</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trialSites.map(site => (
                        <tr key={site.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.principalInvestigator}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.currentEnrollment}/{site.targetEnrollment}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(site.status)}`}>
                              {site.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Enrolled Patients ({trialPatients.length})</h3>
                <div className="grid grid-cols-3 gap-4">
                  {trialPatients.map(patient => (
                    <div key={patient.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-medium text-gray-900">{patient.id}</div>
                      <div className="text-sm text-gray-500">Age: {patient.age} | Gender: {patient.gender}</div>
                      <div className="text-sm text-gray-500">Enrolled: {patient.enrollmentDate}</div>
                      <div className="text-sm text-gray-500">Visits: {patient.completedVisits}/{patient.totalVisits}</div>
                      <div className="mt-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'samples' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Clinical Samples</h3>
                <div className="text-center py-8 text-gray-500">
                  Sample management interface would be displayed here
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Regulatory Compliance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">FDA Compliance</h4>
                    <div className="mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">21 CFR Part 11:</span>
                        <span className="text-sm font-medium text-green-600">Compliant</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">GCP Guidelines:</span>
                        <span className="text-sm font-medium text-green-600">Compliant</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">IRB Approval:</span>
                        <span className="text-sm font-medium text-green-600">Current</span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Data Quality</h4>
                    <div className="mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Data Completeness:</span>
                        <span className="text-sm font-medium text-green-600">98.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Query Resolution:</span>
                        <span className="text-sm font-medium text-yellow-600">24 pending</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">SDV Completion:</span>
                        <span className="text-sm font-medium text-green-600">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Trial Analytics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Enrollment Progress</h4>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(selectedTrial.currentEnrollment / selectedTrial.targetEnrollment) * 100}%`}}></div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedTrial.currentEnrollment} / {selectedTrial.targetEnrollment} enrolled
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                    <div className="mt-2">
                      <div className="text-lg font-bold text-orange-600">Medium Risk</div>
                      <div className="text-sm text-gray-500">Risk Score: {selectedTrial.riskScore}/100</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinical Trials Management</h2>
          <p className="text-gray-500">J&J Janssen-inspired clinical trial operations</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          Create New Trial
        </button>
      </div>

      {/* Trial Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{stats.totalTrials}</div>
          <div className="text-sm text-gray-500">Total Trials</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.activeTrials}</div>
          <div className="text-sm text-gray-500">Active Trials</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
          <div className="text-sm text-gray-500">Total Patients</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.complianceRate}%</div>
          <div className="text-sm text-gray-500">Avg Compliance</div>
        </div>
      </div>

      {/* Create Trial Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Clinical Trial</h3>
            <form onSubmit={handleCreateTrial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trial Name</label>
                  <input
                    type="text"
                    required
                    value={trialForm.name}
                    onChange={(e) => setTrialForm({...trialForm, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protocol Number</label>
                  <input
                    type="text"
                    required
                    value={trialForm.protocolNumber}
                    onChange={(e) => setTrialForm({...trialForm, protocolNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phase</label>
                  <select
                    value={trialForm.phase}
                    onChange={(e) => setTrialForm({...trialForm, phase: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {Object.values(CLINICAL_TRIAL_PHASES).map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                  <input
                    type="text"
                    required
                    value={trialForm.sponsor}
                    onChange={(e) => setTrialForm({...trialForm, sponsor: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Principal Investigator</label>
                  <input
                    type="text"
                    required
                    value={trialForm.principalInvestigator}
                    onChange={(e) => setTrialForm({...trialForm, principalInvestigator: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Enrollment</label>
                  <input
                    type="number"
                    required
                    value={trialForm.targetEnrollment}
                    onChange={(e) => setTrialForm({...trialForm, targetEnrollment: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={trialForm.startDate}
                    onChange={(e) => setTrialForm({...trialForm, startDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated End Date</label>
                  <input
                    type="date"
                    required
                    value={trialForm.estimatedEndDate}
                    onChange={(e) => setTrialForm({...trialForm, estimatedEndDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trials List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trials.map(trial => (
              <tr key={trial.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{trial.name}</div>
                  <div className="text-sm text-gray-500">{trial.sponsor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trial.protocolNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPhaseColor(trial.phase)}`}>
                    {trial.phase}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trial.currentEnrollment} / {trial.targetEnrollment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trial.status)}`}>
                    {trial.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-green-600">{trial.complianceScore}%</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedTrial(trial)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClinicalTrials
