import { createContext, useContext } from "react";

const PhysicsEffectContext = createContext(null);

export function usePhysicsEffect() {
  const ctx = useContext(PhysicsEffectContext);
  return ctx;
}

export function PhysicsEffectProvider({ children, apiRef }) {
  return (
    <PhysicsEffectContext.Provider value={apiRef}>
      {children}
    </PhysicsEffectContext.Provider>
  );
}
