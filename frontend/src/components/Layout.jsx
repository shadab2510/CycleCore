import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserCard, setShowUserCard] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const userMenuRef = useRef(null)

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserCard(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ease-in-out`}>
        {/* Header with Logo */}
        <div className="p-4">
          <div className="flex flex-col items-center">
            {!sidebarCollapsed ? (
              <>
                <img 
                  src="/assets/cyclecore-logo.png" 
                  alt="CycleCoreLIMS Logo" 
                  className="h-24 w-auto mb-3"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextElementSibling.style.display = 'block'
                  }}
                />
                <div style={{display: 'none'}}>
                  <h1 className="text-lg font-bold text-gray-900">CycleCoreLIMS</h1>
                </div>
                <p className="text-xs text-gray-500 text-center">Laboratory Information Management</p>
              </>
            ) : (
              <>
                <img 
                  src="/assets/cyclecore-logo.png" 
                  alt="CycleCoreLIMS Logo" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextElementSibling.style.display = 'block'
                  }}
                />
                <div style={{display: 'none'}}>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">CC</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Collapse/Expand Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className={`${sidebarCollapsed ? 'px-2' : 'px-4'} mt-4`}>
          <Link to="/dashboard" className={`sidebar-item ${getActiveClass('/dashboard')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>
          
          {(user?.role === 'admin' || user?.role === 'lab_technician' || user?.role === 'manager') && (
            <Link to="/samples" className={`sidebar-item ${getActiveClass('/samples')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!sidebarCollapsed && <span>Samples</span>}
            </Link>
          )}
          
          <Link to="/tests" className={`sidebar-item ${getActiveClass('/tests')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {!sidebarCollapsed && <span>Tests</span>}
          </Link>
          
          <Link to="/results" className={`sidebar-item ${getActiveClass('/results')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {!sidebarCollapsed && <span>Results</span>}
          </Link>

          {(user?.role === 'admin' || user?.role === 'lab_technician' || user?.role === 'manager') && (
            <Link to="/complaints" className={`sidebar-item ${getActiveClass('/complaints')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7l-4-4H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {!sidebarCollapsed && <span>Complaints</span>}
            </Link>
          )}
          
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Link to="/users" className={`sidebar-item ${getActiveClass('/users')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {!sidebarCollapsed && <span>User Management</span>}
            </Link>
          )}
          
          <Link to="/clinical-trials" className={`sidebar-item ${getActiveClass('/clinical-trials')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!sidebarCollapsed && <span>Clinical Trials</span>}
          </Link>
          
          <Link to="/clinical-sample" className={`sidebar-item ${getActiveClass('/clinical-sample')} ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {!sidebarCollapsed && <span>Clinical Sample</span>}
          </Link>
        </nav>

      </aside>

      <main className="flex-1">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/samples' && 'Sample Management'}
              {location.pathname.startsWith('/samples/') && 'Sample Details'}
              {location.pathname === '/users' && 'User Management'}
              {location.pathname === '/clinical-trials' && 'Clinical Trials Management'}
              {location.pathname === '/clinical-sample' && 'Clinical Sample Creation'}
              {location.pathname === '/tests' && 'Test Management'}
              {location.pathname === '/results' && 'Result Management'}
              {location.pathname === '/complaints' && 'Complaint Investigation Workflow'}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserCard((prev) => !prev)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Open user menu"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {user?.firstName || user?.username}
                    </p>
                    <p className="text-xs text-gray-500 capitalize leading-tight">{user?.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserCard && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">@{user?.username}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Role:</span> <span className="capitalize">{user?.role}</span></p>
                      <p><span className="font-medium">Email:</span> {user?.email || 'N/A'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
