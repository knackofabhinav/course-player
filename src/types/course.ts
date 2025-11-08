/**
 * Course Type Definitions
 *
 * Comprehensive TypeScript interfaces for the course data structure
 * matching the course.json schema.
 */

// Type aliases for improved readability
export type CourseId = string
export type LessonId = string
export type SectionId = string

/**
 * Downloadable resource attached to a lesson
 */
export interface CourseResource {
  title: string
  path: string // Relative path to resource file (e.g., './resources/starter.zip')
  type?: string // Optional MIME type or file extension
}

/**
 * External reference link for a lesson
 */
export interface CourseLink {
  title: string
  url: string // External URL (e.g., 'https://react.dev')
  description?: string
}

/**
 * Individual lesson within a course section
 */
export interface Lesson {
  id: LessonId
  title: string
  videoPath: string // Relative path to video file (e.g., './videos/01-intro.mp4')
  duration: number // Video duration in seconds
  notes?: string // Optional path to markdown notes file (e.g., './notes/01-notes.md')
  description?: string
  resources?: CourseResource[]
  links?: CourseLink[]
  order?: number // Optional explicit ordering
}

/**
 * Course section containing multiple lessons
 */
export interface CourseSection {
  id: SectionId
  title: string
  description?: string
  lessons: Lesson[]
  order?: number // Optional explicit ordering
}

/**
 * Complete course structure
 */
export interface Course {
  id: CourseId
  title: string
  description?: string
  thumbnail?: string // Relative path to thumbnail image (e.g., './thumbnail.jpg')
  instructor?: string
  duration?: number // Total course duration in seconds (can be calculated from lessons)
  tags?: string[]
  sections: CourseSection[]
  folderPath?: string // Absolute path to course folder (added at runtime, not in JSON)
  createdAt?: string // ISO timestamp when course was added
  updatedAt?: string // ISO timestamp when course was last modified
}
