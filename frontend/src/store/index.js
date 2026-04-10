import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import samplesReducer from './samplesSlice'
import testsReducer from './testsSlice'
import resultsReducer from './resultsSlice'
import clinicalTrialsReducer from './clinicalTrialsSlice'
import complaintsReducer from './complaintsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    samples: samplesReducer,
    tests: testsReducer,
    results: resultsReducer,
    clinicalTrials: clinicalTrialsReducer,
    complaints: complaintsReducer,
  },
})

export default store
