// API Configuration for different environments
export const API_CONFIG = {
  // Development environment
  development: {
    baseUrl: 'http://localhost:3001',
    useProxy: true
  },
  
  // Production environment (Vercel)
  production: {
    baseUrl: 'https://cycle-core.vercel.app', // This should be your backend URL
    useProxy: false
  },
  
  // Staging environment (if needed)
  staging: {
    baseUrl: 'https://staging-backend.yourdomain.com',
    useProxy: false
  }
}

// Get current environment configuration
export const getCurrentApiConfig = () => {
  const hostname = window.location.hostname
  
  // Check if we're in development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIG.development
  }
  
  // Check if we're in production (Vercel)
  if (hostname.includes('vercel.app')) {
    return API_CONFIG.production
  }
  
  // Default to production for safety
  return API_CONFIG.production
}

// Get the correct API base URL for current environment
export const getApiBaseUrl = () => {
  const config = getCurrentApiConfig()
  return config.baseUrl
}

// Check if we should use proxy (only in development)
export const shouldUseProxy = () => {
  const config = getCurrentApiConfig()
  return config.useProxy
}
