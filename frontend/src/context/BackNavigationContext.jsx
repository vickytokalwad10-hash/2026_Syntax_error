/**
 * ============================================================================
 * AGRIPULSE AI — UNIFIED BACK BUTTON NAVIGATION SYSTEM
 * ============================================================================
 * Handles Android Hardware Back Button, Gesture Navigation, and Browser History:
 * 1. Closes topmost open modals / drawers / overlays first.
 * 2. Navigates back in internal app history (`navigate(-1)`) from any non-root page.
 * 3. Intercepts back on Home/Overview with a 2-second double-tap exit confirmation toast.
 * 4. Supports native Capacitor Android runtime and PWA / mobile browser fallback.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useLanguage } from './LanguageContext';

const BackNavigationContext = createContext(null);

// Root routes where back press should trigger exit confirmation instead of routing back
const ROOT_ROUTES = ['/', '/overview', '/farmer-dashboard', '/login'];

export function BackNavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressTimeRef = useRef(0);
  const exitToastTimerRef = useRef(null);
  const overlayStackRef = useRef([]); // Stack of { id, close: () => void }

  // Keep references to latest location & navigate without re-binding listeners
  const locationRef = useRef(location);
  locationRef.current = location;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  /**
   * Register an overlay/modal with a close callback.
   * If back button is pressed while registered, it closes the overlay instead of navigating.
   */
  const registerOverlay = useCallback((id, closeCallback) => {
    // Remove if already in stack, then push to top
    overlayStackRef.current = overlayStackRef.current.filter((o) => o.id !== id);
    overlayStackRef.current.push({ id, close: closeCallback });
  }, []);

  /**
   * Unregister an overlay when it is closed or unmounted.
   */
  const unregisterOverlay = useCallback((id) => {
    overlayStackRef.current = overlayStackRef.current.filter((o) => o.id !== id);
  }, []);

  /**
   * Core Back Action Dispatcher
   */
  const handleBackAction = useCallback(() => {
    // 1. If any modal / drawer / overlay is currently open, close the topmost one
    if (overlayStackRef.current.length > 0) {
      const topOverlay = overlayStackRef.current[overlayStackRef.current.length - 1];
      if (topOverlay && typeof topOverlay.close === 'function') {
        topOverlay.close();
        return;
      }
    }

    const currentPath = locationRef.current.pathname;
    const isRoot = ROOT_ROUTES.includes(currentPath);

    // 2. If on a non-root page: navigate back to previous screen in app history
    if (!isRoot) {
      navigateRef.current(-1);
      return;
    }

    // 3. If on a root page: execute double-press exit confirmation cycle (2000ms window)
    const now = Date.now();
    const timeSinceLastPress = now - lastBackPressTimeRef.current;

    if (timeSinceLastPress < 2000 && lastBackPressTimeRef.current > 0) {
      // Second back press within 2 seconds -> Exit app
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.exitApp();
      } else {
        // In browser / PWA fallback
        window.history.back();
      }
    } else {
      // First back press -> Show confirmation toast and start 2-second countdown
      lastBackPressTimeRef.current = now;
      setShowExitToast(true);

      if (exitToastTimerRef.current) {
        clearTimeout(exitToastTimerRef.current);
      }

      exitToastTimerRef.current = setTimeout(() => {
        setShowExitToast(false);
        lastBackPressTimeRef.current = 0;
      }, 2000);
    }
  }, []);

  /**
   * Native Capacitor Hardware Back Button Listener
   */
  useEffect(() => {
    let backListenerHandle = null;

    const setupCapacitorListener = async () => {
      try {
        if (Capacitor.isNativePlatform() || window.Capacitor) {
          backListenerHandle = await CapacitorApp.addListener('backButton', () => {
            handleBackAction();
          });
        }
      } catch (err) {
        console.warn('Capacitor backButton setup note:', err);
      }
    };

    setupCapacitorListener();

    return () => {
      if (backListenerHandle && typeof backListenerHandle.remove === 'function') {
        backListenerHandle.remove();
      }
      if (exitToastTimerRef.current) {
        clearTimeout(exitToastTimerRef.current);
      }
    };
  }, [handleBackAction]);

  /**
   * Browser / PWA Popstate Fallback (handles browser back & mobile swipe back)
   */
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      const handlePopState = () => {
        // If overlays are open, close them
        if (overlayStackRef.current.length > 0) {
          const topOverlay = overlayStackRef.current[overlayStackRef.current.length - 1];
          if (topOverlay && typeof topOverlay.close === 'function') {
            topOverlay.close();
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  return (
    <BackNavigationContext.Provider
      value={{
        registerOverlay,
        unregisterOverlay,
        handleBackAction
      }}
    >
      {children}

      {/* Hand-Drawn Papercraft Exit Confirmation Toast */}
      {showExitToast && (
        <div
          id="exit-toast-banner"
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="bg-[#1c1917]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-floating border border-amber-400/40 flex items-center gap-2.5 paper-card !p-2.5 !bg-[#1c1917] !text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="material-symbols-outlined text-amber-400 text-[18px]">arrow_back</span>
            <p className="text-xs sm:text-sm font-bold tracking-wide">
              {t('common.pressBackToExit') || 'Press back again to exit'}
            </p>
          </div>
        </div>
      )}
    </BackNavigationContext.Provider>
  );
}

export function useBackNavigation() {
  const context = useContext(BackNavigationContext);
  if (!context) {
    throw new Error('useBackNavigation must be used within a BackNavigationProvider');
  }
  return context;
}
