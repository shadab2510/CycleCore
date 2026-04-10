import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../services/api'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Login failed')
  }
})

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('cyclecorelims_token')
    if (!token) {
      return rejectWithValue('No token found')
    }
    const response = await authAPI.getMe()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to get user')
  }
})

const initialState = {
  user: localStorage.getItem('cyclecorelims_user') ? JSON.parse(localStorage.getItem('cyclecorelims_user')) : null,
  token: localStorage.getItem('cyclecorelims_token'),
  isAuthenticated: !!localStorage.getItem('cyclecorelims_token'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('cyclecorelims_token')
      localStorage.removeItem('cyclecorelims_user')
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('cyclecorelims_token', action.payload.token)
        localStorage.setItem('cyclecorelims_user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = localStorage.getItem('cyclecorelims_token')
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('cyclecorelims_token')
        localStorage.removeItem('cyclecorelims_user')
      })
  },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
