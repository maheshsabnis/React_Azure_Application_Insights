/**
 * Time Range Context and Hooks
 *
 * Provides a global time range filter that is shared across all dashboard pages.
 * The time range (e.g., "24h", "7d") is stored in React Context and accessible
 * from any component via the FNuseTimeRange() hook. When the user changes the time
 * range in the header dropdown, all pages automatically refetch data.
 */

import { useState, createContext, useContext } from 'react';

/** Shape of the time range context value. */
interface CLSTimeRangeContextType {
  /** Current time range value (e.g., "30m", "1h", "24h", "7d"). */
  timeRange: string;
  /** Updates the global time range, triggering refetches across all pages. */
  setTimeRange: (tr: string) => void;
}

/**
 * React Context that holds the global time range state.
 * Default value is "24h" (last 24 hours).
 */
export const TimeRangeContext = createContext<CLSTimeRangeContextType>({
  timeRange: '24h',
  setTimeRange: () => {},
});

/**
 * Hook to read and update the global time range from any component.
 * Must be used within a TimeRangeContext.Provider.
 */
export const FNuseTimeRange = () => useContext(TimeRangeContext);

/**
 * Hook that creates the time range state for the context provider.
 * Used in App.tsx to initialize the context value.
 * @returns Object with timeRange value and setTimeRange setter.
 */
export const FNuseTimeRangeState = () => {
  const [timeRange, setTimeRange] = useState('24h');
  return { timeRange, setTimeRange };
};
