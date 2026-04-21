// API connectivity test utility
export const testBackendConnection = async () => {
  console.log('Testing backend connection...')
  
  try {
    // Get API base URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const apiBaseUrl = isDevelopment ? 'http://localhost:3001' : window.location.origin
    
    console.log('Using API base URL:', apiBaseUrl)
    
    // Test direct connection to backend (only in development)
    if (isDevelopment) {
      const directResponse = await fetch(`${apiBaseUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Direct backend test - Status:', directResponse.status)
      console.log('Direct backend test - Content-Type:', directResponse.headers.get('content-type'))
      
      if (directResponse.ok) {
        const contentType = directResponse.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await directResponse.json()
          console.log('Direct backend test - SUCCESS: Got JSON data')
          return { success: true, message: 'Backend is accessible', data }
        } else {
          const text = await directResponse.text()
          console.log('Direct backend test - Got HTML instead of JSON:', text.substring(0, 200))
          return { success: false, message: 'Backend returned HTML instead of JSON' }
        }
      } else {
        const errorText = await directResponse.text()
        console.log('Direct backend test - ERROR:', directResponse.status, errorText)
        return { success: false, message: `Backend returned error: ${directResponse.status}` }
      }
    } else {
      // In production, skip direct test and return message
      return { success: false, message: 'Direct backend test skipped in production' }
    }
  } catch (error) {
    console.log('Direct backend test - CONNECTION ERROR:', error.message)
    return { success: false, message: `Cannot connect to backend: ${error.message}` }
  }
}

export const testProxyConnection = async () => {
  console.log('Testing proxy connection...')
  
  try {
    // Test through Vite proxy
    const proxyResponse = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Proxy test - Status:', proxyResponse.status)
    console.log('Proxy test - Content-Type:', proxyResponse.headers.get('content-type'))
    
    if (proxyResponse.ok) {
      const contentType = proxyResponse.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await proxyResponse.json()
        console.log('Proxy test - SUCCESS: Got JSON data')
        return { success: true, message: 'Proxy is working', data }
      } else {
        const text = await proxyResponse.text()
        console.log('Proxy test - Got HTML instead of JSON:', text.substring(0, 200))
        return { success: false, message: 'Proxy returned HTML instead of JSON' }
      }
    } else {
      const errorText = await proxyResponse.text()
      console.log('Proxy test - ERROR:', proxyResponse.status, errorText)
      return { success: false, message: `Proxy returned error: ${proxyResponse.status}` }
    }
  } catch (error) {
    console.log('Proxy test - CONNECTION ERROR:', error.message)
    return { success: false, message: `Proxy connection error: ${error.message}` }
  }
}
