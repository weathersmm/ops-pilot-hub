/**
 * Entry Mode Configuration
 * 
 * Controls how users enter the Fleet Command application:
 * - landing: Shows choice between internal and demo (fleet.ewproto.com)
 * - internal: Direct entry to internal dashboard (fleet-internal.ewproto.com)
 * - demo: Direct entry to demo experience (fleet-demo.ewproto.com)
 * 
 * Set via VITE_ENTRY_MODE environment variable
 */

export type EntryMode = 'landing' | 'internal' | 'demo';

export const ENTRY_MODE: EntryMode = 
  (import.meta.env.VITE_ENTRY_MODE as EntryMode) || 'landing';

export const isLandingEntry = ENTRY_MODE === 'landing';
export const isInternalEntry = ENTRY_MODE === 'internal';
export const isDemoEntry = ENTRY_MODE === 'demo';

export const entryConfig = {
  mode: ENTRY_MODE,
  isLanding: isLandingEntry,
  isInternal: isInternalEntry,
  isDemo: isDemoEntry,
} as const;
