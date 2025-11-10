/**
 * App Mode Configuration
 * 
 * Controls whether the app runs in INTERNAL or DEMO mode:
 * - INTERNAL: Production mode for LifeLine EMS staff (real data, no public signup)
 * - DEMO: Public demo mode for prospects (mock data, public signup enabled)
 * 
 * Set via VITE_APP_MODE environment variable
 */

export type AppMode = 'internal' | 'demo';

export const APP_MODE: AppMode = 
  (import.meta.env.VITE_APP_MODE as AppMode) || 'internal';

export const isInternalMode = APP_MODE === 'internal';
export const isDemoMode = APP_MODE === 'demo';

export const config = {
  appMode: APP_MODE,
  isInternal: isInternalMode,
  isDemo: isDemoMode,
  
  // Demo mode configurations
  demo: {
    enablePublicSignup: isDemoMode,
    defaultLandingRoute: isDemoMode ? '/demo' : '/',
    signupRoute: '/demo/signup',
    loginRoute: '/demo/login',
  },
  
  // Internal mode configurations
  internal: {
    enablePublicSignup: false,
    defaultLandingRoute: '/',
    loginRoute: '/auth',
  },
} as const;
