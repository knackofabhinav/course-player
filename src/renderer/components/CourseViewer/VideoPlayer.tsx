/**
 * VideoPlayer Component
 *
 * Main video player wrapper using HTML5 video element.
 * Integrates with Redux for state management and progress tracking.
 * Features: auto-resume, progress tracking, native browser controls.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Box, CircularProgress, Alert, Typography, alpha } from '@mui/material'
import { MotionBox, scaleIn } from '@/animations'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setCurrentTime,
  markLessonComplete,
  updateLessonProgress,
  selectLessonProgress,
  saveProgress,
  selectProgressIsDirty,
  selectProgressIsSaving
} from '@/store/slices/progressSlice'
import {
  selectDefaultPlaybackSpeed,
  selectAutoPlayNext
} from '@/store/slices/settingsSlice'
import { loadVideoAsBlob, revokeBlobUrl } from '@/services/videoLoader'
import type { Lesson, Course } from '@/types'

interface VideoPlayerProps {
  course: Course
  lesson: Lesson
  courseFolderPath: string
  onNext?: () => void
  onPrevious?: () => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  course,
  lesson,
  courseFolderPath,
  onNext,
  onPrevious
}) => {
  const dispatch = useAppDispatch()
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const isDirtyRef = useRef<boolean>(false)
  const isSavingRef = useRef<boolean>(false)

  // State
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get lesson progress from Redux
  const lessonProgress = useAppSelector(state =>
    selectLessonProgress(course.id, lesson.id)(state)
  )

  // Get progress save state from Redux
  const isDirty = useAppSelector(selectProgressIsDirty)
  const isSaving = useAppSelector(selectProgressIsSaving)

  // Get settings from Redux
  const defaultPlaybackSpeed = useAppSelector(selectDefaultPlaybackSpeed)
  const autoPlayNextSetting = useAppSelector(selectAutoPlayNext)

  // Track isDirty and isSaving in refs for use in interval callback
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  useEffect(() => {
    isSavingRef.current = isSaving
  }, [isSaving])

  // Load video file
  useEffect(() => {
    let mounted = true
    let blobUrl: string | null = null

    const loadVideo = async () => {
      try {
        setLoading(true)
        setError(null)

        // Resolve video path
        const videoPath = lesson.videoPath.replace(/^\.\//, '')
        const separator = courseFolderPath.includes('\\') ? '\\' : '/'
        const fullPath = `${courseFolderPath}${separator}${videoPath}`

        console.log('Loading video:', fullPath)

        // Load video as Blob URL
        blobUrl = await loadVideoAsBlob(fullPath)

        if (mounted) {
          setVideoUrl(blobUrl)
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Error loading video:', err)
        if (mounted) {
          setError(err.message || 'Failed to load video')
          setLoading(false)
        }
      }
    }

    loadVideo()

    // Cleanup
    return () => {
      mounted = false
      if (blobUrl) {
        revokeBlobUrl(blobUrl)
      }
    }
  }, [lesson.id, lesson.videoPath, courseFolderPath])

  // Auto-resume from last position and set default playback speed
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return

    const video = videoRef.current
    const lastPosition = lessonProgress?.lastPosition || 0

    const handleLoadedMetadata = () => {
      // Set default playback speed
      video.playbackRate = defaultPlaybackSpeed

      // Resume from last position if > 5 seconds and < 90% complete
      if (lastPosition > 5 && lastPosition < lesson.duration * 0.9 && video.currentTime === 0) {
        video.currentTime = lastPosition
        console.log('Auto-resumed at:', lastPosition)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    // If metadata already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [videoUrl, lessonProgress, lesson.duration, lesson.id, defaultPlaybackSpeed])

  // Progress tracking
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return

    const video = videoRef.current

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      const duration = video.duration
      const now = Date.now()

      // Update current time in Redux every 2 seconds
      if (now - lastSaveTimeRef.current > 2000) {
        dispatch(
          setCurrentTime({
            courseId: course.id,
            lessonId: lesson.id,
            currentTime
          })
        )
        lastSaveTimeRef.current = now
      }

      // Mark complete at 90% threshold
      if (duration > 0 && currentTime / duration >= 0.9 && !lessonProgress?.completed) {
        dispatch(
          markLessonComplete({
            courseId: course.id,
            lessonId: lesson.id
          })
        )
        console.log('Lesson marked complete:', lesson.id)
      }
    }

    const handlePlay = () => {
      startTimeRef.current = Date.now()
    }

    const handlePause = () => {
      // Track watched duration when pausing
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      if (elapsed > 1) {
        dispatch(
          updateLessonProgress({
            courseId: course.id,
            lessonId: lesson.id,
            progress: {
              watchedDuration: (lessonProgress?.watchedDuration || 0) + elapsed,
              lastPosition: video.currentTime
            }
          })
        )
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [dispatch, course.id, lesson.id, videoUrl, lessonProgress])

  // Periodic Auto-Save: Save progress every 5 seconds if dirty
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Check if progress has changed and no save is in progress using refs
      if (isDirtyRef.current && !isSavingRef.current) {
        console.log('Auto-saving progress...')
        dispatch(saveProgress())
      }
    }, 5000) // 5 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [dispatch])

  // Handle player ended
  const handleEnded = useCallback(() => {
    // Mark as complete if not already
    if (!lessonProgress?.completed) {
      dispatch(
        markLessonComplete({
          courseId: course.id,
          lessonId: lesson.id
        })
      )
    }

    // Auto-play next lesson after 2 seconds if setting is enabled
    if (onNext && autoPlayNextSetting) {
      setTimeout(() => {
        onNext()
      }, 2000)
    }
  }, [dispatch, course.id, lesson.id, lessonProgress?.completed, onNext, autoPlayNextSetting])

  // Loading state
  if (loading) {
    return (
      <MotionBox
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 400,
          gap: 2,
          backgroundColor: alpha('#000', 0.8),
          borderRadius: 3
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#E50914',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading video...
        </Typography>
      </MotionBox>
    )
  }

  // Error state
  if (error) {
    return (
      <MotionBox variants={scaleIn} initial="hidden" animate="visible" sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            backgroundColor: alpha('#B20710', 0.15),
            border: `1px solid ${alpha('#E50914', 0.3)}`,
            '& .MuiAlert-icon': {
              color: '#E50914'
            }
          }}
        >
          <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
            Failed to load video
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', opacity: 0.7 }}>
            Video path: {lesson.videoPath}
          </Typography>
        </Alert>
      </MotionBox>
    )
  }

  // Video player
  return (
    <MotionBox
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
      }}
    >
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          title={lesson.title}
          onEnded={handleEnded}
          controls
          controlsList="nodownload"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '12px'
          }}
        />
      )}
    </MotionBox>
  )
}
