import { useState, useEffect, useMemo } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  alpha
} from '@mui/material'
import {
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material'
import { MotionBox, staggerContainer, staggerItem } from '@/animations'
import { useAppSelector } from '@/store/hooks'
import { selectIsLessonComplete, selectCourseProgress } from '@/store/slices/progressSlice'
import { ProgressBar } from '@/components/Progress'
import type { Course, CourseSection, Lesson } from '@/types/course'

interface LessonListProps {
  course: Course
  currentSection: CourseSection
  currentLesson: Lesson
  onLessonSelect: (sectionIndex: number, lessonIndex: number) => void
}

export function LessonList({
  course,
  currentSection,
  currentLesson,
  onLessonSelect
}: LessonListProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Get course progress once outside loops
  const courseProgress = useAppSelector(selectCourseProgress(course.id))

  // Auto-expand the section containing the current lesson
  useEffect(() => {
    if (!expandedSections.includes(currentSection.id)) {
      setExpandedSections((prev) => [...prev, currentSection.id])
    }
  }, [currentSection.id])

  // Handler for accordion expand/collapse
  const handleAccordionChange = (sectionId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedSections((prev) => [...prev, sectionId])
    } else {
      setExpandedSections((prev) => prev.filter((id) => id !== sectionId))
    }
  }

  // Handler for lesson click
  const handleLessonClick = (sectionIndex: number, lessonIndex: number) => {
    onLessonSelect(sectionIndex, lessonIndex)
  }

  return (
    <MotionBox
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      sx={{ width: '100%', height: '100%', overflowY: 'auto' }}
    >
      {course.sections.map((section, sectionIndex) => {
        // Compute completedCount and totalCount using the section's lessons array and course progress object
        const completedCount = section.lessons.filter(
          (lesson) => courseProgress?.lessons[lesson.id]?.completed || false
        ).length
        const totalCount = section.lessons.length

        return (
          <Accordion
            key={section.id}
            expanded={expandedSections.includes(section.id)}
            onChange={handleAccordionChange(section.id)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: alpha('#141414', 0.5),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha('#fff', 0.08)}`,
              borderRadius: 2,
              mb: 1,
              overflow: 'hidden',
              transition: 'all 300ms ease',
              '&:before': {
                display: 'none'
              },
              '&:hover': {
                backgroundColor: alpha('#141414', 0.7),
                borderColor: alpha('#E50914', 0.2)
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {section.title}
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <ProgressBar
                    value={completedCount}
                    total={totalCount}
                    size="small"
                    showPercentage={true}
                    showIcon={true}
                  />
                </Box>
              </Box>
              {section.description && (
                <Typography variant="caption" color="text.secondary">
                  {section.description}
                </Typography>
              )}
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <List disablePadding>
                {section.lessons.map((lesson, lessonIndex) => {
                  const isComplete = courseProgress?.lessons[lesson.id]?.completed || false
                  const isCurrent = lesson.id === currentLesson.id

                  return (
                    <ListItem
                      key={lesson.id}
                      disablePadding
                      secondaryAction={
                        <Typography variant="caption" color="text.secondary">
                          {formatDuration(lesson.duration)}
                        </Typography>
                      }
                    >
                      <ListItemButton
                        selected={isCurrent}
                        onClick={() => handleLessonClick(sectionIndex, lessonIndex)}
                        sx={{
                          borderRadius: 1,
                          mx: 0.5,
                          my: 0.25,
                          transition: 'all 200ms ease',
                          '&.Mui-selected': {
                            backgroundColor: alpha('#E50914', 0.15),
                            borderLeft: `3px solid #E50914`,
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
                        <ListItemIcon>
                          {isComplete ? (
                            <CheckCircle color="success" />
                          ) : (
                            <RadioButtonUnchecked color="disabled" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.title}
                          secondary={
                            lesson.description
                              ? {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }
                              : undefined
                          }
                          secondaryTypographyProps={{
                            sx: {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  )
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </MotionBox>
  )
}

// Helper function to format duration in seconds to MM:SS
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
