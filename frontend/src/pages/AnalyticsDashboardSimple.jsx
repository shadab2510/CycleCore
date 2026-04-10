import React, { useState, useEffect } from 'react'

const AnalyticsDashboardSimple = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [activeModule, setActiveModule] = useState('overview')
  const [aiPredictions, setAiPredictions] = useState([])
  const [riskAssessments, setRiskAssessments] = useState([])
  const [anomalies, setAnomalies] = useState([])

  // Mock data for demonstration
  const [trialProgressData, setTrialProgressData] = useState([
    { month: 'Jan', enrolled: 45, target: 50, completed: 42 },
    { month: 'Feb', enrolled: 52, target: 50, completed: 48 },
    { month: 'Mar', enrolled: 58, target: 60, completed: 55 },
    { month: 'Apr', enrolled: 72, target: 70, completed: 68 },
    { month: 'May', enrolled: 85, target: 80, completed: 78 },
    { month: 'Jun', enrolled: 92, target: 90, completed: 85 }
  ])

  const [complianceData, setComplianceData] = useState([
    { category: 'FDA 21 CFR Part 11', score: 98, trend: 'up' },
    { category: 'GCP Guidelines', score: 95, trend: 'stable' },
    { category: 'IRB Compliance', score: 100, trend: 'up' },
    { category: 'Data Integrity', score: 92, trend: 'down' },
    { category: 'Safety Reporting', score: 96, trend: 'up' }
  ])

  const [devicePerformanceData, setDevicePerformanceData] = useState([
    { device: 'Da Vinci Xi', uptime: 99.2, procedures: 1247, errors: 3, maintenance: 2 },
    { device: 'Arthrex Scope', uptime: 98.8, procedures: 892, errors: 5, maintenance: 3 },
    { device: 'Stryker Mako', uptime: 99.5, procedures: 623, errors: 2, maintenance: 1 },
    { device: 'Medtronic Robot', uptime: 97.9, procedures: 445, errors: 7, maintenance: 4 }
  ])

  useEffect(() => {
    // Mock AI predictions
    setAiPredictions([
      {
        id: 1,
        type: 'Enrollment Forecast',
        prediction: 'Trial will reach 95% enrollment by end of Q3',
        confidence: 87,
        impact: 'High',
        timeframe: '3 months',
        recommendedAction: 'Increase recruitment sites by 15%'
      },
      {
        id: 2,
        type: 'Risk Assessment',
        prediction: 'High probability of data quality issues at Site 003',
        confidence: 92,
        impact: 'Critical',
        timeframe: '1 month',
        recommendedAction: 'Conduct on-site monitoring audit'
      },
      {
        id: 3,
        type: 'Device Maintenance',
        prediction: 'Da Vinci Xi requires preventive maintenance within 2 weeks',
        confidence: 94,
        impact: 'Medium',
        timeframe: '2 weeks',
        recommendedAction: 'Schedule maintenance during low usage period'
      }
    ])

    setRiskAssessments([
      {
        trialId: 'TRL-COVID19-2024-001',
        overallRisk: 'Medium',
        riskScore: 65,
        factors: ['Complex protocol', 'Multi-site', 'Remote monitoring'],
        mitigation: ['Increased monitoring frequency', 'Centralized training']
      },
      {
        trialId: 'TRL-ONCOLOGY-2024-002',
        overallRisk: 'High',
        riskScore: 78,
        factors: ['Novel biomarker', 'Limited patient pool', 'Competing trials'],
        mitigation: ['Expand inclusion criteria', 'Additional sites', 'Patient incentives']
      }
    ])

    setAnomalies([
      {
        id: 1,
        type: 'Data Entry',
        description: 'Unusual pattern in vital signs entry at Site 002',
        severity: 'Medium',
        detected: '2024-01-15 14:30',
        status: 'Under Investigation',
        impact: 'Data integrity'
      },
      {
        id: 2,
        type: 'Sample Tracking',
        description: 'Temperature excursion detected for sample batch SMP-1234',
        severity: 'High',
        detected: '2024-01-15 09:15',
        status: 'Resolved',
        impact: 'Sample integrity'
      }
    ])
  }, [])

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getImpactColor = (impact) => {
    const colors = {
      'Critical': 'text-red-600 bg-red-100',
      'High': 'text-orange-600 bg-orange-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'Low': 'text-green-600 bg-green-100'
    }
    return colors[impact] || 'text-gray-600 bg-gray-100'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-500',
      'High': 'bg-orange-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-green-500'
    }
    return colors[severity] || 'bg-gray-500'
  }

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI/ML Analytics Dashboard</h2>
          <p className="text-gray-500">Predictive insights and intelligent analysis powered by machine learning</p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Module Tabs */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {['overview', 'predictions', 'risk', 'anomalies', 'performance'].map(module => (
              <button
                key={module}
                onClick={() => setActiveModule(module)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeModule === module
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {module}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeModule === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="text-3xl font-bold">94.2%</div>
                  <div className="text-blue-100">Overall Compliance</div>
                  <div className="text-sm text-blue-200 mt-2">↑ 2.3% from last month</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="text-3xl font-bold">87%</div>
                  <div className="text-green-100">AI Accuracy</div>
                  <div className="text-sm text-green-200 mt-2">↑ 1.1% from last month</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-purple-100">Active Predictions</div>
                  <div className="text-sm text-purple-200 mt-2">3 high priority</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                  <div className="text-3xl font-bold">98.7%</div>
                  <div className="text-orange-100">Device Uptime</div>
                  <div className="text-sm text-orange-200 mt-2">↑ 0.3% from last month</div>
                </div>
              </div>

              {/* Simple Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Enrollment Progress</h3>
                  <div className="space-y-3">
                    {trialProgressData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{data.month}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${(data.enrolled / data.target) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{data.enrolled}/{data.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Scores</h3>
                  <div className="space-y-3">
                    {complianceData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{data.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getScoreColor(data.score)}`}>{data.score}%</span>
                          {data.trend === 'up' && <span className="text-green-500">↑</span>}
                          {data.trend === 'down' && <span className="text-red-500">↓</span>}
                          {data.trend === 'stable' && <span className="text-gray-500">→</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Device Performance */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {devicePerformanceData.map((device, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{device.device}</h4>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Uptime:</span>
                          <span className="text-sm font-medium text-green-600">{device.uptime}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Procedures:</span>
                          <span className="text-sm font-medium">{device.procedures}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Errors:</span>
                          <span className="text-sm font-medium text-red-600">{device.errors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Maintenance:</span>
                          <span className="text-sm font-medium">{device.maintenance}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeModule === 'predictions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Predictions & Recommendations</h3>
              {aiPredictions.map(prediction => (
                <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{prediction.type}</h4>
                      <p className="text-gray-600 mt-1">{prediction.prediction}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence}% confidence
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(prediction.impact)}`}>
                        {prediction.impact} impact
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Timeframe:</span>
                      <span className="ml-2 text-gray-900">{prediction.timeframe}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Recommended Action:</span>
                      <span className="ml-2 text-gray-900">{prediction.recommendedAction}</span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Implement</button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeModule === 'risk' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessments</h3>
              {riskAssessments.map((assessment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{assessment.trialId}</h4>
                      <div className="flex items-center mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(assessment.overallRisk)}`}>
                          {assessment.overallRisk} Risk
                        </span>
                        <span className="ml-2 text-sm text-gray-500">Score: {assessment.riskScore}/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Risk Factors:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {assessment.factors.map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Mitigation Strategies:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {assessment.mitigation.map((strategy, i) => (
                          <li key={i}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeModule === 'anomalies' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Detected Anomalies</h3>
              {anomalies.map(anomaly => (
                <div key={anomaly.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(anomaly.severity)} mr-3`}></div>
                        <h4 className="font-medium text-gray-900">{anomaly.type}</h4>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{anomaly.description}</p>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Detected:</span>
                          <span className="ml-2 text-gray-900">{anomaly.detected}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Status:</span>
                          <span className="ml-2 text-gray-900">{anomaly.status}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Impact:</span>
                          <span className="ml-2 text-gray-900">{anomaly.impact}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Investigate</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeModule === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Device Performance Analytics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {devicePerformanceData.map((device, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{device.device}</h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Uptime:</span>
                        <span className="text-sm font-medium text-green-600">{device.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Procedures:</span>
                        <span className="text-sm font-medium">{device.procedures}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Errors:</span>
                        <span className="text-sm font-medium text-red-600">{device.errors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Maintenance:</span>
                        <span className="text-sm font-medium">{device.maintenance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboardSimple
