import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { complaintsAPI } from '../services/api'

export const fetchComplaints = createAsyncThunk('complaints/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await complaintsAPI.getAll()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch complaints')
  }
})

export const createComplaint = createAsyncThunk('complaints/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await complaintsAPI.create(payload)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create complaint')
  }
})

export const updateComplaint = createAsyncThunk('complaints/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await complaintsAPI.update(id, payload)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update complaint')
  }
})

export const transitionComplaintStage = createAsyncThunk(
  'complaints/transitionStage',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await complaintsAPI.transitionStage(id, payload)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to transition complaint stage')
    }
  }
)

export const seedDemoComplaints = createAsyncThunk('complaints/seedDemo', async (_, { rejectWithValue }) => {
  try {
    const response = await complaintsAPI.seedDemo()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to seed demo complaints')
  }
})

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearComplaintsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch complaints'
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.error = action.payload || 'Failed to create complaint'
      })
      .addCase(updateComplaint.fulfilled, (state, action) => {
        const idx = state.items.findIndex(item => item.id === action.payload.id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
      .addCase(updateComplaint.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update complaint'
      })
      .addCase(transitionComplaintStage.fulfilled, (state, action) => {
        const idx = state.items.findIndex(item => item.id === action.payload.id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
      .addCase(transitionComplaintStage.rejected, (state, action) => {
        state.error = action.payload || 'Failed to transition complaint stage'
      })
      .addCase(seedDemoComplaints.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.error = null
      })
      .addCase(seedDemoComplaints.rejected, (state, action) => {
        state.error = action.payload || 'Failed to seed demo complaints'
      })
  },
})

export const { clearComplaintsError } = complaintsSlice.actions
export default complaintsSlice.reducer
