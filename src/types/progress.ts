/**
 * Progress Tracking Type Definitions
 *
 * TypeScript interfaces for progress tracking data structure
 * matching the progress.json schema stored in ~/.course-player/progress.json
 */

/**
 * Progress tracking for an individual lesson
 */
export interface LessonProgress {
  completed: boolean // Whether lesson is marked as complete (90% watched threshold)
  watchedDuration: number // Total time watched in seconds (can exceed video duration if rewatched)
  lastPosition: number // Last playback position in seconds for resume functionality
  lastWatched?: string // ISO timestamp of last watch session
  completedAt?: string // ISO timestamp when lesson was marked complete
}

/**
 * Progress tracking for an entire course
 */
export interface CourseProgress {
  lastWatched: string // ISO timestamp of last activity in this course
  currentLesson: string // Lesson ID of the currently active/last watched lesson
  currentTime: number // Current playback position in the active lesson (seconds)
  lessons: Record<string, LessonProgress> // Map of lesson ID to lesson progress
  completedLessons?: number // Cached count of completed lessons for quick access
  totalLessons?: number // Cached total lesson count for progress percentage
}

/**
 * Complete progress data structure persisted to disk
 */
export interface ProgressData {
  courses: Record<string, CourseProgress> // Map of course ID to course progress
  version?: string // Schema version for future migrations (e.g., '1.0')
  lastSync?: string // ISO timestamp of last sync with file system
}

/**
 * Progress state with runtime metadata
 * Extends ProgressData with additional UI state
 */
export interface ProgressState extends ProgressData {
  isLoading: boolean // Whether progress is being loaded from disk
  isSaving: boolean // Whether progress is being saved to disk
  error: string | null // Error message if load/save fails
  isDirty: boolean // Whether there are unsaved changes
}

/**
 * Helper types for partial updates
 */
export type LessonProgressUpdate = Partial<LessonProgress>
export type CourseProgressUpdate = Partial<CourseProgress>
