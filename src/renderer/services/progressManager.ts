/**
 * Progress Manager Service
 *
 * Provides a clean API for progress operations with enhanced features like
 * debouncing, retry logic, and validation. Wraps the basic fileSystem.ts
 * functions with additional reliability features.
 */

import { saveProgressData, loadProgressData } from '@/services/fileSystem'
import type { ProgressData } from '@/types/progress'

/**
 * Save progress data with automatic retry on failure
 * @param progressData Progress data to save
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @throws Error if all retry attempts fail
 */
export async function saveProgressWithRetry(
  progressData: ProgressData,
  maxRetries = 3
): Promise<void> {
  // Validate progress data structure
  if (!progressData || typeof progressData.courses !== 'object') {
    throw new Error('Invalid progress data: courses object is required')
  }

  let lastError: Error | null = null
  const delays = [1000, 2000, 4000] // Exponential backoff delays in ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Saving progress (attempt ${attempt + 1}/${maxRetries})...`)
      await saveProgressData(progressData)
      console.log('Progress saved successfully')
      return // Success, exit function
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error during save')
      console.error(`Save attempt ${attempt + 1} failed:`, lastError.message)

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        const delay = delays[attempt] || 4000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed
  throw new Error(
    `Failed to save progress after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * Load progress data with safe fallback
 * @returns Progress data or safe default if load fails
 */
export async function loadProgressWithFallback(): Promise<ProgressData> {
  try {
    const data = await loadProgressData()

    // Validate loaded data
    if (!validateProgressData(data)) {
      console.warn('Loaded progress data is invalid, using default')
      return { courses: {} }
    }

    console.log('Progress loaded successfully')
    return data
  } catch (error) {
    console.error('Error loading progress:', error)
    console.log('Using default progress data')
    return { courses: {} }
  }
}

/**
 * Create a debounced version of save function
 * @param delay Delay in milliseconds before save executes (default: 1000)
 * @returns Debounced save function
 */
export function createDebouncedSave(
  delay = 1000
): (progressData: ProgressData) => Promise<void> {
  let timeoutId: NodeJS.Timeout | null = null
  let pendingData: ProgressData | null = null
  let pendingResolve: ((value: void) => void) | null = null
  let pendingReject: ((reason: Error) => void) | null = null

  return (progressData: ProgressData): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Cancel pending save
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        // Reject the previous promise
        if (pendingReject) {
          pendingReject(new Error('Save cancelled by newer save request'))
        }
      }

      // Store new data and promise handlers
      pendingData = progressData
      pendingResolve = resolve
      pendingReject = reject

      // Schedule save
      timeoutId = setTimeout(async () => {
        try {
          if (pendingData) {
            await saveProgressWithRetry(pendingData)
            if (pendingResolve) {
              pendingResolve()
            }
          }
        } catch (error) {
          if (pendingReject) {
            pendingReject(error instanceof Error ? error : new Error('Unknown error'))
          }
        } finally {
          timeoutId = null
          pendingData = null
          pendingResolve = null
          pendingReject = null
        }
      }, delay)
    })
  }
}

/**
 * Validate progress data structure
 * @param data Data to validate
 * @returns True if data is valid ProgressData
 */
export function validateProgressData(data: any): data is ProgressData {
  // Check if data is object and not null
  if (!data || typeof data !== 'object') {
    return false
  }

  // Check if courses property exists and is object
  if (!data.courses || typeof data.courses !== 'object') {
    return false
  }

  // Validate each course progress structure
  for (const courseId in data.courses) {
    const courseProgress = data.courses[courseId]

    // Check required fields
    if (typeof courseProgress !== 'object') {
      return false
    }

    // Validate optional fields if they exist
    if (courseProgress.lessons && typeof courseProgress.lessons !== 'object') {
      return false
    }

    if (courseProgress.totalLessons !== undefined && typeof courseProgress.totalLessons !== 'number') {
      return false
    }

    if (courseProgress.completedLessons !== undefined && typeof courseProgress.completedLessons !== 'number') {
      return false
    }

    // Validate lesson progress if lessons exist
    if (courseProgress.lessons) {
      for (const lessonId in courseProgress.lessons) {
        const lessonProgress = courseProgress.lessons[lessonId]

        if (typeof lessonProgress !== 'object') {
          return false
        }

        // Validate lesson progress fields
        if (lessonProgress.completed !== undefined && typeof lessonProgress.completed !== 'boolean') {
          return false
        }

        if (lessonProgress.watchedDuration !== undefined && typeof lessonProgress.watchedDuration !== 'number') {
          return false
        }

        if (lessonProgress.lastPosition !== undefined && typeof lessonProgress.lastPosition !== 'number') {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Merge two progress data objects
 * @param existing Existing progress data
 * @param incoming New progress data to merge
 * @returns Merged progress data
 */
export function mergeProgressData(existing: ProgressData, incoming: ProgressData): ProgressData {
  const merged: ProgressData = {
    courses: { ...existing.courses }
  }

  // Merge each course
  for (const courseId in incoming.courses) {
    const incomingCourse = incoming.courses[courseId]
    const existingCourse = existing.courses[courseId]

    if (!existingCourse) {
      // New course, just add it
      merged.courses[courseId] = incomingCourse
    } else {
      // Merge course progress
      merged.courses[courseId] = {
        ...existingCourse,
        ...incomingCourse,
        // Keep most recent lastWatched
        lastWatched:
          incomingCourse.lastWatched && existingCourse.lastWatched
            ? new Date(incomingCourse.lastWatched) > new Date(existingCourse.lastWatched)
              ? incomingCourse.lastWatched
              : existingCourse.lastWatched
            : incomingCourse.lastWatched || existingCourse.lastWatched,
        // Merge lessons
        lessons: {
          ...(existingCourse.lessons || {}),
          ...(incomingCourse.lessons || {})
        }
      }

      // For each lesson, keep higher watchedDuration and preserve completion
      if (merged.courses[courseId].lessons) {
        for (const lessonId in merged.courses[courseId].lessons) {
          const incomingLesson = incomingCourse.lessons?.[lessonId]
          const existingLesson = existingCourse.lessons?.[lessonId]

          if (incomingLesson && existingLesson) {
            merged.courses[courseId].lessons![lessonId] = {
              ...existingLesson,
              ...incomingLesson,
              // Keep higher watched duration
              watchedDuration: Math.max(
                incomingLesson.watchedDuration || 0,
                existingLesson.watchedDuration || 0
              ),
              // Maintain completion status (once complete, stays complete)
              completed: incomingLesson.completed || existingLesson.completed || false,
              // Keep earliest completion date if both exist
              completedAt:
                incomingLesson.completedAt && existingLesson.completedAt
                  ? new Date(incomingLesson.completedAt) < new Date(existingLesson.completedAt)
                    ? incomingLesson.completedAt
                    : existingLesson.completedAt
                  : incomingLesson.completedAt || existingLesson.completedAt
            }
          }
        }
      }
    }
  }

  return merged
}
