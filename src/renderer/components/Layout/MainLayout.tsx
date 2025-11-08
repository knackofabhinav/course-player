import { useState } from 'react'
import { Box, Drawer, Toolbar, useTheme, useMediaQuery } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { DRAWER_WIDTH } from './constants'
import { MotionBox, fadeInUp } from '@/animations'
import { AnimatePresence } from 'framer-motion'

export default function MainLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(true)
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen)
  }

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false)
  }

  const handleDesktopDrawerToggle = () => {
    setDesktopDrawerOpen(!desktopDrawerOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} showMenuButton={!isDesktop} drawerOpen={desktopDrawerOpen} />

      {/* Mobile drawer - temporary variant */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
          }}
        >
          <Sidebar onNavigate={handleDrawerClose} onCollapse={handleDrawerClose} />
        </Drawer>
      )}

      {/* Desktop drawer - persistent variant */}
      {isDesktop && (
        <Drawer
          variant="persistent"
          open={desktopDrawerOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              position: 'fixed',
              height: '100%',
              overflowY: 'auto'
            }
          }}
        >
          <Sidebar onCollapse={handleDesktopDrawerToggle} />
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          ml: { xs: 0, md: desktopDrawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          minHeight: '100vh',
          backgroundColor: 'transparent',
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          })
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <MotionBox
            key={location.pathname}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Outlet />
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  )
}
