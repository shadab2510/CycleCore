import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { hasTabAccess, TAB_CONFIG } from '../utils/tabPermissions'

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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} h-screen bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}>
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
                <p className="text-xs text-gray-500 text-center">Laboratory Information and Complaint Management</p>
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
        <nav className={`${sidebarCollapsed ? 'px-2' : 'px-4'} mt-4 pb-4 overflow-y-auto`}>
          {Object.entries(TAB_CONFIG).map(([tabKey, tab]) => {
            const hasAccess = hasTabAccess(user, tabKey)
            console.log(`Layout: Tab ${tabKey} (${tab.label}) access for ${user?.username}: ${hasAccess}`)
            if (!hasAccess) return null
            
            return (
              <Link 
                key={tabKey}
                to={tab.path} 
                className={`sidebar-item ${getActiveClass(tab.path)} ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <svg className="w-5 h-5" style={{marginRight: sidebarCollapsed ? '0' : '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </Link>
            )
          })}
        </nav>

      </aside>

      <main className="flex-1 h-screen flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 shrink-0">
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
              {location.pathname === '/complaints-analytics' && 'Complaints Analytics'}
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
        
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
