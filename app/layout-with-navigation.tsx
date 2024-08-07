/**
 * Layout With Navigation Component
 * 
 * Context: This component is part of the app's root layout structure.
 * Global Purpose: Provides a consistent navigation wrapper for all pages.
 * Local Purpose: Wraps child components with the NavigationWrapper.
 * Key Features:
 * - Acts as a higher-order component for navigation
 * - Ensures consistent layout across different pages
 * - Passes children components to NavigationWrapper
 */

import NavigationWrapper from '../components/ControlPanel/NavigationWrapper';

export default function LayoutWithNavigation({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationWrapper>
      {children}
    </NavigationWrapper>
  );
}