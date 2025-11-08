import { createTheme, alpha, ThemeOptions, PaletteMode } from '@mui/material';

// Netflix Color Constants
const NETFLIX_RED = '#E50914';
const NETFLIX_DARK_RED = '#B20710';
const BLACK = '#000000';
const ELEVATED_BLACK = '#141414';
const DARK_GRAY = '#1A1A1A';
const WHITE = '#FFFFFF';

// Custom shadows with dramatic depth
const customShadows = [
  'none',
  '0 2px 8px rgba(0,0,0,0.45)',
  '0 4px 16px rgba(0,0,0,0.5)',
  '0 8px 24px rgba(0,0,0,0.55)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
  '0 12px 32px rgba(0,0,0,0.6)',
];

export function createNetflixTheme(mode: PaletteMode = 'dark') {
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'dark',
      primary: {
        main: NETFLIX_RED,
        dark: NETFLIX_DARK_RED,
      },
      secondary: {
        main: NETFLIX_DARK_RED,
      },
      background: {
        default: BLACK,
        paper: alpha(ELEVATED_BLACK, 0.72),
      },
      text: {
        primary: WHITE,
        secondary: alpha(WHITE, 0.72),
      },
      divider: alpha(WHITE, 0.12),
      error: {
        main: '#FF3B30',
      },
      warning: {
        main: '#F5A623',
      },
      info: {
        main: '#3B82F6',
      },
      success: {
        main: '#22C55E',
      },
    },
    typography: {
      fontFamily: ['Inter', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'].join(','),
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.5px',
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 800,
        letterSpacing: '-0.4px',
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.2px',
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 700,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 700,
        fontSize: '1.125rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 700,
        letterSpacing: '0.2px',
      },
      body1: {
        lineHeight: 1.7,
      },
      body2: {
        lineHeight: 1.6,
        color: alpha(WHITE, 0.72),
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: customShadows as any,
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: BLACK,
          },
          body: {
            backgroundColor: BLACK,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, ${alpha(NETFLIX_RED, 0.08)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha(NETFLIX_RED, 0.08)} 0%, transparent 50%),
              linear-gradient(180deg, ${BLACK} 0%, ${DARK_GRAY} 100%)
            `,
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            '@media (prefers-reduced-transparency: reduce)': {
              backgroundImage: 'none',
            },
          },
          '*::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '*::-webkit-scrollbar-track': {
            background: alpha(WHITE, 0.05),
          },
          '*::-webkit-scrollbar-thumb': {
            background: alpha(WHITE, 0.2),
            borderRadius: '6px',
            '&:hover': {
              background: alpha(WHITE, 0.3),
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
        variants: [
          {
            props: { variant: 'glass' } as any,
            style: {
              backgroundColor: alpha(ELEVATED_BLACK, 0.5),
              backdropFilter: 'saturate(180%) blur(16px)',
              border: `1px solid ${alpha(WHITE, 0.08)}`,
              boxShadow: `inset 0 1px 0 ${alpha(WHITE, 0.05)}`,
            },
          },
          {
            props: { variant: 'elevated' } as any,
            style: {
              backgroundColor: alpha(ELEVATED_BLACK, 0.8),
            },
          },
        ],
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(BLACK, 0.4),
            backdropFilter: 'saturate(150%) blur(12px)',
            borderBottom: `1px solid ${alpha(WHITE, 0.08)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(BLACK, 0.55),
            backdropFilter: 'saturate(150%) blur(16px)',
            border: `1px solid ${alpha(WHITE, 0.08)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 2,
        },
        styleOverrides: {
          root: {
            backgroundColor: alpha(ELEVATED_BLACK, 0.5),
            border: `1px solid ${alpha(WHITE, 0.08)}`,
            borderRadius: 12,
            backgroundImage: 'none',
            '&:hover': {
              boxShadow: `0 12px 32px rgba(0,0,0,0.6), 0 0 20px ${alpha(NETFLIX_RED, 0.2)}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingLeft: 18,
            paddingRight: 18,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${NETFLIX_RED} 0%, ${NETFLIX_DARK_RED} 100%)`,
            boxShadow: `0 4px 16px ${alpha(NETFLIX_RED, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${NETFLIX_DARK_RED} 0%, ${NETFLIX_RED} 100%)`,
              boxShadow: `0 6px 20px ${alpha(NETFLIX_RED, 0.5)}`,
            },
          },
          outlined: {
            border: `1px solid ${alpha(WHITE, 0.2)}`,
            '&:hover': {
              border: `1px solid ${alpha(WHITE, 0.4)}`,
              backgroundColor: alpha(WHITE, 0.05),
            },
          },
          text: {
            color: alpha(WHITE, 0.88),
            '&:hover': {
              backgroundColor: alpha(WHITE, 0.08),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(WHITE, 0.06),
            border: `1px solid ${alpha(WHITE, 0.12)}`,
            backdropFilter: 'blur(6px)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'filled',
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(WHITE, 0.06),
            borderRadius: 8,
            '&:hover': {
              backgroundColor: alpha(WHITE, 0.08),
            },
            '&.Mui-focused': {
              backgroundColor: alpha(WHITE, 0.1),
            },
            '&:before': {
              display: 'none',
            },
            '&:after': {
              display: 'none',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: alpha(BLACK, 0.7),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(WHITE, 0.1)}`,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: alpha(WHITE, 0.08),
          },
          bar: {
            borderRadius: 4,
            transition: 'transform 300ms ease',
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            border: `1px solid ${alpha(WHITE, 0.08)}`,
            '&:before': {
              display: 'none',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}

// Export color constants for use in components
export { NETFLIX_RED, NETFLIX_DARK_RED, BLACK, ELEVATED_BLACK, DARK_GRAY, WHITE };
