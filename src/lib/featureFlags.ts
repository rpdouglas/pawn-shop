import { useState, useEffect } from 'react';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { remoteConfig } from './firebase';

export interface FeatureFlags {
  showStaffPicks: boolean;
  showRelatedItems: boolean;
  pawnFormEnabled: boolean;
}

function readFlags(): FeatureFlags {
  return {
    showStaffPicks:  getValue(remoteConfig, 'show_staff_picks').asBoolean(),
    showRelatedItems: getValue(remoteConfig, 'show_related_items').asBoolean(),
    pawnFormEnabled: getValue(remoteConfig, 'pawn_form_enabled').asBoolean(),
  };
}

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(readFlags);

  useEffect(() => {
    fetchAndActivate(remoteConfig)
      .then(() => setFlags(readFlags()))
      .catch((err) => {
        console.warn(
          'Remote Config fetch failed. Using local default flags. ' +
          'If you see a 403 error, ensure the "Firebase Installations API" is enabled ' +
          'and allowed on your API Key in Google Cloud Console.',
          err
        );
      });
  }, []);

  return flags;
}
