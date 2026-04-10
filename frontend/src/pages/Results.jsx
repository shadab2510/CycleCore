import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSamples } from '../store/samplesSlice'
import { fetchTests } from '../store/testsSlice'
import { fetchResults } from '../store/resultsSlice'

const Results = () => {
  const { items: samples } = useSelector(state => state.samples)
  const { items: tests } = useSelector(state => state.tests)
  const { items: results } = useSelector(state => state.results)
  const dispatch = useDispatch()
  const [allResults, setAllResults] = useState([])

  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchSamples())
    dispatch(fetchTests())
    dispatch(fetchResults())
  }, [dispatch])

  useEffect(() => {
    // Combine results with test and sample information
    const resultsWithDetails = results.map(result => {
      const test = tests.find(t => t.id === result.testId)
      const sample = test ? samples.find(s => s.id === test.sampleId) : null
      
      return {
        ...result,
        testName: test ? test.name : 'Unknown Test',
        testType: test ? test.type : 'Unknown',
        testMethod: test ? test.method : 'Unknown',
        sampleName: sample ? sample.name : 'Unknown Sample',
        sampleType: sample ? sample.type : 'Unknown',
        sampleStatus: sample ? sample.status : 'Unknown'
      }
    })
    setAllResults(resultsWithDetails)
  }, [results, tests, samples])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Result Management</h2>
        <div className="text-sm text-gray-500">
          Total Results: {allResults.length}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Test Results</h3>
        </div>
        
        {allResults.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No results found. Add test results to samples to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.testName}</div>
                        <div className="text-sm text-gray-500">{result.testType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.value}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{result.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.complianceFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.complianceFlag ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.sampleName}</div>
                        <div className="text-sm text-gray-500">{result.sampleType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.createdAt).toLocaleDateString()}
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

export default Results
