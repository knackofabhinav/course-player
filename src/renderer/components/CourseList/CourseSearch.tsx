/**
 * CourseSearch Component
 *
 * Search and filter component for the course list with real-time filtering.
 */

import { useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  alpha
} from '@mui/material'
import { Search, Clear, FilterList } from '@mui/icons-material'
import { MotionBox, fadeInUp } from '@/animations'
import { AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setSearchQuery,
  setInstructorFilter,
  setCompletionFilter,
  clearFilters,
  selectSearchQuery,
  selectFilters,
  selectUniqueInstructors
} from '@/store/slices/coursesSlice'
import type { SelectChangeEvent } from '@mui/material'

export function CourseSearch() {
  const dispatch = useAppDispatch()
  const searchQuery = useAppSelector(selectSearchQuery)
  const filters = useAppSelector(selectFilters)
  const instructors = useAppSelector(selectUniqueInstructors)

  const hasActiveFilters =
    searchQuery !== '' ||
    filters.instructor !== null ||
    filters.completionStatus !== 'all'

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(event.target.value))
  }

  const handleClearSearch = () => {
    dispatch(setSearchQuery(''))
  }

  const handleInstructorChange = (event: SelectChangeEvent<string>) => {
    dispatch(setInstructorFilter(event.target.value || null))
  }

  const handleCompletionChange = (event: SelectChangeEvent<string>) => {
    dispatch(
      setCompletionFilter(
        event.target.value as 'all' | 'completed' | 'in-progress' | 'not-started'
      )
    )
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search and Filter Controls */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        {/* Search Input */}
        <TextField
          variant="outlined"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            flex: '1 1 300px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#141414', 0.5),
              backdropFilter: 'blur(12px)',
              borderRadius: 3,
              transition: 'all 300ms ease',
              '& fieldset': {
                borderColor: alpha('#fff', 0.1),
                transition: 'all 300ms ease'
              },
              '&:hover fieldset': {
                borderColor: alpha('#E50914', 0.3)
              },
              '&.Mui-focused': {
                backgroundColor: alpha('#141414', 0.7),
                boxShadow: '0 0 24px rgba(229,9,20,0.3), 0 0 0 1px rgba(229,9,20,0.2)',
                '& fieldset': {
                  borderColor: '#E50914',
                  borderWidth: 2
                }
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: alpha('#fff', 0.6) }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  aria-label="clear search"
                  sx={{
                    transition: 'all 200ms ease',
                    '&:hover': {
                      backgroundColor: alpha('#E50914', 0.1),
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Instructor Filter */}
        <FormControl
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#141414', 0.5),
              backdropFilter: 'blur(12px)',
              borderRadius: 3,
              transition: 'all 300ms ease',
              '& fieldset': {
                borderColor: alpha('#fff', 0.1)
              },
              '&:hover fieldset': {
                borderColor: alpha('#E50914', 0.3)
              },
              '&.Mui-focused fieldset': {
                borderColor: '#E50914',
                borderWidth: 2
              }
            }
          }}
          size="small"
        >
          <InputLabel>Instructor</InputLabel>
          <Select
            value={filters.instructor || ''}
            label="Instructor"
            onChange={handleInstructorChange}
          >
            <MenuItem value="">All Instructors</MenuItem>
            {instructors.map((instructor) => (
              <MenuItem key={instructor} value={instructor}>
                {instructor}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Completion Filter */}
        <FormControl
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#141414', 0.5),
              backdropFilter: 'blur(12px)',
              borderRadius: 3,
              transition: 'all 300ms ease',
              '& fieldset': {
                borderColor: alpha('#fff', 0.1)
              },
              '&:hover fieldset': {
                borderColor: alpha('#E50914', 0.3)
              },
              '&.Mui-focused fieldset': {
                borderColor: '#E50914',
                borderWidth: 2
              }
            }
          }}
          size="small"
        >
          <InputLabel>Completion</InputLabel>
          <Select
            value={filters.completionStatus}
            label="Completion"
            onChange={handleCompletionChange}
          >
            <MenuItem value="all">All Courses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="not-started">Not Started</MenuItem>
          </Select>
        </FormControl>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Tooltip title="Clear all filters">
            <Chip
              icon={<FilterList />}
              label="Clear Filters"
              onDelete={handleClearFilters}
              color="primary"
              variant="outlined"
            />
          </Tooltip>
        )}
      </Box>

      {/* Active Filters Display */}
      <AnimatePresence mode="wait">
        {hasActiveFilters && (
          <MotionBox
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}
          >
            <AnimatePresence mode="popLayout">
              {searchQuery && (
                <MotionBox
                  key="search-chip"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                >
                  <Chip
                    label={`Search: "${searchQuery}"`}
                    onDelete={() => dispatch(setSearchQuery(''))}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#E50914', 0.15),
                      borderColor: alpha('#E50914', 0.3),
                      '&:hover': {
                        backgroundColor: alpha('#E50914', 0.25)
                      }
                    }}
                  />
                </MotionBox>
              )}
              {filters.instructor && (
                <MotionBox
                  key="instructor-chip"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                >
                  <Chip
                    label={`Instructor: ${filters.instructor}`}
                    onDelete={() => dispatch(setInstructorFilter(null))}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#E50914', 0.15),
                      borderColor: alpha('#E50914', 0.3),
                      '&:hover': {
                        backgroundColor: alpha('#E50914', 0.25)
                      }
                    }}
                  />
                </MotionBox>
              )}
              {filters.completionStatus !== 'all' && (
                <MotionBox
                  key="completion-chip"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                >
                  <Chip
                    label={`Status: ${filters.completionStatus.replace('-', ' ')}`}
                    onDelete={() => dispatch(setCompletionFilter('all'))}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#E50914', 0.15),
                      borderColor: alpha('#E50914', 0.3),
                      '&:hover': {
                        backgroundColor: alpha('#E50914', 0.25)
                      }
                    }}
                  />
                </MotionBox>
              )}
            </AnimatePresence>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}
