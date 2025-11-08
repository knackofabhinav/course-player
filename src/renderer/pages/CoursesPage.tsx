import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Tooltip, Alert, Snackbar, Container, Typography } from '@mui/material'
import { FolderOpen, GridView, ViewList } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  loadCourseFromFolder,
  selectFilteredCourses,
  selectCoursesLoading,
  selectCoursesError,
  clearError,
  selectCourse
} from '@/store/slices/coursesSlice'
import { loadProgress, initializeCourseProgressFromCourse } from '@/store/slices/progressSlice'
import { selectShowContinueWatching } from '@/store/slices/settingsSlice'
import { selectCourseFolder } from '@/services/fileSystem'
import { CourseList, CourseSearch, ContinueWatching } from '@/components/CourseList'
import { ProgressStats } from '@/components/Progress'

export default function CoursesPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const courses = useAppSelector(selectFilteredCourses)
  const loading = useAppSelector(selectCoursesLoading)
  const error = useAppSelector(selectCoursesError)
  const showContinueWatching = useAppSelector(selectShowContinueWatching)

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  // Load progress on mount
  useEffect(() => {
    dispatch(loadProgress())
  }, [dispatch])

  // Handle adding a new course
  const handleAddCourse = async () => {
    try {
      const folderPath = await selectCourseFolder()
      if (folderPath) {
        const result = await dispatch(loadCourseFromFolder(folderPath))
        if (loadCourseFromFolder.fulfilled.match(result)) {
          // Initialize progress tracking for the new course
          dispatch(initializeCourseProgressFromCourse(result.payload))

          // Show success notification
          setSnackbarMessage(`Course loaded: ${result.payload.title}`)
          setSnackbarSeverity('success')
          setSnackbarOpen(true)
        } else {
          // Show error notification
          setSnackbarMessage('Failed to load course')
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
        }
      }
    } catch (error) {
      console.error('Error loading course:', error)
      setSnackbarMessage(`Error: ${error}`)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  // Handle course click
  const handleCourseClick = (courseId: string) => {
    dispatch(selectCourse(courseId))
    navigate(`/viewer/${courseId}`)
  }

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    setViewMode((prevMode) => (prevMode === 'grid' ? 'list' : 'grid'))
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  // Handle error dismiss
  const handleErrorDismiss = () => {
    dispatch(clearError())
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4">My Courses</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Toggle view">
            <IconButton onClick={handleViewModeToggle}>
              {viewMode === 'grid' ? <ViewList /> : <GridView />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FolderOpen />}
            onClick={handleAddCourse}
            disabled={loading}
          >
            Add Course Folder
          </Button>
        </Box>
      </Box>

      {/* Continue Watching Section */}
      {showContinueWatching && <ContinueWatching />}

      {/* Progress Stats Section */}
      {courses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ProgressStats variant="compact" showRecentActivity={false} />
        </Box>
      )}

      {/* Course Search Section */}
      <CourseSearch />

      {/* Error Alert */}
      {error && !loading && (
        <Alert severity="error" onClose={handleErrorDismiss} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Course List Section */}
      <CourseList
        courses={courses}
        loading={loading}
        error={null}
        viewMode={viewMode}
        onCourseClick={handleCourseClick}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}
