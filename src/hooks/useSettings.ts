import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsData {
  [key: string]: number;
}

const DEFAULT_SETTINGS: SettingsData = {
  starter_credits: 20,
  free_trial_credits: 20
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('key, value');

      if (fetchError) {
        console.warn('Error fetching settings from database, using defaults:', fetchError);
        setSettings(DEFAULT_SETTINGS);
        setError(null); // Don't show error to user, just use fallback
        return;
      }

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value || DEFAULT_SETTINGS[setting.key] || 20;
          return acc;
        }, {} as SettingsData);

        // Merge with defaults to ensure all required settings exist
        setSettings({ ...DEFAULT_SETTINGS, ...settingsObj });
      } else {
        // No settings data in database, use defaults
        console.log('No settings data found in database, using defaults');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.warn('Network or other error fetching settings, using defaults:', err);
      setSettings(DEFAULT_SETTINGS);
      setError(null); // Don't show error to user, just use fallback
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string, defaultValue = 20) => {
    return settings[key] || defaultValue;
  };

  return {
    settings,
    loading,
    error,
    getSetting,
    refetch: fetchSettings
  };
};