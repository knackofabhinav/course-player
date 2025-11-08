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
}

// Augment the global Window interface
declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
