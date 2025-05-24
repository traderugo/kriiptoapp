'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Stop the browser from showing its mini-banner
      setDeferredPrompt(e);
      setShowPrompt(true); // Show our custom button
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User response:', outcome);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <span>Install this app?</span>
      <button onClick={handleInstall} className="bg-white text-blue-600 font-semibold px-3 py-1 rounded">
        Install
      </button>
    </div>
  );
}
