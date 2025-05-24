'use client';

import { useEffect, useState } from 'react';

export default function PWAiOSBanner() {
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-yellow-300 text-black p-3 rounded-lg shadow-lg z-50">
      <p className="text-sm">
        Install this app: Tap <strong>Share</strong> &rarr; <strong>Add to Home Screen</strong>
      </p>
      <button onClick={() => setShowBanner(false)} className="text-xs mt-2 underline">
        Dismiss
      </button>
    </div>
  );
}
