/**
 * Player Redux Slice
 *
 * Manages video player state including current lesson, playback position,
 * speed, volume, and player status
 */

import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// State interface
export interface PlayerState {
  currentCourseId: string | null
  currentLessonId: string | null
  currentTime: number
  duration: number
  isPlaying: boolean
  playbackSpeed: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  isPictureInPicture: boolean
  isBuffering: boolean
  error: string | null
  autoPlayNext: boolean
}

// Initial state
const initialState: PlayerState = {
  currentCourseId: null,
  currentLessonId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackSpeed: 1.0,
  volume: 1.0,
  isMuted: false,
  isFullscreen: false,
  isPictureInPicture: false,
  isBuffering: false,
  error: null,
  autoPlayNext: true
}

// Slice definition
const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentLesson: (
      state,
      action: PayloadAction<{ courseId: string; lessonId: string; duration: number }>
    ) => {
      state.currentCourseId = action.payload.courseId
      state.currentLessonId = action.payload.lessonId
      state.duration = action.payload.duration
      state.currentTime = 0
      state.error = null
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload
    },

    play: (state) => {
      state.isPlaying = true
      state.isBuffering = false
    },

    pause: (state) => {
      state.isPlaying = false
    },

    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      // Validate allowed playback speeds
      const allowedSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
      if (allowedSpeeds.includes(action.payload)) {
        state.playbackSpeed = action.payload
      }
    },

    setVolume: (state, action: PayloadAction<number>) => {
      // Clamp volume between 0.0 and 1.0
      state.volume = Math.max(0, Math.min(1, action.payload))
      // Automatically unmute if volume > 0
      if (state.volume > 0) {
        state.isMuted = false
      }
    },

    toggleMute: (state) => {
      state.isMuted = !state.isMuted
    },

    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload
    },

    setPictureInPicture: (state, action: PayloadAction<boolean>) => {
      state.isPictureInPicture = action.payload
    },

    setBuffering: (state, action: PayloadAction<boolean>) => {
      state.isBuffering = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      // Pause playback when error occurs
      if (action.payload) {
        state.isPlaying = false
      }
    },

    clearError: (state) => {
      state.error = null
    },

    setAutoPlayNext: (state, action: PayloadAction<boolean>) => {
      state.autoPlayNext = action.payload
    },

    resetPlayer: () => initialState
  }
})

// Selectors
export const selectCurrentLesson = (state: RootState) => ({
  courseId: state.player.currentCourseId,
  lessonId: state.player.currentLessonId
})

export const selectCurrentTime = (state: RootState) => state.player.currentTime

export const selectDuration = (state: RootState) => state.player.duration

export const selectIsPlaying = (state: RootState) => state.player.isPlaying

export const selectPlaybackSpeed = (state: RootState) => state.player.playbackSpeed

export const selectVolume = (state: RootState) => state.player.volume

export const selectIsMuted = (state: RootState) => state.player.isMuted

export const selectIsFullscreen = (state: RootState) => state.player.isFullscreen

export const selectIsPictureInPicture = (state: RootState) => state.player.isPictureInPicture

export const selectIsBuffering = (state: RootState) => state.player.isBuffering

export const selectPlayerError = (state: RootState) => state.player.error

export const selectAutoPlayNext = (state: RootState) => state.player.autoPlayNext

export const selectPlaybackProgress = createSelector(
  [selectCurrentTime, selectDuration],
  (currentTime, duration) => {
    if (duration === 0) return 0
    return (currentTime / duration) * 100
  }
)

// Export actions and reducer
export const {
  setCurrentLesson,
  setCurrentTime,
  setDuration,
  play,
  pause,
  togglePlayPause,
  setPlaybackSpeed,
  setVolume,
  toggleMute,
  setFullscreen,
  setPictureInPicture,
  setBuffering,
  setError,
  clearError,
  setAutoPlayNext,
  resetPlayer
} = playerSlice.actions

export default playerSlice.reducer
