import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AVAILABLE_TABS } from '../utils/tabPermissions'
import { testBackendConnection, testProxyConnection } from '../utils/apiTest'
import { getApiBaseUrl, shouldUseProxy } from '../config/apiConfig'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPermissionForm, setShowPermissionForm] = useState(false)
  const [userPermissions, setUserPermissions] = useState({ users: {} })
  const [selectedUser, setSelectedUser] = useState(null)
  const [permissionFormData, setPermissionFormData] = useState({
    username: '',
    allowedTabs: [],
    description: ''
  })
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'lab_technician',
    firstName: '',
    lastName: ''
  })
  
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    fetchUsers()
    fetchUserPermissions()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('cyclecorelims_token')
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token')
      
      // Use environment-aware API URL
      const apiUrl = shouldUseProxy() ? '/api/users' : `${getApiBaseUrl()}/api/users`
      console.log('Using API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Users API response status:', response.status)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        console.log('Response content type:', contentType)
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          console.log('Users data received:', data)
          setUsers(data)
        } else {
          const text = await response.text()
          console.error('Received non-JSON response:', text.substring(0, 200))
          alert('Server returned HTML instead of JSON. Check if backend is running and accessible.')
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch users - Status:', response.status, 'Error:', errorText)
        // Check if error is HTML (like 404 page)
        if (errorText.includes('<!DOCTYPE')) {
          alert(`Backend API not accessible. Got HTML error page instead of API response. Status: ${response.status}`)
        } else {
          alert(`Failed to fetch users: ${response.status} - ${errorText}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      alert(`Failed to fetch users: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cyclecorelims_token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'lab_technician',
          firstName: '',
          lastName: ''
        })
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const fetchUserPermissions = async () => {
    try {
      const token = localStorage.getItem('cyclecorelims_token')
      console.log('Fetching user permissions with token:', token ? 'Token exists' : 'No token')
      
      // Use environment-aware API URL
      const apiUrl = shouldUseProxy() ? '/api/user-permissions' : `${getApiBaseUrl()}/api/user-permissions`
      console.log('Using permissions API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('User permissions API response status:', response.status)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        console.log('User permissions response content type:', contentType)
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          console.log('User permissions data received:', data)
          setUserPermissions(data)
        } else {
          const text = await response.text()
          console.error('Received non-JSON response for permissions:', text.substring(0, 200))
          // Don't show alert for permissions error, just log it
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch user permissions - Status:', response.status, 'Error:', errorText)
        if (errorText.includes('<!DOCTYPE')) {
          console.error('Backend API not accessible for permissions. Got HTML error page.')
        }
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
    }
  }

  const handleCreatePermission = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cyclecorelims_token')}`
        },
        body: JSON.stringify(permissionFormData)
      })
      
      if (response.ok) {
        setShowPermissionForm(false)
        setPermissionFormData({
          username: '',
          allowedTabs: [],
          description: ''
        })
        fetchUserPermissions()
      }
    } catch (error) {
      console.error('Failed to create permission:', error)
    }
  }

  const handleDeletePermission = async (username) => {
    if (!confirm(`Are you sure you want to remove permissions for ${username}?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/user-permissions/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cyclecorelims_token')}`
        }
      })
      
      if (response.ok) {
        fetchUserPermissions()
      }
    } catch (error) {
      console.error('Failed to delete permission:', error)
    }
  }

  const openPermissionForm = (user) => {
    setSelectedUser(user)
    setPermissionFormData({
      username: user.username,
      allowedTabs: userPermissions.users[user.username]?.allowedTabs || [],
      description: userPermissions.users[user.username]?.description || ''
    })
    setShowPermissionForm(true)
  }

  const handleTabToggle = (tabKey) => {
    setPermissionFormData(prev => ({
      ...prev,
      allowedTabs: prev.allowedTabs.includes(tabKey)
        ? prev.allowedTabs.filter(tab => tab !== tabKey)
        : [...prev.allowedTabs, tabKey]
    }))
  }

  const testApiConnections = async () => {
    console.log('=== API Connection Test ===')
    
    // Test direct backend connection
    const directResult = await testBackendConnection()
    console.log('Direct Backend Result:', directResult)
    
    // Test proxy connection
    const proxyResult = await testProxyConnection()
    console.log('Proxy Result:', proxyResult)
    
    // Show results to user
    alert(`API Connection Test Results:\n\nDirect Backend: ${directResult.message}\nProxy: ${proxyResult.message}\n\nCheck console for detailed logs.`)
  }

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-purple-100 text-purple-800',
      'lab_technician': 'bg-blue-100 text-blue-800',
      'manager': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleDisplay = (role) => {
    const displays = {
      'admin': 'Administrator',
      'lab_technician': 'Lab Technician',
      'manager': 'Manager',
      'viewer': 'Viewer'
    }
    return displays[role] || role
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Manage system users and roles</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={testApiConnections}
            className="btn btn-secondary"
          >
            Test API Connection
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Users</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
              <button
                onClick={fetchUsers}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tab Access</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                <tr key={user.id || user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {userPermissions.users[user.username] ? (
                      <div className="flex flex-wrap gap-1">
                        {userPermissions.users[user.username].allowedTabs.map(tab => (
                          <span key={tab} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {AVAILABLE_TABS[tab] || tab}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Role-based</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openPermissionForm(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Manage Access
                    </button>
                    {userPermissions.users[user.username] && (
                      <button
                        onClick={() => handleDeletePermission(user.username)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="lab_technician">Lab Technician</option>
                    <option value="manager">Manager</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionForm && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Manage Tab Access for {selectedUser.firstName && selectedUser.lastName 
                ? `${selectedUser.firstName} ${selectedUser.lastName}`
                : selectedUser.username
              }
            </h3>
            <form onSubmit={handleCreatePermission}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={permissionFormData.username}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Tabs</label>
                  <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(AVAILABLE_TABS).map(([tabKey, tabLabel]) => (
                        <label key={tabKey} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={permissionFormData.allowedTabs.includes(tabKey)}
                            onChange={() => handleTabToggle(tabKey)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{tabLabel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the tabs this user should have access to. If no tabs are selected, the user will use role-based permissions.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    value={permissionFormData.description}
                    onChange={(e) => setPermissionFormData({...permissionFormData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe the user's access level..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <div>
                  {userPermissions.users[selectedUser.username] && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Remove all custom permissions for this user?')) {
                          handleDeletePermission(selectedUser.username)
                          setShowPermissionForm(false)
                        }
                      }}
                      className="btn btn-secondary text-red-600 hover:text-red-800"
                    >
                      Remove Custom Access
                    </button>
                  )}
                </div>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPermissionForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Access
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
