/**
 * Settings Storage Service
 *
 * Centralize settings storage operations with error handling and validation.
 * Uses localStorage for persistence.
 */

import type { AppSettings } from '@/types/settings'
import { DEFAULT_KEYBOARD_SHORTCUTS } from '@/types'

const SETTINGS_STORAGE_KEY = 'course-player-settings'

/**
 * Get default settings
 * @returns Default settings object with all fields initialized
 */
export function getDefaultSettings(): AppSettings {
  return {
    theme: 'dark',
    defaultPlaybackSpeed: 1.0,
    autoPlayNext: true,
    courseFolders: [],
    keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
    showContinueWatching: true,
    defaultViewMode: 'grid'
  }
}

/**
 * Load settings from localStorage
 * @returns Loaded settings or null if not exists or parse fails
 */
export function loadSettings(): AppSettings | null {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as Partial<AppSettings>

    // Merge with default settings to handle missing fields (for version upgrades)
    const defaults = getDefaultSettings()
    const merged: AppSettings = {
      ...defaults,
      ...parsed,
      // Ensure keyboard shortcuts is not empty
      keyboardShortcuts: parsed.keyboardShortcuts && parsed.keyboardShortcuts.length > 0
        ? parsed.keyboardShortcuts
        : defaults.keyboardShortcuts
    }

    return merged
  } catch (error) {
    console.error('Error loading settings from localStorage:', error)
    return null
  }
}

/**
 * Save settings to localStorage
 * @param settings Settings object to save
 * @throws Error if save fails (e.g., quota exceeded)
 */
export function saveSettings(settings: AppSettings): void {
  try {
    // Validate settings object
    if (!settings || typeof settings !== 'object') {
      throw new Error('Invalid settings object')
    }

    const json = JSON.stringify(settings, null, 2)
    localStorage.setItem(SETTINGS_STORAGE_KEY, json)
    console.log('Settings saved successfully')
  } catch (error) {
    console.error('Error saving settings to localStorage:', error)
    throw error
  }
}

/**
 * Clear settings from localStorage
 * Used for reset functionality
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
    console.log('Settings cleared successfully')
  } catch (error) {
    console.error('Error clearing settings from localStorage:', error)
  }
}
