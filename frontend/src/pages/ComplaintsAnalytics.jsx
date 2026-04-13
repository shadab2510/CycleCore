import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchComplaints } from '../store/complaintsSlice'

const ComplaintsAnalytics = () => {
  const dispatch = useDispatch()
  const { items: complaints } = useSelector(state => state.complaints)
  const [users, setUsers] = useState([])

  useEffect(() => {
    dispatch(fetchComplaints())
    fetchUsers()
  }, [dispatch])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cyclecorelims_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const userMap = useMemo(() => {
    const map = {}
    users.forEach(user => {
      map[user._id] = `${user.firstName} ${user.lastName}`
    })
    return map
  }, [users])

  const analytics = useMemo(() => {
    const total = complaints.length
    const byStatus = {}
    const byCreatedBy = {}
    const byApprovalStatus = {}
    const withAttachments = complaints.filter(c => c.attachments && c.attachments.length > 0).length

    complaints.forEach(complaint => {
      // By status
      byStatus[complaint.status] = (byStatus[complaint.status] || 0) + 1

      // By createdBy
      const creator = userMap[complaint.createdBy] || complaint.createdBy || 'Unknown'
      byCreatedBy[creator] = (byCreatedBy[creator] || 0) + 1

      // By approval status
      byApprovalStatus[complaint.approvalStatus] = (byApprovalStatus[complaint.approvalStatus] || 0) + 1
    })

    return {
      total,
      withAttachments,
      byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      byCreatedBy: Object.entries(byCreatedBy)
        .map(([user, count]) => ({ user, count }))
        .sort((a, b) => b.count - a.count),
      byApprovalStatus: Object.entries(byApprovalStatus).map(([status, count]) => ({ status, count }))
    }
  }, [complaints, userMap])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Complaints</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Complaints with Documents</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.withAttachments}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Approved Complaints</h3>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.byApprovalStatus.find(s => s.status === 'Approved')?.count || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.byStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Complaints by Who Raised</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.byCreatedBy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {analytics.byCreatedBy.map((entry, index) => (
                  <Cell key={`user-cell-${entry.user}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.byApprovalStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h3 className="text-lg font-semibold mb-4">User-wise Complaint Details</h3>
        {analytics.byCreatedBy.length === 0 ? (
          <p className="text-sm text-gray-500">No complaint data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Complaints Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {analytics.byCreatedBy.map((row) => (
                  <tr key={row.user}>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.user}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">{row.count}</td>
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

export default ComplaintsAnalytics