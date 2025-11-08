import { useMemo } from 'react'
import { Grid, Box, Typography, Alert, Skeleton } from '@mui/material'
import { VideoLibrary } from '@mui/icons-material'
import { useAppSelector } from '@/store/hooks'
import { selectCourseCompletionPercentage } from '@/store/slices/progressSlice'
import CourseCard from './CourseCard'
import type { Course } from '@/types'
import { MotionBox, staggerContainer, staggerItem, fadeInUp, scaleIn } from '@/animations'
import { AnimatePresence } from 'framer-motion'

interface CourseListProps {
  courses: Course[]
  loading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  onCourseClick: (courseId: string) => void
}

export default function CourseList({
  courses,
  loading,
  error,
  viewMode,
  onCourseClick
}: CourseListProps) {
  // Loading State
  if (loading) {
    return (
      <MotionBox variants={fadeInUp} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={320} animation="wave" sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </MotionBox>
    )
  }

  // Error State
  if (error) {
    return (
      <MotionBox variants={fadeInUp} initial="hidden" animate="visible">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error}
          </Alert>
        </Box>
      </MotionBox>
    )
  }

  // Empty State
  if (courses.length === 0) {
    return (
      <MotionBox variants={scaleIn} initial="hidden" animate="visible">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            textAlign: 'center'
          }}
        >
          <VideoLibrary sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Courses Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Click 'Add Course Folder' to get started
          </Typography>
        </Box>
      </MotionBox>
    )
  }

  // Courses Display Component
  const CourseItem = ({ course }: { course: Course }) => {
    const progressPercent = useAppSelector(selectCourseCompletionPercentage(course.id))

    return (
      <CourseCard
        course={course}
        progressPercent={progressPercent}
        onClick={() => onCourseClick(course.id)}
      />
    )
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <MotionBox component="div" variants={staggerContainer} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          <AnimatePresence mode="popLayout">
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <MotionBox variants={staggerItem} layout>
                  <CourseItem course={course} />
                </MotionBox>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </MotionBox>
    )
  }

  // List View
  return (
    <MotionBox component="div" variants={staggerContainer} initial="hidden" animate="visible">
      <Box>
        <AnimatePresence mode="popLayout">
          {courses.map((course) => (
            <MotionBox key={course.id} variants={staggerItem} layout sx={{ mb: 2 }}>
              <CourseItem course={course} />
            </MotionBox>
          ))}
        </AnimatePresence>
      </Box>
    </MotionBox>
  )
}
