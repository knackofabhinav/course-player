import { useState, useEffect } from 'react'
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme, alpha } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Settings, ArrowBack } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { DRAWER_WIDTH } from './constants'
import { SettingsDialog } from '@/components/Settings'
import { useAppSelector } from '@/store/hooks'
import { selectCourseById } from '@/store/slices/coursesSlice'

interface HeaderProps {
  onMenuClick: () => void
  showMenuButton: boolean
  drawerOpen?: boolean
}

export default function Header({ onMenuClick, showMenuButton, drawerOpen = true }: HeaderProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const course = useAppSelector((state) =>
    courseId ? selectCourseById(courseId)(state) : null
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSettingsOpen = () => {
    setSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setSettingsOpen(false)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { xs: 0, md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: scrolled ? alpha('#000', 0.85) : alpha('#000', 0.4),
          backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'saturate(150%) blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          {showMenuButton && !course && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {course && (
            <>
              <IconButton
                color="inherit"
                aria-label="go back"
                edge="start"
                onClick={handleBack}
                sx={{
                  mr: 2,
                  transition: 'all 200ms ease',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.08),
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.5rem' }}>
                {course.title}
              </Typography>
            </>
          )}
          {!course && (
            <Box sx={{ flexGrow: 1 }} />
          )}
          <IconButton
            onClick={handleSettingsOpen}
            color="inherit"
            aria-label="open settings"
            sx={{ transition: 'all 200ms ease', '&:hover': { backgroundColor: alpha('#fff', 0.08), transform: 'scale(1.1)' } }}
          >
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
    </>
  )
}
