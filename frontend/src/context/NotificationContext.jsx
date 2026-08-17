import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.uid || 'default_farmer';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({ all: 0, weather: 0, price: 0, scheme: 0, marketplace: 0, system: 0 });
  const [urgentToast, setUrgentToast] = useState(null);
  const [settings, setSettings] = useState({
    enable_weather_alerts: true,
    enable_price_alerts: true,
    enable_scheme_alerts: true,
    enable_marketplace_alerts: true,
    price_change_threshold: 5.0,
    rain_probability_threshold: 70,
    watchlist_crops: ['wheat', 'paddy', 'mustard', 'soybean', 'cotton'],
    farm_location: 'Karnal, Haryana'
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();

    // Poll for real-time alerts every 20 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async (isBackgroundPoll = false) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/notifications?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const incoming = data.notifications || [];
        
        // If background poll finds a new critical/warning alert, trigger urgent toast
        if (isBackgroundPoll && incoming.length > 0 && notifications.length > 0) {
          const newest = incoming[0];
          if (newest.id !== notifications[0]?.id && (newest.severity === 'critical' || newest.severity === 'warning')) {
            showToast(newest);
          }
        }

        setNotifications(incoming);
        setUnreadCount(data.unread_count || 0);
        setCategoryCounts(data.category_counts || { all: 0, weather: 0, price: 0, scheme: 0, marketplace: 0, system: 0 });
      }
    } catch (e) {
      console.warn('Notifications fetch note:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/notifications/settings?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.warn('Settings fetch note:', e);
    }
  };

  const showToast = (item) => {
    setUrgentToast(item);
    setTimeout(() => {
      setUrgentToast((prev) => (prev?.id === item.id ? null : prev));
    }, 6000);
  };

  const dismissToast = () => {
    setUrgentToast(null);
  };

  const markAsRead = async (notifId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/mark-read/${notifId}?user_id=${userId}`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Mark read note:', e);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);

    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/mark-all-read?user_id=${userId}`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Mark all read note:', e);
    }
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSettings, user_id: userId })
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch (e) {
      console.warn('Save settings note:', e);
    }
  };

  const triggerSimulation = async (triggerType, customPayload = {}) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/notifications/trigger-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          trigger_type: triggerType,
          ...customPayload
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'triggered' && data.notification) {
          showToast(data.notification);
          fetchNotifications();
        }
        return data;
      }
    } catch (e) {
      console.warn('Trigger simulation note:', e);
    }
    return null;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        categoryCounts,
        urgentToast,
        showToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        settings,
        updateSettings,
        triggerSimulation,
        isDrawerOpen,
        setIsDrawerOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
