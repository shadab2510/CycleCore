import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { testsAPI } from '../services/api'

export const fetchTests = createAsyncThunk('tests/fetchTests', async (sampleId) => {
  const response = await testsAPI.getBySampleId(sampleId)
  return response.data
})

export const createTest = createAsyncThunk('tests/createTest', async (testData) => {
  const response = await testsAPI.create(testData)
  return response.data
})

const testsSlice = createSlice({
  name: 'tests',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
  },
})

export default testsSlice.reducer
