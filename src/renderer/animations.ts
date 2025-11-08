import { motion, Variants } from 'framer-motion';
import { Box, Card, Button, Paper } from '@mui/material';

// Animation Variants

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 360,
      damping: 32,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: 0.12,
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 34,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.18,
    },
  },
};

export const hoverLift: Variants = {
  initial: {
    y: 0,
    scale: 1
  },
  hover: {
    y: -6,
    scale: 1.03,
    transition: {
      type: 'spring',
      stiffness: 460,
      damping: 36,
      mass: 0.9,
    },
  },
  tap: {
    scale: 0.98,
    y: -2,
    transition: {
      duration: 0.1,
    },
  },
  focus: {
    y: -6,
    scale: 1.03,
    outline: '2px solid rgba(229,9,20,0.7)',
    outlineOffset: '2px',
  },
};

export const hoverScale: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.015,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 38,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 360,
      damping: 32,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: {
      duration: 0.12,
    },
  },
};

export const progressFill: Variants = {
  initial: {
    scaleX: 0,
    transformOrigin: 'left',
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

// Motion-Enabled Components

export const MotionBox = motion.create(Box);
export const MotionCard = motion.create(Card);
export const MotionButton = motion.create(Button);
export const MotionPaper = motion.create(Paper);

// Helper Functions

export function getReducedMotionConfig() {
  if (typeof window === 'undefined') {
    return false;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Return simplified variants if reduced motion is preferred
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    };
  }

  return false;
}
