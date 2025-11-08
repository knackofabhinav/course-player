import { useMemo } from 'react'
import { Box, Paper, Typography, Grid, Chip, Divider, Avatar, alpha } from '@mui/material'
import {
  AccessTime,
  CheckCircle,
  PlayCircle,
  TrendingUp
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import {
  selectTotalWatchTime,
  selectCompletedCoursesCount,
  selectInProgressCoursesCount,
  selectLastWatchedCourse,
  selectProgressData,
  selectCourseCompletionPercentage
} from '@/store/slices/progressSlice'
import { selectAllCourses, selectCourseById } from '@/store/slices/coursesSlice'
import { formatDuration } from '@/services/courseLoader'
import { MotionPaper, MotionBox, fadeInUp, scaleIn, staggerContainer, staggerItem } from '@/animations'

interface ProgressStatsProps {
  variant?: 'compact' | 'detailed' // Display mode (default: 'detailed')
  showRecentActivity?: boolean // Show last watched course (default: true)
}

export function ProgressStats({
  variant = 'detailed',
  showRecentActivity = true
}: ProgressStatsProps) {
  const navigate = useNavigate()

  // Redux data fetching
  const totalWatchTime = useAppSelector(selectTotalWatchTime)
  const completedCoursesCount = useAppSelector(selectCompletedCoursesCount)
  const inProgressCoursesCount = useAppSelector(selectInProgressCoursesCount)
  const lastWatchedCourseId = useAppSelector(selectLastWatchedCourse)
  const allCourses = useAppSelector(selectAllCourses)
  const progressData = useAppSelector(selectProgressData)

  // Computed values
  const formattedWatchTime = useMemo(() => {
    return formatDuration(totalWatchTime)
  }, [totalWatchTime])

  const totalCoursesCount = allCourses.length

  const lastWatchedCourse = useAppSelector((state) =>
    lastWatchedCourseId ? selectCourseById(lastWatchedCourseId)(state) : null
  )

  const lastWatchedTimestamp = useMemo(() => {
    if (!lastWatchedCourseId || !progressData.courses[lastWatchedCourseId]) {
      return null
    }
    const courseProgress = progressData.courses[lastWatchedCourseId]
    return courseProgress.lastWatched ? formatRelativeTime(courseProgress.lastWatched) : null
  }, [lastWatchedCourseId, progressData])

  const lastWatchedProgress = useMemo(() => {
    if (!lastWatchedCourseId) return 0
    return selectCourseCompletionPercentage(lastWatchedCourseId)({ progress: progressData } as any)
  }, [lastWatchedCourseId, progressData])

  // Helper function to format relative time
  function formatRelativeTime(isoTimestamp: string): string {
    const now = new Date()
    const then = new Date(isoTimestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  // Empty state
  if (totalCoursesCount === 0) {
    return (
      <MotionBox variants={scaleIn} initial="hidden" animate="visible" sx={{ textAlign: 'center', py: 4 }}>
        <TrendingUp sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No progress data yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start watching a course to see your stats!
        </Typography>
      </MotionBox>
    )
  }

  // Compact Variant
  if (variant === 'compact') {
    return (
      <MotionPaper variants={fadeInUp} initial="hidden" animate="visible" variant="glass" sx={{ p: 2, borderRadius: 3, backdropFilter: 'blur(12px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
          <Chip
            icon={<AccessTime />}
            label={`${formattedWatchTime} watched`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<CheckCircle />}
            label={`${completedCoursesCount} completed`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<PlayCircle />}
            label={`${inProgressCoursesCount} in progress`}
            color="info"
            variant="outlined"
          />
        </Box>
      </MotionPaper>
    )
  }

  // Detailed Variant (default)
  return (
    <Box sx={{ width: '100%' }}>
      <MotionBox variants={staggerContainer} initial="hidden" animate="visible">
        <Grid container spacing={2}>
          {/* Stat Card 1: Total Watch Time */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper variants={staggerItem} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} variant="glass" sx={{ p: 2, textAlign: 'center', borderRadius: 3, transition: 'all 200ms ease', cursor: 'default', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.6)' } }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1, width: 56, height: 56, boxShadow: '0 4px 16px rgba(229,9,20,0.3)' }}>
                <AccessTime />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                {formattedWatchTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Watch Time
              </Typography>
            </MotionPaper>
          </Grid>

          {/* Stat Card 2: Completed Courses */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper variants={staggerItem} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} variant="glass" sx={{ p: 2, textAlign: 'center', borderRadius: 3, transition: 'all 200ms ease', cursor: 'default', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.6)' } }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 56, height: 56, boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                {completedCoursesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Courses Completed
              </Typography>
            </MotionPaper>
          </Grid>

          {/* Stat Card 3: In Progress */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper variants={staggerItem} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} variant="glass" sx={{ p: 2, textAlign: 'center', borderRadius: 3, transition: 'all 200ms ease', cursor: 'default', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.6)' } }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 56, height: 56, boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                <PlayCircle />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                {inProgressCoursesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </MotionPaper>
          </Grid>

          {/* Stat Card 4: Total Courses */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper variants={staggerItem} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} variant="glass" sx={{ p: 2, textAlign: 'center', borderRadius: 3, transition: 'all 200ms ease', cursor: 'default', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.6)' } }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1, width: 56, height: 56, boxShadow: '0 4px 16px rgba(178,7,16,0.3)' }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                {totalCoursesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Courses
              </Typography>
            </MotionPaper>
          </Grid>

        {/* Recent Activity Section */}
        {showRecentActivity && lastWatchedCourse && (
          <Grid item xs={12}>
            <MotionPaper variants={staggerItem} variant="glass" sx={{ p: 3, borderRadius: 3, backdropFilter: 'blur(16px)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2, borderColor: alpha('#fff', 0.08) }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    {lastWatchedCourse.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lastWatchedTimestamp && `Last watched ${lastWatchedTimestamp}`}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress:
                    </Typography>
                    <Chip
                      label={`${Math.round(lastWatchedProgress)}%`}
                      size="small"
                      color={lastWatchedProgress === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                </Box>
                <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Chip
                    label="Resume"
                    color="primary"
                    clickable
                    onClick={() => navigate(`/viewer/${lastWatchedCourseId}`)}
                    sx={{
                      fontWeight: 600,
                      px: 1,
                      transition: 'all 200ms ease',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(229,9,20,0.4)'
                      }
                    }}
                  />
                </MotionBox>
              </Box>
            </MotionPaper>
          </Grid>
        )}
      </Grid>
    </MotionBox>
    </Box>
  )
}
