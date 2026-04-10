import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { clinicalAPI } from '../services/api'

// Async thunks for clinical trial operations
export const fetchTrials = createAsyncThunk('clinicalTrials/fetchTrials', async (_, { rejectWithValue }) => {
  try {
    // Mock data for now since backend doesn't have these endpoints yet
    const mockTrials = [
      {
        id: 'TRL-COVID19-2024-001',
        name: 'COVID-19 Vaccine Phase III Trial',
        protocolNumber: 'COVID-VAX-003',
        phase: 'Phase III',
        sponsor: 'Johnson & Johnson',
        principalInvestigator: 'Dr. Sarah Johnson',
        therapeuticArea: 'Infectious Diseases',
        indication: 'COVID-19 Prevention',
        targetEnrollment: 30000,
        currentEnrollment: 28500,
        startDate: '2024-01-01',
        estimatedEndDate: '2024-12-31',
        status: 'Active',
        complianceScore: 98,
        riskScore: 35,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'TRL-ONCOLOGY-2024-002',
        name: 'Novel Cancer Immunotherapy Study',
        protocolNumber: 'ONCO-IMMUN-001',
        phase: 'Phase II',
        sponsor: 'Big Pharma Corp',
        principalInvestigator: 'Dr. Michael Chen',
        therapeuticArea: 'Oncology',
        indication: 'Non-Small Cell Lung Cancer',
        targetEnrollment: 500,
        currentEnrollment: 425,
        startDate: '2024-02-01',
        estimatedEndDate: '2025-06-30',
        status: 'Active',
        complianceScore: 95,
        riskScore: 65,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    return mockTrials
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch trials')
  }
})

export const createTrial = createAsyncThunk('clinicalTrials/createTrial', async (trialData, { rejectWithValue }) => {
  try {
    // Mock creation
    const newTrial = {
      ...trialData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return newTrial
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create trial')
  }
})

export const fetchTrialSites = createAsyncThunk('clinicalTrials/fetchTrialSites', async (trialId, { rejectWithValue }) => {
  try {
    // Mock sites data
    const mockSites = [
      {
        id: 'SITE-001',
        name: 'Mayo Clinic Rochester',
        location: 'Rochester, MN',
        principalInvestigator: 'Dr. John Smith',
        targetEnrollment: 500,
        currentEnrollment: 425,
        status: 'Active'
      },
      {
        id: 'SITE-002', 
        name: 'Cleveland Clinic',
        location: 'Cleveland, OH',
        principalInvestigator: 'Dr. Jane Doe',
        targetEnrollment: 300,
        currentEnrollment: 278,
        status: 'Active'
      }
    ]
    return mockSites
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch trial sites')
  }
})

export const fetchTrialPatients = createAsyncThunk('clinicalTrials/fetchTrialPatients', async (trialId, { rejectWithValue }) => {
  try {
    // Mock patients data
    const mockPatients = [
      {
        id: 'PAT-001',
        age: 45,
        gender: 'Female',
        enrollmentDate: '2024-01-15',
        completedVisits: 3,
        totalVisits: 12,
        status: 'Active'
      },
      {
        id: 'PAT-002',
        age: 52,
        gender: 'Male', 
        enrollmentDate: '2024-01-20',
        completedVisits: 2,
        totalVisits: 12,
        status: 'Active'
      }
    ]
    return mockPatients
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch trial patients')
  }
})

export const createClinicalSample = createAsyncThunk('clinicalTrials/createClinicalSample', async (sampleData, { rejectWithValue }) => {
  try {
    // Mock creation
    const newSample = {
      ...sampleData,
      createdAt: new Date().toISOString()
    }
    return newSample
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create clinical sample')
  }
})

export const updateChainOfCustody = createAsyncThunk('clinicalTrials/updateChainOfCustody', async ({ sampleId, custodyData }, { rejectWithValue }) => {
  try {
    // Mock update
    return { sampleId, ...custodyData, updatedAt: new Date().toISOString() }
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update chain of custody')
  }
})

export const validateRegulatoryCompliance = createAsyncThunk('clinicalTrials/validateRegulatoryCompliance', async (trialId, { rejectWithValue }) => {
  try {
    // Mock compliance validation
    const mockCompliance = {
      trialId,
      overallCompliance: 96,
      fdaCompliance: 98,
      gcpCompliance: 95,
      irbCompliance: 100,
      dataIntegrity: 92,
      safetyReporting: 96,
      lastValidated: new Date().toISOString()
    }
    return mockCompliance
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to validate regulatory compliance')
  }
})

const initialState = {
  trials: [],
  currentTrial: null,
  trialSites: [],
  trialPatients: [],
  clinicalSamples: [],
  chainOfCustody: [],
  complianceStatus: null,
  loading: false,
  error: null,
  stats: {
    totalTrials: 0,
    activeTrials: 0,
    completedTrials: 0,
    totalPatients: 0,
    totalSamples: 0,
    complianceRate: 0
  }
}

const clinicalTrialsSlice = createSlice({
  name: 'clinicalTrials',
  initialState,
  reducers: {
    setCurrentTrial: (state, action) => {
      state.currentTrial = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    updateTrialStats: (state) => {
      state.stats.totalTrials = state.trials.length
      state.stats.activeTrials = state.trials.filter(t => t.status === 'Active').length
      state.stats.completedTrials = state.trials.filter(t => t.status === 'Completed').length
      state.stats.totalPatients = state.trialPatients.length
      state.stats.totalSamples = state.clinicalSamples.length
      state.stats.complianceRate = state.complianceStatus?.overallCompliance || 0
    },
    addChainOfCustodyEntry: (state, action) => {
      state.chainOfCustody.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trials
      .addCase(fetchTrials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTrials.fulfilled, (state, action) => {
        state.loading = false
        state.trials = action.payload
      })
      .addCase(fetchTrials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Trial
      .addCase(createTrial.fulfilled, (state, action) => {
        state.trials.push(action.payload)
      })
      .addCase(createTrial.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Fetch Trial Sites
      .addCase(fetchTrialSites.fulfilled, (state, action) => {
        state.trialSites = action.payload
      })
      
      // Fetch Trial Patients
      .addCase(fetchTrialPatients.fulfilled, (state, action) => {
        state.trialPatients = action.payload
      })
      
      // Create Clinical Sample
      .addCase(createClinicalSample.fulfilled, (state, action) => {
        state.clinicalSamples.push(action.payload)
      })
      
      // Update Chain of Custody
      .addCase(updateChainOfCustody.fulfilled, (state, action) => {
        const index = state.chainOfCustody.findIndex(c => c.sampleId === action.payload.sampleId)
        if (index !== -1) {
          state.chainOfCustody[index] = action.payload
        } else {
          state.chainOfCustody.push(action.payload)
        }
      })
      
      // Validate Regulatory Compliance
      .addCase(validateRegulatoryCompliance.fulfilled, (state, action) => {
        state.complianceStatus = action.payload
      })
  }
})

export const { setCurrentTrial, clearError, updateTrialStats, addChainOfCustodyEntry } = clinicalTrialsSlice.actions
export default clinicalTrialsSlice.reducer
