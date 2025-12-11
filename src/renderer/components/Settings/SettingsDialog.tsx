/**
 * SettingsDialog Component
 *
 * Comprehensive settings dialog with tabbed interface for all application settings.
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  InputLabel,
  Snackbar,
  alpha
} from '@mui/material'
import { Close, Delete, Restore, FolderOpen, CloudUpload, CloudDownload } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  setTheme,
  setDefaultPlaybackSpeed,
  setAutoPlayNext,
  addCourseFolder,
  removeCourseFolder,
  setShowContinueWatching,
  setDefaultViewMode,
  resetSettings,
  selectSettings,
  selectCourseFolders,
  selectKeyboardShortcuts
} from '@/store/slices/settingsSlice'
import {
  exportProgress,
  importProgress,
  saveProgress
} from '@/store/slices/progressSlice'
import { selectCourseFolder } from '@/services/fileSystem'
import type { AppSettings } from '@/types'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const courseFolders = useAppSelector(selectCourseFolders)
  const keyboardShortcuts = useAppSelector(selectKeyboardShortcuts)

  const [activeTab, setActiveTab] = useState(0)
  const [tempSettings, setTempSettings] = useState<Partial<AppSettings>>({})
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')

  useEffect(() => {
    if (open) {
      dispatch(loadSettingsFromStorage())
      setTempSettings(settings)
    }
  }, [open, dispatch])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSave = () => {
    dispatch(saveSettingsToStorage())
    onClose()
  }

  const handleCancel = () => {
    setTempSettings(settings)
    onClose()
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      dispatch(resetSettings())
      dispatch(saveSettingsToStorage())
      onClose()
    }
  }

  const handleAddCourseFolder = async () => {
    const folderPath = await selectCourseFolder()
    if (folderPath) {
      dispatch(addCourseFolder(folderPath))
    }
  }

  const handleRemoveCourseFolder = (folderPath: string) => {
    dispatch(removeCourseFolder(folderPath))
  }

  const handleExportProgress = async () => {
    try {
      const result = await dispatch(exportProgress()).unwrap()
      if (result && 'success' in result && result.success) {
        setSnackbarMessage('Progress exported successfully!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      setSnackbarMessage(error || 'Failed to export progress')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleImportProgress = async () => {
    try {
      const result = await dispatch(importProgress()).unwrap()
      if (result && 'courses' in result) {
        // Save imported progress
        await dispatch(saveProgress())
        setSnackbarMessage('Progress imported and merged successfully!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      }
    } catch (error: any) {
      if (error !== 'canceled') {
        setSnackbarMessage(error || 'Failed to import progress')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: alpha('#141414', 0.95),
          backdropFilter: 'blur(24px)',
          border: `1px solid ${alpha('#fff', 0.1)}`,
          borderRadius: 3,
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha('#fff', 0.08)}`,
          fontWeight: 700
        }}
      >
        Settings
        <IconButton
          onClick={handleCancel}
          aria-label="close"
          sx={{
            transition: 'all 200ms ease',
            '&:hover': {
              backgroundColor: alpha('#E50914', 0.1),
              transform: 'scale(1.1)'
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="settings tabs"
        sx={{
          borderBottom: `1px solid ${alpha('#fff', 0.08)}`,
          '& .MuiTabs-indicator': {
            backgroundColor: '#E50914',
            height: 3
          },
          '& .MuiTab-root': {
            color: alpha('#fff', 0.6),
            fontWeight: 600,
            transition: 'all 200ms ease',
            '&:hover': {
              color: '#fff',
              backgroundColor: alpha('#fff', 0.05)
            },
            '&.Mui-selected': {
              color: '#E50914'
            }
          }
        }}
      >
        <Tab label="General" />
        <Tab label="Playback" />
        <Tab label="Appearance" />
        <Tab label="Data" />
        <Tab label="Keyboard Shortcuts" />
      </Tabs>

      <DialogContent dividers sx={{ minHeight: 400 }}>
        {/* Tab Panel 0: General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Course Folders
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Manage folders that are scanned for courses on startup
          </Typography>

          <List>
            {courseFolders.map((folder) => (
              <ListItem
                key={folder}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveCourseFolder(folder)}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText primary={folder} />
              </ListItem>
            ))}
          </List>

          <Button
            variant="outlined"
            startIcon={<FolderOpen />}
            onClick={handleAddCourseFolder}
            sx={{ mt: 2 }}
          >
            Add Folder
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            View Preferences
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Default View Mode</InputLabel>
            <Select
              value={settings.defaultViewMode}
              label="Default View Mode"
              onChange={(e) => dispatch(setDefaultViewMode(e.target.value as 'grid' | 'list'))}
            >
              <MenuItem value="grid">Grid</MenuItem>
              <MenuItem value="list">List</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showContinueWatching}
                onChange={(e) => dispatch(setShowContinueWatching(e.target.checked))}
              />
            }
            label="Show Continue Watching section"
            sx={{ mt: 2 }}
          />
        </TabPanel>

        {/* Tab Panel 1: Playback Settings */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Default Playback Speed
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Default speed for new videos
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Playback Speed</InputLabel>
            <Select
              value={settings.defaultPlaybackSpeed}
              label="Playback Speed"
              onChange={(e) => dispatch(setDefaultPlaybackSpeed(Number(e.target.value)))}
            >
              <MenuItem value={0.5}>0.5x</MenuItem>
              <MenuItem value={0.75}>0.75x</MenuItem>
              <MenuItem value={1.0}>1.0x (Normal)</MenuItem>
              <MenuItem value={1.25}>1.25x</MenuItem>
              <MenuItem value={1.5}>1.5x</MenuItem>
              <MenuItem value={1.75}>1.75x</MenuItem>
              <MenuItem value={2.0}>2.0x</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Auto-Play Next Lesson
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.autoPlayNext}
                onChange={(e) => dispatch(setAutoPlayNext(e.target.checked))}
              />
            }
            label="Automatically play next lesson when current lesson ends"
          />
        </TabPanel>

        {/* Tab Panel 2: Appearance Settings */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Theme Preference
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose your preferred color theme
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={settings.theme}
              label="Theme"
              onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark' | 'system'))}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </FormControl>

          {settings.theme === 'system' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              System theme detection requires app restart
            </Alert>
          )}
        </TabPanel>

        {/* Tab Panel 3: Data Management */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Progress Data Management
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Export and import your course progress data
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={handleExportProgress}
              fullWidth
            >
              Export Progress Data
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
              Save your progress to a JSON file for backup or transfer to another device
            </Typography>

            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={handleImportProgress}
              fullWidth
            >
              Import Progress Data
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
              Load progress from a backup file. Your existing progress will be merged with the imported data
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            Progress data is automatically saved to <code>~/.course-player/progress.json</code>
          </Alert>
        </TabPanel>

        {/* Tab Panel 4: Keyboard Shortcuts */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Keyboard Shortcuts
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Customize keyboard shortcuts for video player
          </Typography>

          <List>
            {keyboardShortcuts.map((shortcut) => (
              <ListItem key={shortcut.action} divider>
                <ListItemText primary={shortcut.description} secondary={`Key: ${shortcut.key}`} />
              </ListItem>
            ))}
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            Keyboard shortcuts customization coming in a future update
          </Alert>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleReset}
          startIcon={<Restore />}
          color="error"
          sx={{ mr: 'auto' }}
        >
          Reset All Settings
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>

      {/* Snackbar for import/export notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}
