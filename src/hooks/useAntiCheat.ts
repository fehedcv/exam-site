import { useEffect, useCallback } from 'react';

interface AntiCheatOptions {
  onCheatDetected: (method: string) => void;
  enabled: boolean;
}

export const useAntiCheat = ({ onCheatDetected, enabled }: AntiCheatOptions) => {
  const handleVisibilityChange = useCallback(() => {
    if (!enabled) return;
    
    if (document.hidden) {
      onCheatDetected('Tab Switching Detection');
    }
  }, [onCheatDetected, enabled]);

  const handleBlur = useCallback(() => {
    if (!enabled) return;
    onCheatDetected('Window Minimization Detection');
  }, [onCheatDetected, enabled]);

  const handleFullscreenChange = useCallback(() => {
    if (!enabled) return;
    
    if (!document.fullscreenElement) {
      onCheatDetected('Full-Screen Exit Detection');
    }
  }, [onCheatDetected, enabled]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    onCheatDetected('Right-click/Inspect Block');
  }, [onCheatDetected, enabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      onCheatDetected('Right-click/Inspect Block');
    }
  }, [onCheatDetected, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Request fullscreen on mount
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request failed, but continue anyway
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleVisibilityChange, handleBlur, handleFullscreenChange, handleContextMenu, handleKeyDown]);
};