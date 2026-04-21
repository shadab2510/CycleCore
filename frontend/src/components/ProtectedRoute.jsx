import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { hasTabAccess } from '../utils/tabPermissions'

const ProtectedRoute = ({ children, requiredRoles = [], requiredTab = null }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check for user-specific tab permissions first
  if (requiredTab && hasTabAccess(user, requiredTab)) {
    return children
  }

  // Fall back to role-based permissions if no tab permissions configured
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
