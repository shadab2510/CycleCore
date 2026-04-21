import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from './store/authSlice'
import { updateUserPermissions } from './utils/tabPermissions'
import { userPermissionsAPI } from './services/api'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Samples from './pages/Samples'
import Tests from './pages/Tests'
import Results from './pages/Results'
import SampleDetails from './pages/SampleDetails'
import ClinicalTrials from './pages/ClinicalTrials'
import ClinicalTrialSample from './pages/ClinicalTrialSample'
import MedTechTesting from './pages/MedTechTesting'
import AnalyticsDashboardSimple from './pages/AnalyticsDashboardSimple'
import UserManagement from './pages/UserManagement'
import Complaints from './pages/Complaints'
import ComplaintsAnalytics from './pages/ComplaintsAnalytics'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token } = useSelector(state => state.auth)

  useEffect(() => {
    // Check for existing token and user on app load
    const storedToken = localStorage.getItem('cyclecorelims_token')
    const storedUser = localStorage.getItem('cyclecorelims_user')
    
    if (storedToken && storedUser && !token) {
      dispatch(setUser(JSON.parse(storedUser)))
    }
  }, [dispatch, token])

  // Fetch user permissions when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchPermissions = async () => {
        try {
          const response = await userPermissionsAPI.getAll()
          console.log('App: User permissions loaded from MongoDB:', response.data)
          updateUserPermissions(response.data)
        } catch (error) {
          console.error('App: Failed to fetch user permissions from MongoDB:', error)
          console.warn('App: No permissions loaded - users will have role-based access only')
          // API failed - users will fall back to role-based permissions only
          // No static fallback since we removed the JSON file
        }
      }
      
      fetchPermissions()
    }
  }, [isAuthenticated, token])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/samples" element={
          <ProtectedRoute requiredRoles={['admin', 'lab_technician', 'manager']}>
            <Samples />
          </ProtectedRoute>
        } />
        <Route path="/samples/:id" element={
          <ProtectedRoute requiredRoles={['admin', 'lab_technician', 'manager']}>
            <SampleDetails />
          </ProtectedRoute>
        } />
        <Route path="/clinical-trials" element={
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <ClinicalTrials />
          </ProtectedRoute>
        } />
        <Route path="/clinical-sample" element={
          <ProtectedRoute requiredRoles={['admin', 'lab_technician', 'manager']}>
            <ClinicalTrialSample />
          </ProtectedRoute>
        } />
        <Route path="/medtech-testing" element={
          <ProtectedRoute requiredRoles={['admin', 'lab_technician']}>
            <MedTechTesting />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <AnalyticsDashboardSimple />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/tests" element={
          <ProtectedRoute>
            <Tests />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/complaints" element={
          <ProtectedRoute requiredRoles={['admin', 'lab_technician', 'manager']} requiredTab="complaints">
            <Complaints />
          </ProtectedRoute>
        } />
        <Route path="/complaints-analytics" element={
          <ProtectedRoute requiredRoles={['admin', 'manager']} requiredTab="complaintsAnalytics">
            <ComplaintsAnalytics />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  )
}

export default App
