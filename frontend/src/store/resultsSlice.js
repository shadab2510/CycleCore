import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { resultsAPI } from '../services/api'

export const fetchResults = createAsyncThunk('results/fetchResults', async (testId) => {
  const response = await resultsAPI.getByTestId(testId)
  return response.data
})

export const createResult = createAsyncThunk('results/createResult', async (resultData) => {
  const response = await resultsAPI.create(resultData)
  return response.data
})

const resultsSlice = createSlice({
  name: 'results',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createResult.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
  },
})

export default resultsSlice.reducer
