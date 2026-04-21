// Tab permissions configuration
// This allows specific users to have custom tab access regardless of their role

export const TAB_PERMISSIONS = {
  // Define which roles can access which tabs
  roleBased: {
    dashboard: ['admin', 'lab_technician', 'manager', 'viewer'],
    samples: ['admin', 'lab_technician', 'manager'],
    tests: ['admin', 'lab_technician', 'manager', 'viewer'],
    results: ['admin', 'lab_technician', 'manager', 'viewer'],
    complaints: ['admin', 'lab_technician', 'manager'],
    complaintsAnalytics: ['admin', 'manager'],
    userManagement: ['admin'],
    clinicalTrials: ['admin', 'manager'],
    clinicalSample: ['admin', 'lab_technician', 'manager']
  },

  // User-specific overrides - loaded from MongoDB via API
  userSpecific: {}
}

// Store for dynamic user permissions from MongoDB
let dynamicUserPermissions = {}

// Function to update user-specific permissions from API
export const updateUserPermissions = (permissions) => {
  dynamicUserPermissions = Object.fromEntries(
    Object.entries(permissions.users || {}).map(([key, user]) => [
      user.username,
      user.allowedTabs
    ])
  )
  
  // Store in session storage as fallback when API fails
  try {
    sessionStorage.setItem('cyclecorelims_permissions_fallback', JSON.stringify(dynamicUserPermissions))
  } catch (error) {
    console.warn('Failed to store fallback permissions:', error)
  }
}

// Load fallback permissions from session storage
export const loadFallbackPermissions = () => {
  try {
    const fallback = sessionStorage.getItem('cyclecorelims_permissions_fallback')
    if (fallback && Object.keys(dynamicUserPermissions).length === 0) {
      dynamicUserPermissions = JSON.parse(fallback)
      console.log('Loaded fallback permissions:', dynamicUserPermissions)
      return true
    }
  } catch (error) {
    console.warn('Failed to load fallback permissions:', error)
  }
  return false
}

// Get current user-specific permissions
export const getUserSpecificPermissions = () => {
  return dynamicUserPermissions
}

// Helper function to check if user has access to a specific tab
export const hasTabAccess = (user, tabKey) => {
  if (!user) return false
  
  console.log(`Checking access for user: ${user.username}, tab: ${tabKey}`)
  console.log('Available permissions:', Object.keys(dynamicUserPermissions))
  console.log('Has specific permissions:', dynamicUserPermissions[user.username])
  
  // Check if user has specific permissions configured from MongoDB
  if (dynamicUserPermissions[user.username]) {
    const hasAccess = dynamicUserPermissions[user.username].includes(tabKey)
    console.log(`User ${user.username} has specific access to ${tabKey}: ${hasAccess}`)
    return hasAccess
  }
  
  // Fall back to role-based permissions only if no specific permissions exist
  const allowedRoles = TAB_PERMISSIONS.roleBased[tabKey]
  const hasRoleAccess = allowedRoles && allowedRoles.includes(user.role)
  console.log(`User ${user.username} falling back to role-based access for ${tabKey}: ${hasRoleAccess}`)
  return hasRoleAccess
}

// Helper function to get all accessible tabs for a user
export const getAccessibleTabs = (user) => {
  if (!user) return []
  
  // If user has specific permissions from MongoDB, return only those
  if (dynamicUserPermissions[user.username]) {
    return dynamicUserPermissions[user.username]
  }
  
  // Otherwise return all tabs based on role
  return Object.keys(TAB_PERMISSIONS.roleBased).filter(tabKey => 
    TAB_PERMISSIONS.roleBased[tabKey].includes(user.role)
  )
}

// Tab configuration for navigation
export const TAB_CONFIG = {
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  samples: {
    path: '/samples',
    label: 'Samples',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  tests: {
    path: '/tests',
    label: 'Tests',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  results: {
    path: '/results',
    label: 'Results',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  complaints: {
    path: '/complaints',
    label: 'Complaints',
    icon: 'M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7l-4-4H8a2 2 0 00-2 2v14a2 2 0 002 2z'
  },
  complaintsAnalytics: {
    path: '/complaints-analytics',
    label: 'Complaints Dashboard',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  userManagement: {
    path: '/users',
    label: 'User Management',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  clinicalTrials: {
    path: '/clinical-trials',
    label: 'Clinical Trials',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  clinicalSample: {
    path: '/clinical-sample',
    label: 'Clinical Sample',
    icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
  }
}

// Available tab keys for reference in permission management
export const AVAILABLE_TABS = {
  dashboard: 'Dashboard',
  samples: 'Samples', 
  tests: 'Tests',
  results: 'Results',
  complaints: 'Complaints',
  complaintsAnalytics: 'Complaints Dashboard',
  userManagement: 'User Management',
  clinicalTrials: 'Clinical Trials',
  clinicalSample: 'Clinical Sample'
}
