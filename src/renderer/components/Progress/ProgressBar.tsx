import { useMemo } from 'react'
import { Box, LinearProgress, Typography, Tooltip, alpha } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // Current progress value (e.g., completed lessons)
  total: number // Total value (e.g., total lessons)
  label?: string // Optional label text (e.g., "Course Progress")
  showPercentage?: boolean // Whether to show percentage label (default: true)
  size?: 'small' | 'medium' | 'large' // Bar height (default: 'medium')
  color?: 'primary' | 'secondary' | 'success' // Bar color (default: 'primary')
  showIcon?: boolean // Whether to show completion icon when 100% (default: true)
}

export function ProgressBar({
  value,
  total,
  label,
  showPercentage = true,
  size = 'medium',
  color = 'primary',
  showIcon = true
}: ProgressBarProps) {
  // Computed values
  const percentage = useMemo(() => {
    if (total === 0) return 0
    const percent = (value / total) * 100
    return Math.min(Math.max(percent, 0), 100) // Clamp between 0-100
  }, [value, total])

  const isComplete = useMemo(() => {
    return percentage === 100
  }, [percentage])

  const barHeight = useMemo(() => {
    switch (size) {
      case 'small':
        return 4
      case 'medium':
        return 6
      case 'large':
        return 8
      default:
        return 6
    }
  }, [size])

  return (
    <Box sx={{ width: '100%' }}>
      {/* Label Row */}
      {(label || showPercentage) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5
          }}
        >
          {/* Left side: Label */}
          {label && (
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          )}

          {/* Right side: Icon or Percentage */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isComplete && showIcon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              </motion.div>
            )}
            {showPercentage && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {Math.round(percentage)}%
                </Typography>
              </motion.span>
            )}
          </Box>
        </Box>
      )}

      {/* Progress Bar */}
      <Tooltip title={`${value} of ${total} complete`} arrow>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: 'left', width: '100%' }}
        >
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{
              height: barHeight,
              borderRadius: barHeight / 2,
              backgroundColor: (theme) => alpha('#fff', 0.08),
              '& .MuiLinearProgress-bar': {
                boxShadow:
                  color === 'primary'
                    ? '0 0 12px rgba(229,9,20,0.6)'
                    : color === 'success'
                    ? '0 0 12px rgba(34,197,94,0.6)'
                    : 'none',
                transition: 'transform 300ms ease'
              },
              transition: 'all 300ms ease'
            }}
            aria-label={`${label || 'Progress'}: ${Math.round(percentage)}%`}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </motion.div>
      </Tooltip>
    </Box>
  )
}
