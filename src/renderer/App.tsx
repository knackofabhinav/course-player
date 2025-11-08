import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import { useState, useMemo, createContext, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { PaletteMode } from '@mui/material'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import MainLayout from '@/components/Layout/MainLayout'
import { CoursesPage, CourseViewerPage, SettingsPage, NotFoundPage } from '@/pages'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadSettingsFromStorage, selectTheme, setTheme, saveSettingsToStorage } from '@/store/slices/settingsSlice'
import { createNetflixTheme } from '@/theme'

// Create context for color mode toggle
export const ColorModeContext = createContext({
  toggleColorMode: () => {}
})

function App() {
  const dispatch = useAppDispatch()
  const themeFromSettings = useAppSelector(selectTheme)
  const [mode, setMode] = useState<PaletteMode>(themeFromSettings === 'system' ? 'dark' : themeFromSettings)

  // Load settings on mount
  useEffect(() => {
    dispatch(loadSettingsFromStorage())
  }, [dispatch])

  // Sync theme with Redux
  useEffect(() => {
    if (themeFromSettings !== 'system') {
      setMode(themeFromSettings)
    }
  }, [themeFromSettings])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light'
        setMode(newMode)
        dispatch(setTheme(newMode))
        dispatch(saveSettingsToStorage())
      }
    }),
    [mode, dispatch]
  )

  const theme = useMemo(
    () => createNetflixTheme(mode),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 460, damping: 36, mass: 0.9 }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route index element={<CoursesPage />} />
                <Route path="viewer" element={<CourseViewerPage />} />
                <Route path="viewer/:courseId" element={<CourseViewerPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </MotionConfig>
    </ColorModeContext.Provider>
  )
}

export default App
