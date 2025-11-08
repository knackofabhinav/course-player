/**
 * Barrel export file for all type definitions
 *
 * This allows clean imports throughout the application:
 * import { Course, ProgressData } from '@/types'
 */

// Export all types from course.ts
export type {
  Course,
  CourseSection,
  Lesson,
  CourseResource,
  CourseLink,
  CourseId,
  LessonId,
  SectionId
} from './course'

// Export all types from progress.ts
export type {
  ProgressData,
  CourseProgress,
  LessonProgress,
  ProgressState,
  LessonProgressUpdate,
  CourseProgressUpdate
} from './progress'

// Export all types from settings.ts
export type {
  AppSettings,
  SettingsState,
  KeyboardShortcut
} from './settings'

export { DEFAULT_KEYBOARD_SHORTCUTS } from './settings'

// Note: electron.d.ts is a declaration file and doesn't need to be re-exported
