// Type definitions for Electron API exposed via preload script
// This file provides TypeScript IntelliSense for window.electron

import type { Course } from './course'
import type { ProgressData } from './progress'

// Helper type for consistent error handling
type ErrorResponse = {
  success: false
  error: string
}

// Electron API interface
interface ElectronAPI {
  // Version information for debugging
  versions: {
    node: string
    chrome: string
    electron: string
  }

  // Folder selection dialog
  selectFolder: () => Promise<string | null>

  // Load course data from folder
  loadCourse: (folderPath: string) => Promise<Course | ErrorResponse>

  // Save progress data
  saveProgress: (progressData: ProgressData) => Promise<{ success: boolean; error?: string }>

  // Read file contents
  readFile: (filePath: string) => Promise<string | ErrorResponse>

  // Load progress data
  loadProgress: () => Promise<ProgressData | ErrorResponse>

  // Read video file as binary data
  readVideoFile: (filePath: string) => Promise<ArrayBuffer | ErrorResponse>

  // Read image file as binary data
  readImageFile: (filePath: string) => Promise<ArrayBuffer | ErrorResponse>

  // Open resource file with default application
  openResource: (filePath: string) => Promise<{ success: boolean; error?: string }>

  // Open external link in default browser
  openExternalLink: (url: string) => Promise<{ success: boolean; error?: string }>

  // Export progress data - opens save dialog
  exportProgress: () => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>

  // Import progress data - opens file dialog and returns data
  importProgress: () => Promise<{ success: boolean; data?: ProgressData; canceled?: boolean; error?: string }>

  // Write file to disk
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
}

// Augment the global Window interface
declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
