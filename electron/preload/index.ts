import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Expose version information for debugging
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // IPC method wrappers
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  loadCourse: (folderPath: string) => ipcRenderer.invoke('load-course', folderPath),
  saveProgress: (progressData: any) => ipcRenderer.invoke('save-progress', progressData),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  loadProgress: () => ipcRenderer.invoke('load-progress'),
  readVideoFile: (filePath: string) => ipcRenderer.invoke('read-video-file', filePath),
  readImageFile: (filePath: string) => ipcRenderer.invoke('read-image-file', filePath),
  openResource: (filePath: string) => ipcRenderer.invoke('open-resource', filePath),
  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url),
  exportProgress: () => ipcRenderer.invoke('export-progress'),
  importProgress: () => ipcRenderer.invoke('import-progress'),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content)
})
