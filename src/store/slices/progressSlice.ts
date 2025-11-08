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
  clearCourseProgress,
  markDirty,
  clearDirty
} = progressSlice.actions

export default progressSlice.reducer
