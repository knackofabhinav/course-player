/**
 * Course Loader Service
 *
 * Utility functions for course data processing, validation, and formatting
 */

import type { Course } from '@/types'

/**
 * Calculate total duration of all lessons in a course
 */
export function calculateCourseDuration(course: Course): number {
  let totalDuration = 0

  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      totalDuration += lesson.duration || 0
    }
  }

  return totalDuration
}

/**
 * Calculate total number of lessons in a course
 */
export function calculateTotalLessons(course: Course): number {
  let totalLessons = 0

  for (const section of course.sections) {
    totalLessons += section.lessons.length
  }

  return totalLessons
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0m'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  if (secs > 0 && hours === 0) {
    // Only show seconds if less than 1 hour
    parts.push(`${secs}s`)
  }

  return parts.join(' ') || '0m'
}

/**
 * Resolve thumbnail path to absolute file path
 * Returns the absolute path that can be used with loadImageAsBlob()
 */
export function resolveThumbnailPath(course: Course): string | null {
  if (!course.thumbnail || !course.folderPath) {
    return null
  }

  // Remove leading ./ if present
  const cleanPath = course.thumbnail.replace(/^\.\//, '')

  // Construct absolute file path
  const separator = course.folderPath.includes('\\') ? '\\' : '/'
  return `${course.folderPath}${separator}${cleanPath}`
}

/**
 * Validate course structure
 */
export function validateCourseStructure(courseData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required fields
  if (!courseData.id) {
    errors.push('Missing required field: id')
  }
  if (!courseData.title) {
    errors.push('Missing required field: title')
  }
  if (!courseData.sections) {
    errors.push('Missing required field: sections')
  }

  // Validate sections
  if (courseData.sections && !Array.isArray(courseData.sections)) {
    errors.push('sections must be an array')
  } else if (courseData.sections && courseData.sections.length === 0) {
    errors.push('sections array cannot be empty')
  } else if (courseData.sections) {
    courseData.sections.forEach((section: any, sectionIndex: number) => {
      if (!section.id) {
        errors.push(`Section ${sectionIndex}: missing id`)
      }
      if (!section.title) {
        errors.push(`Section ${sectionIndex}: missing title`)
      }
      if (!section.lessons) {
        errors.push(`Section ${sectionIndex}: missing lessons array`)
      } else if (!Array.isArray(section.lessons)) {
        errors.push(`Section ${sectionIndex}: lessons must be an array`)
      } else {
        section.lessons.forEach((lesson: any, lessonIndex: number) => {
          if (!lesson.id) {
            errors.push(`Section ${sectionIndex}, Lesson ${lessonIndex}: missing id`)
          }
          if (!lesson.title) {
            errors.push(`Section ${sectionIndex}, Lesson ${lessonIndex}: missing title`)
          }
          if (!lesson.videoPath) {
            errors.push(`Section ${sectionIndex}, Lesson ${lessonIndex}: missing videoPath`)
          }
          if (lesson.duration === undefined || lesson.duration === null) {
            errors.push(`Section ${sectionIndex}, Lesson ${lessonIndex}: missing duration`)
          }
        })
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Enrich course metadata with calculated fields
 */
export function enrichCourseMetadata(course: Course): Course {
  const enriched = { ...course }

  // Calculate and add duration if missing
  if (!enriched.duration) {
    enriched.duration = calculateCourseDuration(course)
  }

  // Add total lessons count
  enriched.totalLessons = calculateTotalLessons(course)

  // Add createdAt timestamp if missing
  if (!enriched.createdAt) {
    enriched.createdAt = new Date().toISOString()
  }

  return enriched
}
