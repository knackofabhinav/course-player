/**
 * Courses Redux Slice
 *
 * Manages course data including loaded courses, selected course, and course folders
 */

import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit'
import type { Course } from '@/types'
import { loadCourseData } from '@/renderer/services/fileSystem'
import type { RootState } from '../index'

// State interface
export interface CoursesState {
  courses: Course[]
  selectedCourseId: string | null
  courseFolders: string[]
  searchQuery: string
  filters: {
    instructor: string | null
    completionStatus: 'all' | 'completed' | 'in-progress' | 'not-started'
  }
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

// Initial state
const initialState: CoursesState = {
  courses: [],
  selectedCourseId: null,
  courseFolders: [],
  searchQuery: '',
  filters: {
    instructor: null,
    completionStatus: 'all'
  },
  isLoading: false,
  error: null,
  lastUpdated: null
}

// Async thunks
export const loadCourseFromFolder = createAsyncThunk(
  'courses/loadCourseFromFolder',
  async (folderPath: string, { rejectWithValue }) => {
    try {
      const course = await loadCourseData(folderPath)
      // Add folderPath to the course data
      return { ...course, folderPath, createdAt: new Date().toISOString() }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load course')
    }
  }
)

export const loadCoursesFromFolders = createAsyncThunk(
  'courses/loadCoursesFromFolders',
  async (folderPaths: string[], { rejectWithValue }) => {
    try {
      const courses: Course[] = []

      for (const folderPath of folderPaths) {
        try {
          const course = await loadCourseData(folderPath)
          courses.push({ ...course, folderPath, createdAt: new Date().toISOString() })
        } catch (error) {
          // Skip folders without valid course.json
          console.warn(`Skipping folder ${folderPath}: invalid course data`)
        }
      }

      // Deduplicate courses by ID using Map
      const courseMap = new Map<string, Course>()
      for (const course of courses) {
        courseMap.set(course.id, course)
      }

      return Array.from(courseMap.values())
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load courses')
    }
  }
)

export const hydrateCourseFolders = createAsyncThunk(
  'courses/hydrateCourseFolders',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Read courseFolders from localStorage
      const storedFolders = localStorage.getItem('courseFolders')

      if (!storedFolders) {
        return { courseFolders: [] }
      }

      const courseFolders: string[] = JSON.parse(storedFolders)

      // Load courses from all stored folders
      if (courseFolders.length > 0) {
        await dispatch(loadCoursesFromFolders(courseFolders))
      }

      return { courseFolders }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to hydrate course folders')
    }
  }
)

// Slice definition
const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    selectCourse: (state, action: PayloadAction<string>) => {
      state.selectedCourseId = action.payload
    },

    addCourseFolder: (state, action: PayloadAction<string>) => {
      if (!state.courseFolders.includes(action.payload)) {
        state.courseFolders.push(action.payload)
        // Persist to localStorage
        localStorage.setItem('courseFolders', JSON.stringify(state.courseFolders))
      }
    },

    removeCourseFolder: (state, action: PayloadAction<string>) => {
      // Check if the removed folder contains the selected course
      if (state.selectedCourseId) {
        const selectedCourse = state.courses.find(course => course.id === state.selectedCourseId)
        if (selectedCourse && selectedCourse.folderPath === action.payload) {
          state.selectedCourseId = null
        }
      }

      state.courseFolders = state.courseFolders.filter(path => path !== action.payload)
      // Remove associated courses
      state.courses = state.courses.filter(course => course.folderPath !== action.payload)
      // Persist to localStorage
      localStorage.setItem('courseFolders', JSON.stringify(state.courseFolders))
    },

    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(course => course.id !== action.payload)
      // Clear selectedCourseId if it matches removed course
      if (state.selectedCourseId === action.payload) {
        state.selectedCourseId = null
      }
    },

    clearError: (state) => {
      state.error = null
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },

    setInstructorFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.instructor = action.payload
    },

    setCompletionFilter: (
      state,
      action: PayloadAction<'all' | 'completed' | 'in-progress' | 'not-started'>
    ) => {
      state.filters.completionStatus = action.payload
    },

    clearFilters: (state) => {
      state.searchQuery = ''
      state.filters = {
        instructor: null,
        completionStatus: 'all'
      }
    }
  },

  extraReducers: (builder) => {
    // loadCourseFromFolder
    builder
      .addCase(loadCourseFromFolder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadCourseFromFolder.fulfilled, (state, action) => {
        state.isLoading = false
        // Avoid duplicates by ID
        const existingIndex = state.courses.findIndex(c => c.id === action.payload.id)
        if (existingIndex >= 0) {
          state.courses[existingIndex] = action.payload
        } else {
          state.courses.push(action.payload)
        }
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(loadCourseFromFolder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // loadCoursesFromFolders
    builder
      .addCase(loadCoursesFromFolders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadCoursesFromFolders.fulfilled, (state, action) => {
        state.isLoading = false
        state.courses = action.payload
        state.lastUpdated = new Date().toISOString()

        // Check if selectedCourseId still exists in the loaded courses
        if (state.selectedCourseId) {
          const courseExists = action.payload.some(course => course.id === state.selectedCourseId)
          if (!courseExists) {
            state.selectedCourseId = null
          }
        }
      })
      .addCase(loadCoursesFromFolders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // hydrateCourseFolders
    builder
      .addCase(hydrateCourseFolders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(hydrateCourseFolders.fulfilled, (state, action) => {
        state.isLoading = false
        state.courseFolders = action.payload.courseFolders
      })
      .addCase(hydrateCourseFolders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

// Selectors
export const selectAllCourses = (state: RootState) => state.courses.courses

export const selectSelectedCourse = createSelector(
  [selectAllCourses, (state: RootState) => state.courses.selectedCourseId],
  (courses, selectedId) => courses.find(course => course.id === selectedId)
)

export const selectCourseById = (courseId: string) =>
  createSelector([selectAllCourses], (courses) =>
    courses.find(course => course.id === courseId)
  )

export const selectCoursesLoading = (state: RootState) => state.courses.isLoading

export const selectCoursesError = (state: RootState) => state.courses.error

export const selectCourseFolders = (state: RootState) => state.courses.courseFolders

export const selectSearchQuery = (state: RootState) => state.courses.searchQuery

export const selectFilters = (state: RootState) => state.courses.filters

export const selectUniqueInstructors = createSelector(
  [selectAllCourses],
  (courses) => {
    const instructors = courses
      .map(course => course.instructor)
      .filter((instructor): instructor is string => !!instructor)
    return Array.from(new Set(instructors)).sort()
  }
)

export const selectFilteredCourses = createSelector(
  [
    selectAllCourses,
    selectSearchQuery,
    selectFilters,
    (state: RootState) => state.progress.courses
  ],
  (courses, searchQuery, filters, progressCourses) => {
    let filtered = courses

    // Text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)
      )
    }

    // Instructor filter
    if (filters.instructor) {
      filtered = filtered.filter(course => course.instructor === filters.instructor)
    }

    // Completion filter
    if (filters.completionStatus !== 'all') {
      filtered = filtered.filter(course => {
        const courseProgress = progressCourses[course.id]
        if (!courseProgress || !courseProgress.totalLessons) {
          return filters.completionStatus === 'not-started'
        }

        const completedLessons = courseProgress.completedLessons || 0
        const totalLessons = courseProgress.totalLessons
        const completionPercent = (completedLessons / totalLessons) * 100

        switch (filters.completionStatus) {
          case 'completed':
            return completionPercent === 100
          case 'in-progress':
            return completionPercent > 0 && completionPercent < 100
          case 'not-started':
            return completionPercent === 0
          default:
            return true
        }
      })
    }

    return filtered
  }
)

// Export actions and reducer
export const {
  selectCourse,
  addCourseFolder,
  removeCourseFolder,
  removeCourse,
  clearError,
  setSearchQuery,
  setInstructorFilter,
  setCompletionFilter,
  clearFilters
} = coursesSlice.actions

export default coursesSlice.reducer
