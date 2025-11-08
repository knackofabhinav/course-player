/**
 * Settings Redux Slice
 *
 * Manage app-wide settings in Redux with automatic localStorage persistence.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { SettingsState, AppSettings, KeyboardShortcut } from '@/types'
import {
  loadSettings,
  saveSettings,
  getDefaultSettings,
  clearSettings
} from '@/services/settingsStorage'
import type { RootState } from '../index'

// Initial state
const initialState: SettingsState = {
  ...getDefaultSettings(),
  isLoading: false,
  error: null
}

// Async thunks
export const loadSettingsFromStorage = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const loadedSettings = loadSettings()
      return loadedSettings || getDefaultSettings()
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load settings')
    }
  }
)

export const saveSettingsToStorage = createAsyncThunk(
  'settings/saveSettings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { isLoading, error, ...settings } = state.settings
      await saveSettings(settings as AppSettings)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save settings')
    }
  }
)

// Slice definition
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },

    setDefaultPlaybackSpeed: (state, action: PayloadAction<number>) => {
      // Validate speed is between 0.5 and 2.0
      const speed = Math.max(0.5, Math.min(2.0, action.payload))
      state.defaultPlaybackSpeed = speed
    },

    setAutoPlayNext: (state, action: PayloadAction<boolean>) => {
      state.autoPlayNext = action.payload
    },

    addCourseFolder: (state, action: PayloadAction<string>) => {
      const folderPath = action.payload
      if (!state.courseFolders.includes(folderPath)) {
        state.courseFolders.push(folderPath)
      }
    },

    removeCourseFolder: (state, action: PayloadAction<string>) => {
      state.courseFolders = state.courseFolders.filter(
        (path) => path !== action.payload
      )
    },

    updateKeyboardShortcut: (
      state,
      action: PayloadAction<{ action: string; key: string }>
    ) => {
      const { action: actionName, key } = action.payload

      // Check if key is already used for another action
      const existingShortcut = state.keyboardShortcuts.find(
        (s) => s.key === key && s.action !== actionName
      )

      if (existingShortcut) {
        state.error = `Key "${key}" is already assigned to "${existingShortcut.description}"`
        return
      }

      // Update the shortcut
      const shortcut = state.keyboardShortcuts.find((s) => s.action === actionName)
      if (shortcut) {
        shortcut.key = key
        state.error = null
      }
    },

    resetKeyboardShortcuts: (state) => {
      state.keyboardShortcuts = getDefaultSettings().keyboardShortcuts
    },

    setShowContinueWatching: (state, action: PayloadAction<boolean>) => {
      state.showContinueWatching = action.payload
    },

    setDefaultViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.defaultViewMode = action.payload
    },

    resetSettings: (state) => {
      const defaults = getDefaultSettings()
      Object.assign(state, defaults)
      state.isLoading = false
      state.error = null
      clearSettings()
    }
  },

  extraReducers: (builder) => {
    // loadSettingsFromStorage
    builder
      .addCase(loadSettingsFromStorage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadSettingsFromStorage.fulfilled, (state, action) => {
        state.isLoading = false
        Object.assign(state, action.payload)
      })
      .addCase(loadSettingsFromStorage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Use default settings on error
        Object.assign(state, getDefaultSettings())
      })

    // saveSettingsToStorage
    builder
      .addCase(saveSettingsToStorage.pending, () => {
        // No state change (save is fast)
      })
      .addCase(saveSettingsToStorage.fulfilled, () => {
        // No state change (settings already in Redux)
      })
      .addCase(saveSettingsToStorage.rejected, (state, action) => {
        state.error = action.payload as string
        console.error('Failed to save settings:', action.payload)
      })
  }
})

// Selectors
export const selectSettings = (state: RootState) => state.settings

export const selectTheme = (state: RootState) => state.settings.theme

export const selectDefaultPlaybackSpeed = (state: RootState) =>
  state.settings.defaultPlaybackSpeed

export const selectAutoPlayNext = (state: RootState) =>
  state.settings.autoPlayNext

export const selectCourseFolders = (state: RootState) =>
  state.settings.courseFolders

export const selectKeyboardShortcuts = (state: RootState) =>
  state.settings.keyboardShortcuts

export const selectKeyboardShortcutForAction = (action: string) => (state: RootState) =>
  state.settings.keyboardShortcuts.find((s) => s.action === action)?.key || null

export const selectShowContinueWatching = (state: RootState) =>
  state.settings.showContinueWatching

export const selectDefaultViewMode = (state: RootState) =>
  state.settings.defaultViewMode

export const selectSettingsLoading = (state: RootState) =>
  state.settings.isLoading

export const selectSettingsError = (state: RootState) =>
  state.settings.error

// Export actions and reducer
export const {
  setTheme,
  setDefaultPlaybackSpeed,
  setAutoPlayNext,
  addCourseFolder,
  removeCourseFolder,
  updateKeyboardShortcut,
  resetKeyboardShortcuts,
  setShowContinueWatching,
  setDefaultViewMode,
  resetSettings
} = settingsSlice.actions

export default settingsSlice.reducer
