import React, { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';

const OfflineNotice = () => {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const aoEntrarOnline = () => setOffline(false);
    const aoEntrarOffline = () => setOffline(true);

    window.addEventListener('online', aoEntrarOnline);
    window.addEventListener('offline', aoEntrarOffline);
    return () => {
      window.removeEventListener('online', aoEntrarOnline);
      window.removeEventListener('offline', aoEntrarOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-bold text-white shadow-md"
    >
      <CloudOff size={17} aria-hidden="true" />
      Sem internet. Seus dados continuam salvos neste aparelho.
    </div>
  );
};

export default OfflineNotice;
