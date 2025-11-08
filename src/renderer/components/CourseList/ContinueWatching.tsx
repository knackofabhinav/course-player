/**
 * ContinueWatching Component
 *
 * Displays the most recently watched course with resume functionality.
 */

import { useMemo } from 'react'
import { Box, Paper, Typography, Button, Chip, LinearProgress, alpha } from '@mui/material'
import { PlayArrow, Schedule } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import {
  selectLastWatchedCourse,
  selectCourseProgress,
  selectCourseCompletionPercentage
} from '@/store/slices/progressSlice'
import { selectCourseById } from '@/store/slices/coursesSlice'
import { formatDuration } from '@/services/courseLoader'
import { MotionPaper, fadeInUp } from '@/animations'

export function ContinueWatching() {
  const navigate = useNavigate()

  const lastWatchedCourseId = useAppSelector(selectLastWatchedCourse)
  const course = useAppSelector((state) =>
    lastWatchedCourseId ? selectCourseById(lastWatchedCourseId)(state) : null
  )
  const courseProgress = useAppSelector((state) =>
    lastWatchedCourseId ? selectCourseProgress(lastWatchedCourseId)(state) : null
  )
  const completionPercent = useAppSelector((state) =>
    lastWatchedCourseId ? selectCourseCompletionPercentage(lastWatchedCourseId)(state) : 0
  )

  const lastWatchedTime = useMemo(() => {
    if (!courseProgress?.lastWatched) return null

    const now = new Date()
    const then = new Date(courseProgress.lastWatched)
    const diffMs = now.getTime() - then.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  }, [courseProgress])

  if (!course || !lastWatchedCourseId) {
    return null
  }

  const handleResume = () => {
    navigate(`/viewer/${course.id}`)
  }

  return (
    <MotionPaper
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      elevation={0}
      variant="glass"
      sx={{
        p: 4,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(229,9,20,0.95) 0%, rgba(178,7,16,0.85) 50%, rgba(0,0,0,0.7) 100%)',
        color: 'white',
        borderRadius: 4,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 12px 40px rgba(229,9,20,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Left Section: Course Info */}
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, letterSpacing: 1.2 }}>
            Continue Watching
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            {course.title}
          </Typography>

          {/* Metadata Chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`${Math.round(completionPercent)}% Complete`}
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}
            />
            {lastWatchedTime && (
              <Chip
                icon={<Schedule sx={{ color: 'white !important' }} />}
                label={`Watched ${lastWatchedTime}`}
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={completionPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
                boxShadow: '0 0 16px rgba(255,255,255,0.8)'
              }
            }}
          />
        </Box>

        {/* Right Section: Resume Button */}
        <Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow sx={{ color: '#000 !important' }} />}
            onClick={handleResume}
            sx={{
              bgcolor: '#ffffff',
              color: '#000000 !important',
              fontWeight: 700,
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#ffffff',
                transform: 'scale(1.05)',
                boxShadow: '0 8px 24px rgba(255,255,255,0.4)'
              },
              '& .MuiButton-startIcon': {
                color: '#000000'
              },
              transition: 'all 200ms ease'
            }}
          >
            Resume
          </Button>
        </Box>
      </Box>
    </MotionPaper>
  )
}
