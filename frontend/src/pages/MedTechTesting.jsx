import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const MedTechTesting = () => {
  const [devices, setDevices] = useState([])
  const [sterilityTests, setSterilityTests] = useState([])
  const [environmentalData, setEnvironmentalData] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [activeTab, setActiveTab] = useState('devices')
  
  const [deviceForm, setDeviceForm] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'Surgical Robot',
    manufacturer: '',
    model: '',
    serialNumber: '',
    firmwareVersion: '',
    sterilizationMethod: 'Autoclave',
    lastSterilization: '',
    nextSterilizationDue: '',
    location: '',
    status: 'Active',
    bioburdenTest: 'Pending',
    endotoxinTest: 'Pending',
    functionalTest: 'Pending'
  })

  const [sterilityForm, setSterilityForm] = useState({
    sampleId: '',
    testType: 'Bioburden',
    method: 'Membrane Filtration',
    media: 'TSA',
    incubationTemp: '35°C',
    incubationTime: '72 hours',
    result: 'Pending',
    cfuCount: 0,
    acceptanceCriteria: '< 100 CFU',
    performedBy: '',
    performedDate: '',
    reviewedBy: '',
    reviewedDate: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    setDevices([
      {
        id: 'JNJ-DA-VINCI-001',
        name: 'Da Vinci Surgical System Xi',
        type: 'Surgical Robot',
        manufacturer: 'Intuitive Surgical',
        model: 'Xi',
        serialNumber: 'DVX-2024-001',
        firmwareVersion: 'v3.2.1',
        lastSterilization: '2024-01-15',
        nextSterilizationDue: '2024-01-22',
        location: 'OR Suite 1',
        status: 'Active',
        bioburdenTest: 'Pass',
        endotoxinTest: 'Pass',
        functionalTest: 'Pass',
        totalProcedures: 1247,
        lastMaintenance: '2024-01-10'
      },
      {
        id: 'JNJ-ARTHRO-002',
        name: 'Arthrex Surgical Scope',
        type: 'Endoscopic System',
        manufacturer: 'Arthrex',
        model: 'HD 1080p',
        serialNumber: 'ARS-2024-002',
        firmwareVersion: 'v2.1.0',
        lastSterilization: '2024-01-16',
        nextSterilizationDue: '2024-01-23',
        location: 'OR Suite 2',
        status: 'Active',
        bioburdenTest: 'Pass',
        endotoxinTest: 'Pass',
        functionalTest: 'Pass',
        totalProcedures: 892,
        lastMaintenance: '2024-01-12'
      }
    ])

    setSterilityTests([
      {
        id: 'ST-001',
        deviceId: 'JNJ-DA-VINCI-001',
        testType: 'Bioburden',
        result: 'Pass',
        cfuCount: 15,
        acceptanceCriteria: '< 100 CFU',
        performedDate: '2024-01-15',
        performedBy: 'Lab Tech 1',
        reviewedBy: 'QA Manager',
        status: 'Completed'
      },
      {
        id: 'ST-002',
        deviceId: 'JNJ-ARTHRO-002',
        testType: 'Endotoxin',
        result: 'Pass',
        euPerMl: 0.05,
        acceptanceCriteria: '< 0.5 EU/mL',
        performedDate: '2024-01-16',
        performedBy: 'Lab Tech 2',
        reviewedBy: 'QA Manager',
        status: 'Completed'
      }
    ])

    setEnvironmentalData([
      {
        id: 'ENV-001',
        location: 'OR Suite 1',
        date: '2024-01-15',
        particleCount: '3500 particles/m³',
        viableCount: '12 CFU/m³',
        temperature: '22°C',
        humidity: '45%',
        status: 'Pass'
      },
      {
        id: 'ENV-002',
        location: 'Clean Room A',
        date: '2024-01-15',
        particleCount: '1200 particles/m³',
        viableCount: '3 CFU/m³',
        temperature: '20°C',
        humidity: '40%',
        status: 'Pass'
      }
    ])
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'In Maintenance': 'bg-yellow-100 text-yellow-800',
      'Retired': 'bg-red-100 text-red-800',
      'Pass': 'bg-green-100 text-green-800',
      'Fail': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleCreateDevice = (e) => {
    e.preventDefault()
    const newDevice = {
      id: deviceForm.deviceId,
      ...deviceForm,
      createdAt: new Date().toISOString(),
      totalProcedures: 0,
      lastMaintenance: new Date().toISOString().split('T')[0]
    }
    setDevices([...devices, newDevice])
    setDeviceForm({
      deviceId: '',
      deviceName: '',
      deviceType: 'Surgical Robot',
      manufacturer: '',
      model: '',
      serialNumber: '',
      firmwareVersion: '',
      sterilizationMethod: 'Autoclave',
      lastSterilization: '',
      nextSterilizationDue: '',
      location: '',
      status: 'Active',
      bioburdenTest: 'Pending',
      endotoxinTest: 'Pending',
      functionalTest: 'Pending'
    })
  }

  const handleCreateSterilityTest = (e) => {
    e.preventDefault()
    const newTest = {
      id: `ST-${Date.now().toString(36).toUpperCase()}`,
      ...sterilityForm,
      status: 'Pending'
    }
    setSterilityTests([...sterilityTests, newTest])
    setSterilityForm({
      sampleId: '',
      testType: 'Bioburden',
      method: 'Membrane Filtration',
      media: 'TSA',
      incubationTemp: '35°C',
      incubationTime: '72 hours',
      result: 'Pending',
      cfuCount: 0,
      acceptanceCriteria: '< 100 CFU',
      performedBy: '',
      performedDate: '',
      reviewedBy: '',
      reviewedDate: ''
    })
  }

  if (selectedDevice) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedDevice.name}</h2>
            <p className="text-gray-500">Device ID: {selectedDevice.id}</p>
          </div>
          <button
            onClick={() => setSelectedDevice(null)}
            className="btn btn-secondary"
          >
            Back to Devices
          </button>
        </div>

        {/* Device Overview */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedDevice.totalProcedures}</div>
              <div className="text-sm text-gray-500">Total Procedures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedDevice.bioburdenTest}</div>
              <div className="text-sm text-gray-500">Bioburden Test</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedDevice.endotoxinTest}</div>
              <div className="text-sm text-gray-500">Endotoxin Test</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedDevice.functionalTest}</div>
              <div className="text-sm text-gray-500">Functional Test</div>
            </div>
          </div>

          {/* Device Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Device Information</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Type:</span> {selectedDevice.type}</div>
                <div><span className="font-medium">Manufacturer:</span> {selectedDevice.manufacturer}</div>
                <div><span className="font-medium">Model:</span> {selectedDevice.model}</div>
                <div><span className="font-medium">Serial Number:</span> {selectedDevice.serialNumber}</div>
                <div><span className="font-medium">Firmware:</span> {selectedDevice.firmwareVersion}</div>
                <div><span className="font-medium">Location:</span> {selectedDevice.location}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedDevice.status)}`}>
                    {selectedDevice.status}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Sterilization Schedule</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Method:</span> {selectedDevice.sterilizationMethod}</div>
                <div><span className="font-medium">Last Sterilization:</span> {selectedDevice.lastSterilization}</div>
                <div><span className="font-medium">Next Due:</span> {selectedDevice.nextSterilizationDue}</div>
                <div><span className="font-medium">Last Maintenance:</span> {selectedDevice.lastMaintenance}</div>
              </div>
            </div>
          </div>

          {/* Sterility Test History */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sterility Test History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sterilityTests.filter(test => test.deviceId === selectedDevice.id).map(test => (
                    <tr key={test.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.testType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.result)}`}>
                          {test.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.performedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.performedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">MedTech Device Testing</h2>
          <p className="text-gray-500">J&J MedTech-inspired device validation and sterility assurance</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{devices.length}</div>
          <div className="text-sm text-gray-500">Total Devices</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'Active').length}</div>
          <div className="text-sm text-gray-500">Active Devices</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{sterilityTests.filter(t => t.result === 'Pass').length}</div>
          <div className="text-sm text-gray-500">Passed Tests</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{environmentalData.filter(e => e.status === 'Pass').length}</div>
          <div className="text-sm text-gray-500">Environmental Pass</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {['devices', 'sterility', 'environmental'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
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

        <div className="p-6">
          {activeTab === 'devices' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Medical Devices</h3>
                <button
                  onClick={() => setShowDeviceForm(true)}
                  className="btn btn-primary"
                >
                  Add Device
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Sterilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map(device => (
                      <tr key={device.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500">{device.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.nextSterilizationDue}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(device.status)}`}>
                            {device.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedDevice(device)}
                            className="text-blue-600 hover:text-blue-900"
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
          )}

          {activeTab === 'sterility' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sterility Assurance Tests</h3>
                <button
                  onClick={() => setShowSterilityForm(true)}
                  className="btn btn-primary"
                >
                  Create Test
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sterilityTests.map(test => (
                      <tr key={test.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.deviceId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.testType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.result)}`}>
                            {test.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.performedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'environmental' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Monitoring</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particle Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viable Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {environmentalData.map(reading => (
                      <tr key={reading.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reading.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.particleCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.viableCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.temperature}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.humidity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reading.status)}`}>
                            {reading.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedTechTesting
