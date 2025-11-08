import { Box, Typography, Button, Container } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <ErrorOutline sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          The page you're looking for doesn't exist.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Courses
        </Button>
      </Box>
    </Container>
  )
}
