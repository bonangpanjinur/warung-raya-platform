import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WhitelabelSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

const defaultSettings: WhitelabelSettings = {
  siteName: 'DesaMart',
  siteTagline: 'EKOSISTEM UMKM',
  logoUrl: null,
  faviconUrl: null,
};

interface WhitelabelContextType {
  settings: WhitelabelSettings;
  loading: boolean;
  refetch: () => Promise<void>;
}

const WhitelabelContext = createContext<WhitelabelContextType | undefined>(undefined);

export function useWhitelabel() {
  const context = useContext(WhitelabelContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      settings: defaultSettings,
      loading: false,
      refetch: async () => {},
    };
  }
  return context;
}

export function useWhitelabelProvider() {
  const [settings, setSettings] = useState<WhitelabelSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'whitelabel');

      if (error) throw error;

      if (data && data.length > 0) {
        const newSettings = { ...defaultSettings };
        data.forEach((item) => {
          if (item.key === 'site_name' && item.value) {
            newSettings.siteName = String(item.value);
          }
          if (item.key === 'site_tagline' && item.value) {
            newSettings.siteTagline = String(item.value);
          }
          if (item.key === 'logo_url' && item.value) {
            newSettings.logoUrl = String(item.value);
          }
          if (item.key === 'favicon_url' && item.value) {
            newSettings.faviconUrl = String(item.value);
          }
        });
        setSettings(newSettings);

        // Update document title
        document.title = newSettings.siteName;

        // Update favicon if set
        if (newSettings.faviconUrl) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = newSettings.faviconUrl;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching whitelabel settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    refetch: fetchSettings,
  };
}

export { WhitelabelContext, defaultSettings };
export type { WhitelabelSettings };
