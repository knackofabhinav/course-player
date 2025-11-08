import { useState, useEffect } from 'react'
import { Box, Typography, Container, Alert, Paper, Grid } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectCourseById } from '@/store/slices/coursesSlice'
import { VideoPlayer, LessonList, LessonDetails } from '@/components/CourseViewer'
import type { Lesson, CourseSection } from '@/types'

export default function CourseViewerPage() {
  const { courseId } = useParams<{ courseId?: string }>()
  const course = useAppSelector(selectCourseById(courseId || ''))

  // State for current lesson and section
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentSection, setCurrentSection] = useState<CourseSection | null>(null)

  // Load first lesson on mount
  useEffect(() => {
    if (course && course.sections.length > 0) {
      const firstSection = course.sections[0]
      if (firstSection.lessons.length > 0) {
        setCurrentSection(firstSection)
        setCurrentLesson(firstSection.lessons[0])
      }
    }
  }, [course])

  // Navigation: Next lesson
  const handleNext = () => {
    if (!course || !currentSection || !currentLesson) return

    // Find current section and lesson indices
    const sectionIndex = course.sections.findIndex(s => s.id === currentSection.id)
    const lessonIndex = currentSection.lessons.findIndex(l => l.id === currentLesson.id)

    // Try next lesson in current section
    if (lessonIndex < currentSection.lessons.length - 1) {
      setCurrentLesson(currentSection.lessons[lessonIndex + 1])
    }
    // Try first lesson of next section
    else if (sectionIndex < course.sections.length - 1) {
      const nextSection = course.sections[sectionIndex + 1]
      if (nextSection.lessons.length > 0) {
        setCurrentSection(nextSection)
        setCurrentLesson(nextSection.lessons[0])
      }
    }
    // No more lessons
    else {
      console.log('No more lessons')
    }
  }

  // Navigation: Previous lesson
  const handlePrevious = () => {
    if (!course || !currentSection || !currentLesson) return

    // Find current section and lesson indices
    const sectionIndex = course.sections.findIndex(s => s.id === currentSection.id)
    const lessonIndex = currentSection.lessons.findIndex(l => l.id === currentLesson.id)

    // Try previous lesson in current section
    if (lessonIndex > 0) {
      setCurrentLesson(currentSection.lessons[lessonIndex - 1])
    }
    // Try last lesson of previous section
    else if (sectionIndex > 0) {
      const prevSection = course.sections[sectionIndex - 1]
      if (prevSection.lessons.length > 0) {
        setCurrentSection(prevSection)
        setCurrentLesson(prevSection.lessons[prevSection.lessons.length - 1])
      }
    }
    // No previous lessons
    else {
      console.log('No previous lessons')
    }
  }

  // Handler for lesson selection from LessonList
  const handleLessonSelect = (sectionIndex: number, lessonIndex: number) => {
    if (!course) return

    const section = course.sections[sectionIndex]
    const lesson = section.lessons[lessonIndex]
    setCurrentSection(section)
    setCurrentLesson(lesson)
  }

  // Computed values for navigation state
  const hasNext = (() => {
    if (!course || !currentSection || !currentLesson) return false

    const sectionIndex = course.sections.findIndex(s => s.id === currentSection.id)
    const lessonIndex = currentSection.lessons.findIndex(l => l.id === currentLesson.id)

    // Check if there's a next lesson in current section
    if (lessonIndex < currentSection.lessons.length - 1) return true

    // Check if there's a next section with lessons
    if (sectionIndex < course.sections.length - 1) {
      return course.sections[sectionIndex + 1].lessons.length > 0
    }

    return false
  })()

  const hasPrevious = (() => {
    if (!course || !currentSection || !currentLesson) return false

    const sectionIndex = course.sections.findIndex(s => s.id === currentSection.id)
    const lessonIndex = currentSection.lessons.findIndex(l => l.id === currentLesson.id)

    // Check if there's a previous lesson in current section
    if (lessonIndex > 0) return true

    // Check if there's a previous section with lessons
    if (sectionIndex > 0) {
      return course.sections[sectionIndex - 1].lessons.length > 0
    }

    return false
  })()

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {!courseId ? (
        <Alert severity="info">
          No course selected. Please select a course from the Courses page.
        </Alert>
      ) : !course ? (
        <Alert severity="warning">
          Course not found. Please load the course first.
        </Alert>
      ) : !course.folderPath ? (
        <Alert severity="error">
          Course folder path is missing. Please reload the course.
        </Alert>
      ) : !currentLesson ? (
        <Alert severity="warning">
          No lessons found in this course.
        </Alert>
      ) : (
        <Box>
          {/* Course Title */}
          <Typography variant="h4" gutterBottom>
            {course.title}
          </Typography>

          {/* Responsive Grid Layout */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Left Column: Video Player + Lesson Info */}
            <Grid item xs={12} md={8}>
              {/* Video Player */}
              <Paper
                elevation={3}
                sx={{
                  aspectRatio: '16/9',
                  backgroundColor: 'black',
                  overflow: 'hidden'
                }}
              >
                <VideoPlayer
                  course={course}
                  lesson={currentLesson}
                  courseFolderPath={course.folderPath}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </Paper>

              {/* Lesson Info */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {currentLesson.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Section: {currentSection?.title}
                </Typography>
                {currentLesson.description && (
                  <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                    {currentLesson.description}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Right Column: Lesson List + Lesson Details */}
            <Grid item xs={12} md={4}>
              {/* Lesson List */}
              <Paper elevation={2} sx={{ p: 2, mb: 2, maxHeight: '400px', overflowY: 'auto' }}>
                <LessonList
                  course={course}
                  currentSection={currentSection}
                  currentLesson={currentLesson}
                  onLessonSelect={handleLessonSelect}
                />
              </Paper>

              {/* Lesson Details */}
              <Paper elevation={2} sx={{ p: 2 }}>
                <LessonDetails
                  course={course}
                  lesson={currentLesson}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  )
}
