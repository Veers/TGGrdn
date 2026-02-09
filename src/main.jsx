import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TonConnectUIProvider, TonConnect, CHAIN } from "@tonconnect/ui-react";
import { MotionConfig } from "framer-motion";
import "./index.css";
import { GameProvider } from "./context/GameContext";
import App from "./App.jsx";

const manifestUrl =
  typeof window !== "undefined"
    ? new URL("tonconnect-manifest.json", window.location.href).href
    : "";

const connector =
  typeof window !== "undefined" &&
  manifestUrl &&
  (() => {
    const c = new TonConnect({ manifestUrl });
    c.setConnectionNetwork(CHAIN.TESTNET);
    return c;
  })();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GameProvider playSound={undefined}>
      <MotionConfig reducedMotion="user">
        <TonConnectUIProvider {...(connector ? { connector } : { manifestUrl })}>
          <App />
        </TonConnectUIProvider>
      </MotionConfig>
    </GameProvider>
  </StrictMode>,
);
