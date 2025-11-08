/**
 * Video Loader Service
 *
 * Handles loading local video files and converting them to Blob URLs
 * for playback in the video player. Uses Electron IPC to read video files
 * securely from the file system.
 */

import type { Course } from '@/types'

/**
 * Load a video file from the file system and convert it to a Blob URL
 * @param filePath - Absolute path to the video file
 * @returns Blob URL string for use in video player src
 * @throws Error if file cannot be read or is invalid
 */
export async function loadVideoAsBlob(filePath: string): Promise<string> {
  try {
    // Read video file via IPC
    const result = await window.electron.readVideoFile(filePath)

    // Check for error response
    if (result && typeof result === 'object' && 'success' in result && !result.success) {
      throw new Error(result.error || 'Failed to load video file')
    }

    // Result is ArrayBuffer
    const arrayBuffer = result as ArrayBuffer

    // Determine MIME type from file extension
    const mimeType = getMimeTypeFromPath(filePath)

    // Create Blob from ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: mimeType })

    // Create and return Blob URL
    const blobUrl = URL.createObjectURL(blob)
    console.log('Created Blob URL for video:', filePath, '→', blobUrl)

    return blobUrl
  } catch (error) {
    console.error('Error loading video file:', filePath, error)
    throw error
  }
}

/**
 * Revoke a Blob URL to free up memory
 * Call this when the video player is unmounted or when switching videos
 * @param blobUrl - The Blob URL to revoke
 */
export function revokeBlobUrl(blobUrl: string): void {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl)
    console.log('Revoked Blob URL:', blobUrl)
  }
}

/**
 * Get MIME type from file path based on extension
 * @param filePath - Path to the video file
 * @returns MIME type string
 */
export function getMimeTypeFromPath(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    m4v: 'video/mp4',
    '3gp': 'video/3gpp'
  }

  return mimeTypes[extension || ''] || 'video/mp4' // Default to mp4
}

/**
 * Resolve video path from course folder and relative path
 * @param courseFolderPath - Absolute path to the course folder
 * @param videoPath - Relative path to the video file from course.json
 * @returns Absolute path to the video file
 */
export function resolveVideoPath(courseFolderPath: string, videoPath: string): string {
  // Remove leading ./ if present
  const cleanPath = videoPath.replace(/^\.\//, '')

  // Join course folder path with video path
  // On Windows, this will handle backslashes correctly
  // On Unix, this will handle forward slashes correctly
  const separator = courseFolderPath.includes('\\') ? '\\' : '/'
  return `${courseFolderPath}${separator}${cleanPath}`
}

/**
 * Find a lesson by ID in a course
 * @param course - Course object
 * @param lessonId - Lesson ID to find
 * @returns Lesson object or null if not found
 */
export function findLessonById(course: Course, lessonId: string) {
  for (const section of course.sections) {
    const lesson = section.lessons.find(l => l.id === lessonId)
    if (lesson) {
      return { lesson, section }
    }
  }
  return null
}

/**
 * Load an image file from the file system and convert it to a Blob URL
 * @param filePath - Absolute path to the image file
 * @returns Blob URL string for use in img src
 * @throws Error if file cannot be read or is invalid
 */
export async function loadImageAsBlob(filePath: string): Promise<string> {
  try {
    // Read image file via IPC
    const result = await window.electron.readImageFile(filePath)

    // Check for error response
    if (result && typeof result === 'object' && 'success' in result && !result.success) {
      throw new Error(result.error || 'Failed to load image file')
    }

    // Result is ArrayBuffer
    const arrayBuffer = result as ArrayBuffer

    // Determine MIME type from file extension
    const mimeType = getImageMimeTypeFromPath(filePath)

    // Create Blob from ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: mimeType })

    // Create and return Blob URL
    const blobUrl = URL.createObjectURL(blob)
    console.log('Created Blob URL for image:', filePath, '→', blobUrl)

    return blobUrl
  } catch (error) {
    console.error('Error loading image file:', filePath, error)
    throw error
  }
}

/**
 * Get image MIME type from file path based on extension
 * @param filePath - Path to the image file
 * @returns MIME type string
 */
export function getImageMimeTypeFromPath(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon'
  }

  return mimeTypes[extension || ''] || 'image/jpeg' // Default to jpeg
}
