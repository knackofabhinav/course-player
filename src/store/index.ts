/**
 * Redux Store Configuration
 *
 * Configures the Redux store with Redux Toolkit and combines all slices
 */

import { configureStore } from '@reduxjs/toolkit'
import coursesReducer from './slices/coursesSlice'
import playerReducer from './slices/playerSlice'
import progressReducer from './slices/progressSlice'

// Configure store
export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    player: playerReducer,
    progress: progressReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production'
})

// Infer RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
