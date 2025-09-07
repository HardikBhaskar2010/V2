import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [preferences, stats] = await Promise.all([
        apiService.getUserPreferences(),
        apiService.getUserStats()
      ]);
      
      setUserPreferences(preferences);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPreferences = async (newPreferences) => {
    try {
      const updated = await apiService.saveUserPreferences(newPreferences);
      setUserPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const updateSelectedComponents = (components) => {
    setSelectedComponents(components);
    localStorage.setItem('selectedComponents', JSON.stringify(components));
  };

  const incrementStat = async (statKey, increment = 1) => {
    try {
      // Optimistic update
      setUserStats(prev => ({
        ...prev,
        [statKey]: (prev[statKey] || 0) + increment,
        last_active_date: new Date().toISOString()
      }));
      
      // Update on server would happen here
      // For now, we'll just update locally
    } catch (error) {
      console.error('Error updating stat:', error);
    }
  };

  const value = {
    userPreferences,
    userStats,
    selectedComponents,
    loading,
    updateUserPreferences,
    updateSelectedComponents,
    incrementStat,
    refreshUserData: loadUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};