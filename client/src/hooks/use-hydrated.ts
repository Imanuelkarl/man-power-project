import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Used to defer auth-gate redirects until zustand persist has restored state.
 */
export const useHydrated = () => {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}