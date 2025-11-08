/**
 * File System Service
 *
 * Wraps the Electron IPC API with additional error handling, validation, and type safety.
 * Provides a clean abstraction layer between React components and the Electron IPC bridge.
 */

import type { Course } from '@/types/course'
import type { ProgressData } from '@/types/progress'

/**
 * Select a course folder using native dialog
 * @returns Selected folder path or null if cancelled
 */
export async function selectCourseFolder(): Promise<string | null> {
  try {
    // Safety check for non-Electron environments during development
    if (!window.electron) {
      console.error('window.electron is not available')
      return null
    }

    console.log('Calling window.electron.selectFolder()...')
    const folderPath = await window.electron.selectFolder()
    console.log('Raw folderPath received:', folderPath, 'Type:', typeof folderPath)

    // Guard to ensure return value is string or null
    if (folderPath !== null && typeof folderPath !== 'string') {
      console.error('Invalid folder path type:', typeof folderPath)
      return null
    }

    console.log('Selected folder:', folderPath)
    return folderPath
  } catch (error) {
    console.error('Error selecting folder:', error)
    return null
  }
}

/**
 * Load course data from a folder
 * @param folderPath Path to the folder containing course.json
 * @returns Course data object
 * @throws Error if loading fails or course structure is invalid
 */
export async function loadCourseData(folderPath: string): Promise<Course> {
  try {
    // Validate folder path
    if (!folderPath || folderPath.trim() === '') {
      throw new Error('Folder path cannot be empty')
    }

    const response = await window.electron.loadCourse(folderPath)

    // Check for error response
    if (response && typeof response === 'object' && 'success' in response && response.success === false) {
      throw new Error(response.error || 'Failed to load course')
    }

    // At this point, response is Course type
    const course = response as Course

    // Validate required course fields
    if (
      typeof course.id !== 'string' ||
      typeof course.title !== 'string' ||
      !Array.isArray(course.sections)
    ) {
      throw new Error('Invalid course structure: missing required fields')
    }

    console.log('Course loaded successfully:', course.title)
    return course
  } catch (error) {
    console.error('Error loading course data:', error)
    throw error
  }
}

/**
 * Save progress data to persistent storage
 * @param progressData Progress data to save
 * @throws Error if save fails
 */
export async function saveProgressData(progressData: ProgressData): Promise<void> {
  try {
    // Validate progress data
    if (!progressData || typeof progressData.courses !== 'object') {
      throw new Error('Progress data cannot be null or undefined')
    }

    const response = await window.electron.saveProgress(progressData)

    // Check for success
    if (!response.success) {
      throw new Error(response.error || 'Failed to save progress')
    }

    console.log('Progress saved successfully')
  } catch (error) {
    console.error('Error saving progress data:', error)
    throw error
  }
}

/**
 * Load progress data from persistent storage
 * @returns Progress data or empty structure if not found
 */
export async function loadProgressData(): Promise<ProgressData> {
  try {
    const response = await window.electron.loadProgress()

    // Check for error response
    if (response && typeof response === 'object' && 'success' in response && response.success === false) {
      console.warn('Error loading progress:', response.error)
      return { courses: {} }
    }

    console.log('Progress loaded successfully')
    return (response as ProgressData) || { courses: {} }
  } catch (error) {
    console.error('Error loading progress data:', error)
    // Return safe default instead of throwing
    return { courses: {} }
  }
}

/**
 * Read a lesson file (e.g., markdown notes, resource files)
 * @param filePath Path to the file to read
 * @returns File contents as string
 * @throws Error if file cannot be read
 */
export async function readLessonFile(filePath: string): Promise<string> {
  try {
    // Validate file path
    if (!filePath || filePath.trim() === '') {
      throw new Error('File path cannot be empty')
    }

    const response = await window.electron.readFile(filePath)

    // Check for error response
    if (typeof response === 'object' && 'success' in response && response.success === false) {
      throw new Error(response.error || 'Failed to read file')
    }

    console.log('File read successfully:', filePath)
    return response as string
  } catch (error) {
    console.error('Error reading lesson file:', error)
    throw error
  }
}

/**
 * Open a resource file with the system's default application
 * @param filePath Absolute path to the resource file
 * @throws Error if file cannot be opened
 */
export async function openResourceFile(filePath: string): Promise<void> {
  try {
    // Validate file path
    if (!filePath || filePath.trim() === '') {
      throw new Error('File path cannot be empty')
    }

    const response = await window.electron.openResource(filePath)

    // Check for error response
    if (!response.success) {
      throw new Error(response.error || 'Failed to open resource')
    }

    console.log('Opened resource:', filePath)
  } catch (error) {
    console.error('Error opening resource file:', error)
    throw error
  }
}

/**
 * Open an external URL in the default browser
 * @param url URL to open (must start with http:// or https://)
 * @throws Error if URL cannot be opened
 */
export async function openExternalLink(url: string): Promise<void> {
  try {
    // Validate URL
    if (!url || url.trim() === '') {
      throw new Error('URL cannot be empty')
    }

    // Basic URL format validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid URL format. URL must start with http:// or https://')
    }

    const response = await window.electron.openExternalLink(url)

    // Check for error response
    if (!response.success) {
      throw new Error(response.error || 'Failed to open external link')
    }

    console.log('Opened external link:', url)
  } catch (error) {
    console.error('Error opening external link:', error)
    throw error
  }
}
