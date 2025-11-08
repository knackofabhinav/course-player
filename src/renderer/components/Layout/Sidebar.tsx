import {
  Box,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  alpha
} from '@mui/material'
import { Home, ChevronLeft } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { MotionBox, slideInRight } from '@/animations'

interface SidebarProps {
  onNavigate?: () => void
  onCollapse?: () => void
}

const navItems = [
  { label: 'Courses', path: '/', icon: Home }
]

export default function Sidebar({ onNavigate, onCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string) => {
    navigate(path)
    onNavigate?.()
  }

  const isActive = (path: string) => {
    if (location.pathname === path) {
      return true
    }
    // Check for nested routes
    if (path !== '/' && location.pathname.startsWith(path + '/')) {
      return true
    }
    return false
  }

  return (
    <Box role="presentation" sx={{ width: 240 }}>
      <Toolbar />
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.5px',
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            flex: 1,
            textAlign: 'center'
          }}
        >
          Kojoyo Learning
        </Typography>
        {onCollapse && (
          <IconButton
            onClick={onCollapse}
            size="small"
            sx={{
              color: 'text.secondary',
              transition: 'all 200ms ease',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha('#fff', 0.05),
                transform: 'scale(1.1)'
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: alpha('#fff', 0.08) }} />
      <MotionBox component="div" variants={slideInRight} initial="hidden" animate="visible">
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  transition: 'all 200ms ease',
                  '&.Mui-selected': {
                    backgroundColor: alpha('#E50914', 0.15),
                    borderLeft: '3px solid #E50914',
                    '&:hover': {
                      backgroundColor: alpha('#E50914', 0.2)
                    }
                  },
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.05),
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                    transition: 'color 200ms ease'
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </MotionBox>
    </Box>
  )
}
