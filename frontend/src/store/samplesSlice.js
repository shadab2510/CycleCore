import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { samplesAPI } from '../services/api'

export const fetchSamples = createAsyncThunk('samples/fetchSamples', async () => {
  const response = await samplesAPI.getAll()
  return response.data
})

export const createSample = createAsyncThunk('samples/createSample', async (sampleData) => {
  const response = await samplesAPI.create(sampleData)
  return response.data
})

export const updateSampleStatus = createAsyncThunk('samples/updateSampleStatus', async ({ id, status }) => {
  const response = await samplesAPI.updateStatus(id, status)
  return response.data
})

const samplesSlice = createSlice({
  name: 'samples',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentSample: null,
  },
  reducers: {
    setCurrentSample: (state, action) => {
      state.currentSample = action.payload
    },
    clearCurrentSample: (state) => {
      state.currentSample = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSamples.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSamples.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchSamples.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createSample.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateSampleStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentSample && state.currentSample.id === action.payload.id) {
          state.currentSample = action.payload
        }
      })
  },
})

export const { setCurrentSample, clearCurrentSample } = samplesSlice.actions
export default samplesSlice.reducer
