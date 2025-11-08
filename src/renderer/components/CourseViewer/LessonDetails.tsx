import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  Link as MuiLink,
  alpha
} from '@mui/material'
import { MotionBox, MotionButton, fadeInUp } from '@/animations'
import {
  Description,
  Link as LinkIcon,
  Download,
  OpenInNew,
  NavigateBefore,
  NavigateNext,
  InsertDriveFile,
  PictureAsPdf,
  Archive
} from '@mui/icons-material'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { readLessonFile, openResourceFile, openExternalLink } from '@/services/fileSystem'
import { resolveVideoPath } from '@/services/videoLoader'
import type { Course, Lesson, CourseResource, CourseLink } from '@/types/course'

interface LessonDetailsProps {
  course: Course
  lesson: Lesson
  onNext?: () => void
  onPrevious?: () => void
  hasNext: boolean
  hasPrevious: boolean
}

export function LessonDetails({
  course,
  lesson,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: LessonDetailsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [notesContent, setNotesContent] = useState<string | null>(null)
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  // Load lesson notes when lesson changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!lesson.notes) {
        setNotesContent(null)
        setNotesLoading(false)
        setNotesError(null)
        return
      }

      setNotesLoading(true)
      setNotesError(null)

      try {
        if (!course.folderPath) {
          throw new Error('Course folder path not available')
        }

        const absolutePath = resolveVideoPath(course.folderPath, lesson.notes)
        const content = await readLessonFile(absolutePath)
        setNotesContent(content)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load notes'
        setNotesError(errorMessage)
        console.error('Error loading notes:', error)
      } finally {
        setNotesLoading(false)
      }
    }

    loadNotes()
  }, [lesson.id, lesson.notes, course.folderPath])

  const handleResourceClick = async (resource: CourseResource) => {
    try {
      if (!course.folderPath) {
        throw new Error('Course folder path not available')
      }

      const absolutePath = resolveVideoPath(course.folderPath, resource.path)
      await openResourceFile(absolutePath)
      setSnackbarMessage(`Resource opened: ${resource.title}`)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open resource'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      console.error('Error opening resource:', error)
    }
  }

  const handleLinkClick = async (link: CourseLink) => {
    try {
      await openExternalLink(link.url)
      setSnackbarMessage(`Link opened: ${link.title}`)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open link'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      console.error('Error opening link:', error)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const getResourceIcon = (resource: CourseResource): JSX.Element => {
    const extension = resource.path.split('.').pop()?.toLowerCase()
    const type = resource.type?.toLowerCase()

    if (extension === 'pdf' || type?.includes('pdf')) {
      return <PictureAsPdf />
    }
    if (extension === 'zip' || extension === 'rar' || type?.includes('zip') || type?.includes('archive')) {
      return <Archive />
    }
    return <InsertDriveFile />
  }

  // Custom markdown components for Material-UI styling
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h6" gutterBottom sx={{ mt: 1.5 }}>
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography variant="body1" paragraph>
        {children}
      </Typography>
    ),
    a: ({ href, children }) => (
      <MuiLink href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </MuiLink>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <Box
            component="code"
            sx={{
              bgcolor: alpha('#E50914', 0.15),
              color: '#E50914',
              p: 0.5,
              px: 1,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875em',
              border: `1px solid ${alpha('#E50914', 0.3)}`
            }}
          >
            {children}
          </Box>
        )
      }
      return (
        <Paper
          component="pre"
          sx={{
            p: 2,
            bgcolor: alpha('#000', 0.5),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha('#fff', 0.08)}`,
            overflow: 'auto',
            borderRadius: 2,
            fontFamily: 'monospace',
            fontSize: '0.875em'
          }}
        >
          <code>{children}</code>
        </Paper>
      )
    }
  }

  return (
    <MotionBox
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <MotionButton
          component={Button}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={onPrevious}
          disabled={!hasPrevious}
          sx={{
            borderRadius: 3,
            px: 3,
            borderColor: alpha('#fff', 0.2),
            '&:hover': {
              borderColor: '#E50914',
              backgroundColor: alpha('#E50914', 0.1)
            }
          }}
        >
          Previous
        </MotionButton>
        <MotionButton
          component={Button}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variant="contained"
          endIcon={<NavigateNext />}
          onClick={onNext}
          disabled={!hasNext}
          sx={{ borderRadius: 3, px: 3 }}
        >
          Next
        </MotionButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          backgroundColor: alpha('#141414', 0.5),
          backdropFilter: 'blur(12px)',
          borderRadius: 2,
          border: `1px solid ${alpha('#fff', 0.08)}`,
          '& .MuiTabs-indicator': {
            backgroundColor: '#E50914',
            height: 3,
            borderRadius: '3px 3px 0 0'
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
        <Tab icon={<Description />} label="Notes" iconPosition="start" />
        <Tab
          icon={<Download />}
          label={`Resources ${lesson.resources?.length ? `(${lesson.resources.length})` : ''}`}
          iconPosition="start"
        />
        <Tab
          icon={<LinkIcon />}
          label={`Links ${lesson.links?.length ? `(${lesson.links.length})` : ''}`}
          iconPosition="start"
        />
      </Tabs>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Notes Tab */}
        {activeTab === 0 && (
          <Box>
            {notesLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {notesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {notesError}
              </Alert>
            )}

            {!lesson.notes && !notesLoading && (
              <Alert severity="info">No notes available for this lesson</Alert>
            )}

            {notesContent && !notesLoading && (
              <Paper
                sx={{
                  p: 3,
                  overflowY: 'auto',
                  maxHeight: 'calc(100vh - 400px)',
                  backgroundColor: alpha('#141414', 0.5),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${alpha('#fff', 0.08)}`,
                  borderRadius: 3
                }}
              >
                <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {notesContent}
                </Markdown>
              </Paper>
            )}
          </Box>
        )}

        {/* Resources Tab */}
        {activeTab === 1 && (
          <Box>
            {!lesson.resources || lesson.resources.length === 0 ? (
              <Alert severity="info">No resources available for this lesson</Alert>
            ) : (
              <List>
                {lesson.resources.map((resource, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleResourceClick(resource)}>
                        <OpenInNew />
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={() => handleResourceClick(resource)}>
                      <ListItemIcon>{getResourceIcon(resource)}</ListItemIcon>
                      <ListItemText
                        primary={resource.title}
                        secondary={resource.type || 'File'}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Links Tab */}
        {activeTab === 2 && (
          <Box>
            {!lesson.links || lesson.links.length === 0 ? (
              <Alert severity="info">No external links for this lesson</Alert>
            ) : (
              <List>
                {lesson.links.map((link, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleLinkClick(link)}>
                        <OpenInNew />
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={() => handleLinkClick(link)}>
                      <ListItemIcon>
                        <LinkIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={link.title}
                        secondary={link.description || link.url}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={handleSnackbarClose}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MotionBox>
  )
}
