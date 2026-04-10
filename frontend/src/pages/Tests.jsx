import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSamples } from '../store/samplesSlice'
import { fetchTests } from '../store/testsSlice'

const Tests = () => {
  const { items: samples } = useSelector(state => state.samples)
  const { items: tests } = useSelector(state => state.tests)
  const dispatch = useDispatch()
  const [allTests, setAllTests] = useState([])

  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchSamples())
    dispatch(fetchTests())
  }, [dispatch])

  useEffect(() => {
    // Combine tests with sample information
    const testsWithSampleInfo = tests.map(test => {
      const sample = samples.find(s => s.id === test.sampleId)
      return {
        ...test,
        sampleName: sample ? sample.name : 'Unknown Sample',
        sampleType: sample ? sample.type : 'Unknown',
        sampleStatus: sample ? sample.status : 'Unknown'
      }
    })
    setAllTests(testsWithSampleInfo)
  }, [tests, samples])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Test Management</h2>
        <div className="text-sm text-gray-500">
          Total Tests: {allTests.length}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Tests</h3>
        </div>
        
        {allTests.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No tests found. Create samples and add tests to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allTests.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{test.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{test.method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{test.sampleName}</div>
                        <div className="text-sm text-gray-500">{test.sampleType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        test.sampleStatus === 'Design' ? 'bg-blue-100 text-blue-800' :
                        test.sampleStatus === 'Validation' ? 'bg-yellow-100 text-yellow-800' :
                        test.sampleStatus === 'Approval' ? 'bg-orange-100 text-orange-800' :
                        test.sampleStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.sampleStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tests
