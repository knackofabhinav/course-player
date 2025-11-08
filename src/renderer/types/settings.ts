/**
 * Settings Type Definitions
 *
 * Defines the complete settings data structure with type safety.
 */

export interface KeyboardShortcut {
  action: string
  key: string
  description: string
}

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { action: 'playPause', key: 'Space', description: 'Play/Pause video' },
  { action: 'seekForward', key: 'ArrowRight', description: 'Seek forward 10 seconds' },
  { action: 'seekBackward', key: 'ArrowLeft', description: 'Seek backward 10 seconds' },
  { action: 'volumeUp', key: 'ArrowUp', description: 'Increase volume' },
  { action: 'volumeDown', key: 'ArrowDown', description: 'Decrease volume' },
  { action: 'mute', key: 'M', description: 'Toggle mute' },
  { action: 'fullscreen', key: 'F', description: 'Toggle fullscreen' }
]

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  defaultPlaybackSpeed: number
  autoPlayNext: boolean
  courseFolders: string[]
  keyboardShortcuts: KeyboardShortcut[]
  showContinueWatching: boolean
  defaultViewMode: 'grid' | 'list'
}

export interface SettingsState extends AppSettings {
  isLoading: boolean
  error: string | null
}
