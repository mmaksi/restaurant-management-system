import { useEffect } from 'react';

/**
 * Hook to warn users about unsaved changes when navigating away
 * Handles browser refresh/close and back/forward navigation
 * For route navigation via Links, use the UnsavedChangesLink component instead
 * @param hasUnsavedChanges - Boolean indicating if there are unsaved changes
 * @param message - Optional custom warning message
 */
export const useUnsavedChangesWarning = (
  hasUnsavedChanges: boolean,
  message?: string
) => {
  const warningMessage =
    message || 'You have unsaved changes. Are you sure you want to leave?';

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, warningMessage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = () => {
      const shouldLeave = window.confirm(warningMessage);
      if (!shouldLeave) {
        // Push current state to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Push a state to enable popstate detection
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, warningMessage]);
};
