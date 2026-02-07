import { useState, useEffect } from "react";

export function useTelegram() {
  const [webApp, setWebApp] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
    }
  }, []);

  return {
    webApp,
    isReady: !!webApp,
    themeParams: webApp?.themeParams ?? {},
  };
}
