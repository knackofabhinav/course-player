import { app, BrowserWindow, ipcMain, dialog, session, shell } from 'electron'
import { join } from 'path'
import { promises as fs, existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  // Configure CSP to allow blob URLs for media (video/audio)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "media-src 'self' blob:; " +
          "img-src 'self' data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "font-src 'self' data:; " +
          "connect-src 'self' ws: wss:;"
        ]
      }
    })
  })

  // Load the appropriate URL based on environment
  if (app.isPackaged) {
    // Production: load from file
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    // Development: load from dev server (electron-vite provides this)
    const url = process.env['ELECTRON_RENDERER_URL']
    if (url) {
      mainWindow.loadURL(url)
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle handlers
app.on('ready', () => {
  createWindow()

  // IPC Handler: select-folder
  ipcMain.handle('select-folder', async () => {
    try {
      if (!mainWindow) {
        console.error('Main window not available')
        return null
      }
      console.log('Opening folder selection dialog...')
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
      })
      console.log('Dialog result:', result)
      console.log('Canceled:', result.canceled)
      console.log('File paths:', result.filePaths)
      return result.canceled ? null : result.filePaths[0]
    } catch (error) {
      console.error('Error in select-folder:', error)
      return null
    }
  })

  // IPC Handler: load-course
  ipcMain.handle('load-course', async (_event, folderPath: string) => {
    try {
      const coursePath = join(folderPath, 'course.json')
      const fileContents = await fs.readFile(coursePath, 'utf-8')
      const courseData = JSON.parse(fileContents)

      // Validate basic structure
      if (
        typeof courseData.id !== 'string' ||
        typeof courseData.title !== 'string' ||
        !Array.isArray(courseData.sections)
      ) {
        return {
          success: false,
          error: 'Invalid course structure'
        }
      }

      return courseData
    } catch (error: any) {
      console.error('Error in load-course:', error)
      if (error.code === 'ENOENT') {
        return { success: false, error: 'Course file not found: course.json' }
      } else if (error instanceof SyntaxError) {
        return { success: false, error: 'Invalid JSON in course.json' }
      }
      return { success: false, error: error.message || 'Failed to load course' }
    }
  })

  // IPC Handler: save-progress
  ipcMain.handle('save-progress', async (_event, progressData: any) => {
    try {
      const progressDir = join(homedir(), '.course-player')
      const progressPath = join(progressDir, 'progress.json')

      // Ensure .course-player directory exists
      if (!existsSync(progressDir)) {
        mkdirSync(progressDir, { recursive: true })
      }

      // Write progress data
      await fs.writeFile(progressPath, JSON.stringify(progressData, null, 2), 'utf-8')
      return { success: true }
    } catch (error: any) {
      console.error('Error in save-progress:', error)
      return { success: false, error: error.message || 'Failed to save progress' }
    }
  })

  // IPC Handler: read-file
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    try {
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) {
        return { success: false, error: 'Not a file' }
      }

      const contents = await fs.readFile(filePath, 'utf-8')
      return contents
    } catch (error: any) {
      console.error('Error in read-file:', error)
      if (error.code === 'ENOENT') {
        return { success: false, error: 'File not found' }
      } else if (error.code === 'EACCES') {
        return { success: false, error: 'Permission denied' }
      }
      return { success: false, error: error.message || 'Failed to read file' }
    }
  })

  // IPC Handler: load-progress
  ipcMain.handle('load-progress', async () => {
    try {
      const progressPath = join(homedir(), '.course-player', 'progress.json')

      if (!existsSync(progressPath)) {
        return { courses: {} }
      }

      const fileContents = await fs.readFile(progressPath, 'utf-8')
      return JSON.parse(fileContents)
    } catch (error: any) {
      console.error('Error in load-progress:', error)
      if (error instanceof SyntaxError) {
        return { success: false, error: 'Corrupted progress file' }
      }
      return { courses: {} }
    }
  })

  // IPC Handler: read-video-file
  ipcMain.handle('read-video-file', async (_event, filePath: string) => {
    try {
      // Validate filePath parameter
      if (!filePath || filePath.trim() === '') {
        return { success: false, error: 'Invalid file path' }
      }

      // Check if file exists
      if (!existsSync(filePath)) {
        return { success: false, error: 'Video file not found' }
      }

      // Get file stats to verify it's a file
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) {
        return { success: false, error: 'Path is not a file' }
      }

      console.log('Reading video file:', filePath, 'Size:', stats.size, 'bytes')

      // Read file as Buffer (binary data)
      const buffer = await fs.readFile(filePath)

      // Convert Buffer to ArrayBuffer for transfer to renderer
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      )

      return arrayBuffer
    } catch (error: any) {
      console.error('Error in read-video-file:', error)
      if (error.code === 'ENOENT') {
        return { success: false, error: 'Video file not found' }
      } else if (error.code === 'EACCES') {
        return { success: false, error: 'Permission denied' }
      }
      return { success: false, error: error.message || 'Failed to read video file' }
    }
  })

  // IPC Handler: read-image-file
  ipcMain.handle('read-image-file', async (_event, filePath: string) => {
    try {
      // Validate filePath parameter
      if (!filePath || filePath.trim() === '') {
        return { success: false, error: 'Invalid file path' }
      }

      // Check if file exists
      if (!existsSync(filePath)) {
        return { success: false, error: 'Image file not found' }
      }

      // Get file stats to verify it's a file
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) {
        return { success: false, error: 'Path is not a file' }
      }

      console.log('Reading image file:', filePath, 'Size:', stats.size, 'bytes')

      // Read file as Buffer (binary data)
      const buffer = await fs.readFile(filePath)

      // Convert Buffer to ArrayBuffer for transfer to renderer
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      )

      return arrayBuffer
    } catch (error: any) {
      console.error('Error in read-image-file:', error)
      if (error.code === 'ENOENT') {
        return { success: false, error: 'Image file not found' }
      } else if (error.code === 'EACCES') {
        return { success: false, error: 'Permission denied' }
      }
      return { success: false, error: error.message || 'Failed to read image file' }
    }
  })

  // IPC Handler: open-resource
  ipcMain.handle('open-resource', async (_event, filePath: string) => {
    try {
      console.log('Opening resource:', filePath)

      // Validate filePath parameter
      if (!filePath || filePath.trim() === '') {
        return { success: false, error: 'Invalid file path' }
      }

      // Check if file exists
      if (!existsSync(filePath)) {
        return { success: false, error: 'Resource file not found' }
      }

      // Open file with default application
      const errorMessage = await shell.openPath(filePath)

      // shell.openPath returns empty string on success, error message on failure
      if (errorMessage === '') {
        return { success: true }
      } else {
        return { success: false, error: errorMessage }
      }
    } catch (error: any) {
      console.error('Error in open-resource:', error)
      return { success: false, error: error.message || 'Failed to open resource' }
    }
  })

  // IPC Handler: open-external-link
  ipcMain.handle('open-external-link', async (_event, url: string) => {
    try {
      console.log('Opening external link:', url)

      // Validate url parameter
      if (!url || url.trim() === '') {
        return { success: false, error: 'Invalid URL' }
      }

      // Validate URL format (must start with http:// or https://)
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { success: false, error: 'Invalid URL format. URL must start with http:// or https://' }
      }

      // Open URL in default browser
      await shell.openExternal(url)
      return { success: true }
    } catch (error: any) {
      console.error('Error in open-external-link:', error)
      return { success: false, error: error.message || 'Failed to open external link' }
    }
  })

  // IPC Handler: export-progress
  ipcMain.handle('export-progress', async (_event, progressData: any) => {
    try {
      if (!mainWindow) {
        console.error('Main window not available')
        return { success: false, error: 'Main window not available' }
      }

      console.log('Opening save dialog for progress export...')
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Progress Data',
        defaultPath: `course-player-progress-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { canceled: true }
      }

      // Write progress data to file in main process
      await fs.writeFile(result.filePath, JSON.stringify(progressData, null, 2), 'utf-8')

      return { success: true, filePath: result.filePath }
    } catch (error: any) {
      console.error('Error in export-progress:', error)
      return { success: false, error: error.message || 'Failed to export progress' }
    }
  })

  // IPC Handler: import-progress
  ipcMain.handle('import-progress', async () => {
    try {
      if (!mainWindow) {
        console.error('Main window not available')
        return { success: false, error: 'Main window not available' }
      }

      console.log('Opening file dialog for progress import...')
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Progress Data',
        properties: ['openFile'],
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true }
      }

      const filePath = result.filePaths[0]
      const fileContents = await fs.readFile(filePath, 'utf-8')
      const progressData = JSON.parse(fileContents)

      // Comprehensive validation
      if (!validateProgressData(progressData)) {
        return { success: false, error: 'Invalid progress data format' }
      }

      return { success: true, data: progressData }
    } catch (error: any) {
      console.error('Error in import-progress:', error)
      if (error instanceof SyntaxError) {
        return { success: false, error: 'Invalid JSON format in file' }
      }
      return { success: false, error: error.message || 'Failed to import progress' }
    }
  })
})

/**
 * Validate progress data structure
 * @param data Data to validate
 * @returns True if data is valid ProgressData
 */
function validateProgressData(data: any): boolean {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
