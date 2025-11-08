/**
 * SettingsPage Component
 *
 * Displays current settings summary with option to edit via dialog.
 */

import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useAppSelector } from '@/store/hooks'
import { selectSettings } from '@/store/slices/settingsSlice'
import { SettingsDialog } from '@/components/Settings'

export default function SettingsPage() {
  const settings = useAppSelector(selectSettings)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={handleOpenDialog}>
          Edit Settings
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage your application preferences and settings
      </Typography>

      {/* Current Settings Display */}
      <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          <ListItem>
            <ListItemText
              primary="Theme"
              secondary={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Default Playback Speed"
              secondary={`${settings.defaultPlaybackSpeed}x`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Auto-Play Next Lesson"
              secondary={settings.autoPlayNext ? 'Enabled' : 'Disabled'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Show Continue Watching"
              secondary={settings.showContinueWatching ? 'Yes' : 'No'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Default View Mode"
              secondary={settings.defaultViewMode.charAt(0).toUpperCase() + settings.defaultViewMode.slice(1)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Course Folders"
              secondary={`${settings.courseFolders.length} folder(s) configured`}
            />
          </ListItem>
        </List>
      </Paper>

      <SettingsDialog open={dialogOpen} onClose={handleCloseDialog} />
    </Container>
  )
}
