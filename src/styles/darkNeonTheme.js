// Dark Neon Futuristic Theme for Ambit

export const darkNeonTheme = {
  // Background colors
  bg: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    tertiary: 'bg-gray-950',
    card: 'bg-gray-800/50 backdrop-blur-xl',
    hover: 'hover:bg-gray-700/50',
  },

  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-500',
    accent: 'text-cyan-400',
  },

  // Neon accent colors
  neon: {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
  },

  // Gradient backgrounds
  gradients: {
    primary: 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500',
    secondary: 'bg-gradient-to-br from-purple-600 to-pink-600',
    card: 'bg-gradient-to-br from-gray-800 to-gray-900',
    neonBlue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    neonPurple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    neonGreen: 'bg-gradient-to-r from-green-400 to-cyan-400',
  },

  // Border colors (neon glow)
  borders: {
    cyan: 'border-cyan-500/50 hover:border-cyan-400',
    purple: 'border-purple-500/50 hover:border-purple-400',
    pink: 'border-pink-500/50 hover:border-pink-400',
    green: 'border-green-500/50 hover:border-green-400',
  },

  // Shadow effects (neon glow)
  shadows: {
    cyan: 'shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]',
    purple: 'shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    pink: 'shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]',
    green: 'shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]',
  },

  // Button styles
  buttons: {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] border border-cyan-400/30',
    secondary: 'bg-gray-800 text-cyan-400 border-2 border-cyan-500/50 hover:bg-gray-700 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
  },

  // Card styles
  cards: {
    primary: 'bg-gray-800/50 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    secondary: 'bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    success: 'bg-gray-800/50 backdrop-blur-xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]',
    warning: 'bg-gray-800/50 backdrop-blur-xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]',
  },

  // Input styles
  inputs: {
    base: 'bg-gray-900 border-2 border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20',
  },

  // Animation classes
  animations: {
    pulse: 'animate-pulse',
    glow: 'animate-[glow_2s_ease-in-out_infinite]',
    float: 'animate-[float_3s_ease-in-out_infinite]',
  },
};

// Helper function to combine theme classes
export const cn = (...classes) => classes.filter(Boolean).join(' ');

// Preset component styles
export const componentStyles = {
  header: `${darkNeonTheme.bg.secondary} border-b-2 border-cyan-500/30 ${darkNeonTheme.shadows.cyan}`,

  statCard: (color = 'cyan') => `
    ${darkNeonTheme.cards.primary}
    rounded-xl p-6
    transform hover:scale-105 transition-all duration-300
    ${darkNeonTheme.shadows[color]}
  `,

  glowText: (color = 'cyan') => `
    font-bold
    ${darkNeonTheme.neon[color]}
    drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]
  `,

  neonBorder: (color = 'cyan') => `
    border-2 ${darkNeonTheme.borders[color]}
    ${darkNeonTheme.shadows[color]}
    rounded-xl
  `,
};

export default darkNeonTheme;
