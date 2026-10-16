import type { Config } from 'tailwindcss';

// Design tokens sourced from DESIGN.md ("Global Trust & Growth"). Keep this
// file and DESIGN.md in sync — DESIGN.md is the source of truth; this is its
// translation into Tailwind's theme so every page consumes the same values
// instead of hand-picked hex codes.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#45464d',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: '#76777d',
        'outline-variant': '#c6c6cd',
        'surface-tint': '#565e74',
        primary: '#000000',
        'on-primary': '#ffffff',
        'primary-container': '#131b2e',
        'on-primary-container': '#7c839b',
        'inverse-primary': '#bec6e0',
        secondary: '#006c49',
        'on-secondary': '#ffffff',
        'secondary-container': '#6cf8bb',
        'on-secondary-container': '#00714d',
        tertiary: '#735c00',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#cba72f',
        'on-tertiary-container': '#4e3d00',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'primary-fixed': '#dae2fd',
        'primary-fixed-dim': '#bec6e0',
        'on-primary-fixed': '#131b2e',
        'on-primary-fixed-variant': '#3f465c',
        'secondary-fixed': '#6ffbbe',
        'secondary-fixed-dim': '#4edea3',
        'on-secondary-fixed': '#002113',
        'on-secondary-fixed-variant': '#005236',
        'tertiary-fixed': '#ffe088',
        'tertiary-fixed-dim': '#e9c349',
        'on-tertiary-fixed': '#241a00',
        'on-tertiary-fixed-variant': '#574500',
        background: '#f8f9ff',
        'on-background': '#0b1c30',
        'surface-variant': '#d3e4fe',
        // Named brand shortcuts (used directly in Components section of DESIGN.md)
        'trust-blue-900': '#0F172A',
        'growth-emerald-500': '#10B981',
        'premium-gold': '#D4AF37',
        'surface-gray-50': '#F8FAFC',
        'border-gray-200': '#E2E8F0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // [fontSize, {lineHeight, letterSpacing}] — font-weight is applied
        // separately (see the .headline-*/.body-*/.label-* classes in
        // globals.css) since Tailwind's fontSize scale doesn't carry weight.
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px' }],
        'headline-md': ['24px', { lineHeight: '32px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'label-sm': ['12px', { lineHeight: '16px' }],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        gutter: '24px',
        'margin-mobile': '16px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      },
      maxWidth: {
        // Matches DESIGN.md's literal token name (`spacing.container-max`).
        'container-max': '1280px',
      },
      boxShadow: {
        // Level 2 (Elevation & Depth): "very soft, diffused ambient shadow,
        // 10% opacity, 12px blur" — used on card hover/active states.
        'elevation-2': '0 4px 12px 0 rgb(15 23 42 / 0.10)',
        // AI Overlay: subtle glow (not a hard shadow) marking an
        // AI-processing / AI-powered surface, e.g. the natural-language
        // search input's focus state.
        'ai-glow': '0 0 0 1px rgb(16 185 129 / 0.25), 0 8px 24px -4px rgb(15 23 42 / 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
