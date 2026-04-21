// Permission Manager Utility
// Helper functions to manage user-specific tab permissions

import { getAccessibleTabs } from './tabPermissions'

/**
 * Add or update a user's tab permissions
 * @param {string} username - The username to configure
 * @param {Array} allowedTabs - Array of tab keys the user can access
 * @param {string} description - Optional description of the user's access level
 */
export const addUserPermission = (username, allowedTabs, description = '') => {
  // This would typically make an API call to update the backend
  // For now, it returns the configuration that should be added to userPermissions.json
  return {
    username,
    allowedTabs,
    description
  }
}

/**
 * Get a summary of what tabs a user can access
 * @param {Object} user - The user object
 * @returns {Object} - Summary of accessible tabs and permissions
 */
export const getUserPermissionSummary = (user) => {
  if (!user) return { error: 'No user provided' }
  
  const accessibleTabs = getAccessibleTabs(user)
  const hasSpecificPermissions = TAB_PERMISSIONS.userSpecific[user.username]
  
  return {
    username: user.username,
    role: user.role,
    hasSpecificPermissions,
    accessibleTabs,
    tabCount: accessibleTabs.length,
    permissionType: hasSpecificPermissions ? 'user-specific' : 'role-based'
  }
}

/**
 * Generate userPermissions.json content for multiple users
 * @param {Array} userConfigs - Array of user permission configurations
 * @returns {Object} - Complete userPermissions.json structure
 */
export const generateUserPermissionsConfig = (userConfigs) => {
  return {
    description: "User-specific tab permissions configuration. This allows overriding role-based permissions for individual users.",
    users: Object.fromEntries(
      userConfigs.map(config => [
        config.username,
        {
          username: config.username,
          allowedTabs: config.allowedTabs,
          description: config.description || `User with access to ${config.allowedTabs.join(', ')}`
        }
      ])
    ),
    instructions: {
      how_to_use: [
        "1. Add a new user entry in the 'users' object",
        "2. Set 'allowedTabs' array with the tab keys they should access", 
        "3. Available tab keys: dashboard, samples, tests, results, complaints, complaintsAnalytics, userManagement, clinicalTrials, clinicalSample",
        "4. Update the tabPermissions.js file to import and use this configuration"
      ]
    }
  }
}

/**
 * Available tab keys for reference
 */
export const AVAILABLE_TABS = {
  dashboard: 'Dashboard',
  samples: 'Samples', 
  tests: 'Tests',
  results: 'Results',
  complaints: 'Complaints',
  complaintsAnalytics: 'Complaints Analytics',
  userManagement: 'User Management',
  clinicalTrials: 'Clinical Trials',
  clinicalSample: 'Clinical Sample'
}

/**
 * Example configurations for common use cases
 */
export const EXAMPLE_CONFIGS = {
  complaintsOnly: {
    username: 'complaints_user',
    allowedTabs: ['complaints', 'complaintsAnalytics'],
    description: 'User with access to only Complaints and Complaints Analytics'
  },
  dashboardAndComplaints: {
    username: 'supervisor_user',
    allowedTabs: ['dashboard', 'complaints', 'complaintsAnalytics'],
    description: 'User with access to Dashboard, Complaints and Complaints Analytics'
  },
  readOnly: {
    username: 'viewer_user',
    allowedTabs: ['dashboard', 'tests', 'results'],
    description: 'Read-only user with access to Dashboard, Tests and Results'
  }
}
