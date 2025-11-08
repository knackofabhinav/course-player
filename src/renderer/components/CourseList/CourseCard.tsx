import { useMemo, useState, useEffect } from 'react'
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  alpha
} from '@mui/material'
import { ProgressBar } from '@/components/Progress'
import { PlayCircle, Person, Schedule, VideoLibrary } from '@mui/icons-material'
import type { Course } from '@/types'
import { formatDuration, resolveThumbnailPath, calculateTotalLessons } from '@/services/courseLoader'
import { loadImageAsBlob, revokeBlobUrl } from '@/services/videoLoader'
import { MotionCard, hoverLift } from '@/animations'

interface CourseCardProps {
  course: Course
  progressPercent: number
  onClick: () => void
}

export default function CourseCard({ course, progressPercent, onClick }: CourseCardProps) {
  // State for thumbnail
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  // Computed values
  const totalLessons = useMemo(() => calculateTotalLessons(course), [course])
  const formattedDuration = useMemo(() => formatDuration(course.duration || 0), [course.duration])
  const hasProgress = progressPercent > 0

  // Load thumbnail asynchronously
  useEffect(() => {
    let mounted = true
    let blobUrl: string | null = null

    const loadThumbnail = async () => {
      const thumbnailPath = resolveThumbnailPath(course)
      if (!thumbnailPath) {
        setThumbnailUrl(null)
        return
      }

      try {
        blobUrl = await loadImageAsBlob(thumbnailPath)
        if (mounted) {
          setThumbnailUrl(blobUrl)
        }
      } catch (error) {
        console.error('Failed to load thumbnail:', error)
        if (mounted) {
          setThumbnailUrl(null)
        }
      }
    }

    loadThumbnail()

    return () => {
      mounted = false
      if (blobUrl) {
        revokeBlobUrl(blobUrl)
      }
    }
  }, [course.id, course.thumbnail, course.folderPath])

  return (
    <MotionCard
      variants={hoverLift}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        willChange: 'transform',
        '&:hover .thumbnail-overlay': {
          opacity: 1
        },
        '&:hover .MuiCardMedia-root': {
          transform: 'scale(1.05)'
        }
      }}
    >
      <CardActionArea onClick={onClick} aria-label={`Open ${course.title}`}>
        {/* Thumbnail Section */}
        {thumbnailUrl ? (
          <>
            <CardMedia
              component="img"
              height="180"
              image={thumbnailUrl}
              alt={`${course.title} thumbnail`}
              sx={{
                objectFit: 'cover',
                transition: 'transform 300ms ease'
              }}
            />
            <Box
              className="thumbnail-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 180,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                opacity: 0,
                transition: 'opacity 300ms ease',
                pointerEvents: 'none'
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => `linear-gradient(135deg, ${alpha('#E50914', 0.1)} 0%, ${alpha('#B20710', 0.05)} 100%)`
            }}
          >
            <VideoLibrary sx={{ fontSize: 80, color: alpha('#fff', 0.3) }} />
          </Box>
        )}

        {/* Content Section */}
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          {/* Course Title */}
          <Typography variant="h6" noWrap gutterBottom title={course.title} sx={{ fontWeight: 700 }}>
            {course.title}
          </Typography>

          {/* Instructor */}
          {course.instructor && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Person sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {course.instructor}
              </Typography>
            </Box>
          )}

          {/* Description */}
          {course.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {course.description}
            </Typography>
          )}

          {/* Metadata Row */}
          <Box sx={{ display: 'flex', gap: 1, mb: hasProgress ? 2 : 0, flexWrap: 'wrap' }}>
            <Chip
              icon={<PlayCircle />}
              label={`${totalLessons} lesson${totalLessons !== 1 ? 's' : ''}`}
              size="small"
              sx={{ backdropFilter: 'blur(4px)' }}
            />
            <Chip icon={<Schedule />} label={formattedDuration} size="small" sx={{ backdropFilter: 'blur(4px)' }} />
          </Box>

          {/* Progress Section */}
          {hasProgress && (
            <ProgressBar
              value={progressPercent}
              total={100}
              showPercentage={true}
              size="small"
              showIcon={false}
              color="primary"
              sx={{ '& .MuiLinearProgress-bar': { boxShadow: '0 0 12px rgba(229,9,20,0.6)' } }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </MotionCard>
  )
}
