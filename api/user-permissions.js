// Vercel serverless function for /api/user-permissions
const fs = require('fs').promises
const path = require('path')
const jwt = require('jsonwebtoken')

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'cyclecorelims-secret-key-2024'

// Middleware to authenticate token
const authenticateToken = (req) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// Default permissions configuration
const defaultPermissions = {
  description: "User-specific tab permissions configuration",
  users: {},
  instructions: {
    how_to_use: [
      "1. Add a new user entry in the 'users' object",
      "2. Set 'allowedTabs' array with the tab keys they should access", 
      "3. Available tab keys: dashboard, samples, tests, results, complaints, complaintsAnalytics, userManagement, clinicalTrials, clinicalSample"
    ]
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const user = authenticateToken(req)
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Only admins can access user permissions
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const configPath = path.join(process.cwd(), 'frontend/src/config/userPermissions.json')

    if (req.method === 'GET') {
      try {
        // Try to read existing permissions file
        const configData = await fs.readFile(configPath, 'utf8')
        const config = JSON.parse(configData)
        return res.status(200).json(config)
      } catch (error) {
        // If file doesn't exist, return default config
        return res.status(200).json(defaultPermissions)
      }
    }
    
    if (req.method === 'POST') {
      const { username, allowedTabs, description } = req.body
      
      if (!username || !Array.isArray(allowedTabs)) {
        return res.status(400).json({ error: 'Username and allowedTabs array are required' })
      }
      
      try {
        let config
        
        try {
          // Try to read existing config
          const configData = await fs.readFile(configPath, 'utf8')
          config = JSON.parse(configData)
        } catch (error) {
          // Use default config if file doesn't exist
          config = { ...defaultPermissions }
        }
        
        // Update or add user permissions
        config.users[username] = {
          username,
          allowedTabs,
          description: description || `User with access to ${allowedTabs.join(', ')}`
        }
        
        // Ensure the directory exists
        const configDir = path.dirname(configPath)
        await fs.mkdir(configDir, { recursive: true })
        
        // Write updated config
        await fs.writeFile(configPath, JSON.stringify(config, null, 2))
        
        return res.status(200).json({ 
          message: 'User permissions updated successfully', 
          config 
        })
        
      } catch (error) {
        console.error('Failed to save permissions:', error)
        return res.status(500).json({ error: 'Failed to save permissions file' })
      }
    }
    
    if (req.method === 'DELETE') {
      const { username } = req.query
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' })
      }
      
      try {
        let config
        
        try {
          const configData = await fs.readFile(configPath, 'utf8')
          config = JSON.parse(configData)
        } catch (error) {
          return res.status(404).json({ error: 'Permissions configuration not found' })
        }
        
        if (!config.users[username]) {
          return res.status(404).json({ error: 'User permissions not found' })
        }
        
        // Remove user permissions
        delete config.users[username]
        
        // Write updated config
        await fs.writeFile(configPath, JSON.stringify(config, null, 2))
        
        return res.status(200).json({ 
          message: 'User permissions removed successfully' 
        })
        
      } catch (error) {
        console.error('Failed to remove permissions:', error)
        return res.status(500).json({ error: 'Failed to update permissions file' })
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('User permissions API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
