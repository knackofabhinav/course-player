/**
 * Progress Redux Slice
 *
 * Manages watch progress tracking including lesson completion,
 * watch time, and sync with file system
 */

import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit'
import type { ProgressState, LessonProgressUpdate, CourseProgress } from '@/types'
import { saveProgressWithRetry, loadProgressWithFallback } from '@/renderer/services/progressManager'
import type { RootState } from '../index'

// Initial state
const initialState: ProgressState = {
  courses: {},
  isLoading: false,
  isSaving: false,
  error: null,
  isDirty: false,
  version: '1.0'
}

// Async thunks
/**
 * Load progress data from local storage
 * Uses fallback mechanism to handle corrupted data
 */
export const loadProgress = createAsyncThunk(
  'progress/loadProgress',
  async (_, { rejectWithValue }) => {
    try {
      const progressData = await loadProgressWithFallback()
      return progressData
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load progress')
    }
  }
)

/**
 * Save progress data to local storage
 * Only saves if there are pending changes (isDirty flag is true)
 */
export const saveProgress = createAsyncThunk(
  'progress/saveProgress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { courses, version } = state.progress

      // Only save if there are changes
      if (!state.progress.isDirty) {
        return
      }

      await saveProgressWithRetry({ courses, version })
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save progress')
    }
  }
)

/**
 * Export progress data to a JSON file
 * Opens a save dialog and writes the progress data to the selected file
 */
export const exportProgress = createAsyncThunk(
  'progress/exportProgress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { courses, version } = state.progress

      const progressData = { courses, version }
      const result = await window.electron.exportProgress(progressData)

      if (result.canceled) {
        return rejectWithValue('canceled')
      }

      if (!result.success || !result.filePath) {
        return rejectWithValue(result.error || 'Failed to export progress')
      }

      return { success: true, filePath: result.filePath }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to export progress')
    }
  }
)

/**
 * Import progress data from a JSON file
 * Opens a file dialog, reads and validates the data, then merges it with existing progress
 */
export const importProgress = createAsyncThunk(
  'progress/importProgress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const existingProgress = { courses: state.progress.courses, version: state.progress.version }

      // Open import dialog and read file
      const result = await window.electron.importProgress()

      if (result.canceled) {
        return rejectWithValue('canceled')
      }

      if (!result.success || !result.data) {
        return rejectWithValue(result.error || 'Failed to import progress')
      }

      // Import with mergeProgressData from progressManager
      const { mergeProgressData } = await import('@/renderer/services/progressManager')
      const mergedProgress = mergeProgressData(existingProgress, result.data)

      return mergedProgress
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to import progress')
    }
  }
)

// Slice definition
const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    updateLessonProgress: (
      state,
      action: PayloadAction<{ courseId: string; lessonId: string; progress: LessonProgressUpdate }>
    ) => {
      const { courseId, lessonId, progress } = action.payload

      // Initialize course progress if it doesn't exist
      if (!state.courses[courseId]) {
        state.courses[courseId] = {
          lastWatched: new Date().toISOString(),
          currentLesson: lessonId,
          currentTime: 0,
          lessons: {}
        }
      }

      // Initialize lesson progress if it doesn't exist
      if (!state.courses[courseId].lessons[lessonId]) {
        state.courses[courseId].lessons[lessonId] = {
          completed: false,
          watchedDuration: 0,
          lastPosition: 0
        }
      }

      // Merge progress update
      state.courses[courseId].lessons[lessonId] = {
        ...state.courses[courseId].lessons[lessonId],
        ...progress,
        lastWatched: new Date().toISOString()
      }

      // Update course lastWatched
      state.courses[courseId].lastWatched = new Date().toISOString()
      state.isDirty = true
    },

    setCurrentTime: (
      state,
      action: PayloadAction<{ courseId: string; lessonId: string; currentTime: number }>
    ) => {
      const { courseId, lessonId, currentTime } = action.payload

      // Initialize course progress if needed
      if (!state.courses[courseId]) {
        state.courses[courseId] = {
          lastWatched: new Date().toISOString(),
          currentLesson: lessonId,
          currentTime,
          lessons: {}
        }
      }

      // Initialize lesson progress if needed
      if (!state.courses[courseId].lessons[lessonId]) {
        state.courses[courseId].lessons[lessonId] = {
          completed: false,
          watchedDuration: 0,
          lastPosition: currentTime
        }
      }

      // Update current time and last position
      state.courses[courseId].currentTime = currentTime
      state.courses[courseId].currentLesson = lessonId
      state.courses[courseId].lessons[lessonId].lastPosition = currentTime
      state.isDirty = true
    },

    markLessonComplete: (
      state,
      action: PayloadAction<{ courseId: string; lessonId: string }>
    ) => {
      const { courseId, lessonId } = action.payload

      if (state.courses[courseId]?.lessons[lessonId]) {
        state.courses[courseId].lessons[lessonId].completed = true
        state.courses[courseId].lessons[lessonId].completedAt = new Date().toISOString()

        // Update cached completedLessons count
        const completedCount = Object.values(state.courses[courseId].lessons).filter(
          l => l.completed
        ).length
        state.courses[courseId].completedLessons = completedCount

        state.isDirty = true
      }
    },

    markLessonIncomplete: (
      state,
      action: PayloadAction<{ courseId: string; lessonId: string }>
    ) => {
      const { courseId, lessonId } = action.payload

      if (state.courses[courseId]?.lessons[lessonId]) {
        state.courses[courseId].lessons[lessonId].completed = false
        delete state.courses[courseId].lessons[lessonId].completedAt

        // Update cached completedLessons count
        const completedCount = Object.values(state.courses[courseId].lessons).filter(
          l => l.completed
        ).length
        state.courses[courseId].completedLessons = completedCount

        state.isDirty = true
      }
    },

    initializeCourseProgress: (
      state,
      action: PayloadAction<{ courseId: string; totalLessons: number }>
    ) => {
      const { courseId, totalLessons } = action.payload

      if (!state.courses[courseId]) {
        state.courses[courseId] = {
          lastWatched: new Date().toISOString(),
          currentLesson: '',
          currentTime: 0,
          lessons: {},
          totalLessons
        }
      } else {
        state.courses[courseId].totalLessons = totalLessons
      }
    },

    clearCourseProgress: (state, action: PayloadAction<string>) => {
      delete state.courses[action.payload]
      state.isDirty = true
    },

    markDirty: (state) => {
      state.isDirty = true
    },

    clearDirty: (state) => {
      state.isDirty = false
    },

    initializeCourseProgressFromCourse: (
      state,
      action: PayloadAction<{ id: string; sections: Array<{ lessons: Array<{ id: string }> }> }>
    ) => {
      const { id: courseId, sections } = action.payload

      // Count total lessons
      const totalLessons = sections.reduce(
        (total, section) => total + section.lessons.length,
        0
      )

      // Initialize course progress if it doesn't exist
      if (!state.courses[courseId]) {
        state.courses[courseId] = {
          lastWatched: new Date().toISOString(),
          currentLesson: '',
          currentTime: 0,
          lessons: {},
          totalLessons,
          completedLessons: 0
        }
      } else {
        // Update total lessons count for existing course
        state.courses[courseId].totalLessons = totalLessons
      }
    }
  },

  extraReducers: (builder) => {
    // loadProgress
    builder
      .addCase(loadProgress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadProgress.fulfilled, (state, action) => {
        state.isLoading = false
        // Merge loaded progress with state
        state.courses = { ...state.courses, ...action.payload.courses }
        if (action.payload.version) {
          state.version = action.payload.version
        }
        state.isDirty = false
        state.lastSync = new Date().toISOString()
      })
      .addCase(loadProgress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // saveProgress
    builder
      .addCase(saveProgress.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(saveProgress.fulfilled, (state) => {
        state.isSaving = false
        state.isDirty = false
        state.lastSync = new Date().toISOString()
      })
      .addCase(saveProgress.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
        // Keep isDirty true to retry
      })

    // exportProgress
    builder
      .addCase(exportProgress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(exportProgress.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(exportProgress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // importProgress
    builder
      .addCase(importProgress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(importProgress.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload && 'courses' in action.payload) {
          // Merge imported progress
          state.courses = { ...state.courses, ...action.payload.courses }
          if (action.payload.version) {
            state.version = action.payload.version
          }
          state.isDirty = true
          state.lastSync = new Date().toISOString()
        }
      })
      .addCase(importProgress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

// Selectors
export const selectProgressData = (state: RootState) => state.progress

export const selectCourseProgress = (courseId: string) =>
  createSelector(
    [(state: RootState) => state.progress.courses],
    (courses) => courses[courseId]
  )

export const selectLessonProgress = (courseId: string, lessonId: string) =>
  createSelector(
    [(state: RootState) => state.progress.courses],
    (courses) => courses[courseId]?.lessons[lessonId]
  )

export const selectIsLessonComplete = (courseId: string, lessonId: string) =>
  createSelector(
    [(state: RootState) => state.progress.courses],
    (courses) => courses[courseId]?.lessons[lessonId]?.completed || false
  )

export const selectCourseCompletionPercentage = (courseId: string) =>
  createSelector(
    [(state: RootState) => state.progress.courses],
    (courses) => {
      const courseProgress = courses[courseId]
      if (!courseProgress || !courseProgress.totalLessons) return 0

      const completedLessons = courseProgress.completedLessons || 0
      return (completedLessons / courseProgress.totalLessons) * 100
    }
  )

export const selectLastWatchedCourse = createSelector(
  [(state: RootState) => state.progress.courses],
  (courses) => {
    const entries = Object.entries(courses)
    if (entries.length === 0) return null

    return entries.reduce((latest, [courseId, progress]) => {
      if (!latest || new Date(progress.lastWatched) > new Date(latest.lastWatched)) {
        return { courseId, ...progress }
      }
      return latest
    }, null as { courseId: string } & CourseProgress | null)?.courseId || null
  }
)

export const selectProgressIsDirty = (state: RootState) => state.progress.isDirty

export const selectProgressIsSaving = (state: RootState) => state.progress.isSaving

export const selectProgressError = (state: RootState) => state.progress.error

export const selectTotalWatchTime = createSelector(
  [(state: RootState) => state.progress.courses],
  (courses) => {
    return Object.values(courses).reduce((total, courseProgress) => {
      const lessonTotal = Object.values(courseProgress.lessons).reduce(
        (sum, lesson) => sum + lesson.watchedDuration,
        0
      )
      return total + lessonTotal
    }, 0)
  }
)

export const selectCompletedCoursesCount = createSelector(
  [(state: RootState) => state.progress.courses],
  (courses) => {
    return Object.values(courses).filter(courseProgress => {
      if (!courseProgress.totalLessons) return false
      const completedLessons = courseProgress.completedLessons || 0
      return completedLessons === courseProgress.totalLessons
    }).length
  }
)

// Selector for counting in-progress courses
export const selectInProgressCoursesCount = createSelector(
  [(state: RootState) => state.progress.courses],
  (courses) => {
    return Object.values(courses).filter(courseProgress => {
      if (!courseProgress.totalLessons) return false
      const completedLessons = courseProgress.completedLessons || 0
      return completedLessons > 0 && completedLessons < courseProgress.totalLessons
    }).length
  }
)

// Export actions and reducer
export const {
  updateLessonProgress,
  setCurrentTime,
  markLessonComplete,
  markLessonIncomplete,
  initializeCourseProgress,
  initializeCourseProgressFromCourse,
  clearCourseProgress,
  markDirty,
  clearDirty
} = progressSlice.actions

export default progressSlice.reducer
