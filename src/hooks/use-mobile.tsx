import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const globalObj = typeof globalThis !== "undefined" ? (globalThis as typeof globalThis) : undefined;
    const hasMatchMedia = !!globalObj && "matchMedia" in globalObj;
    if (!hasMatchMedia) {
      setIsMobile(false);
      return;
    }

    const win = globalObj as unknown as Window;
    const mql = win.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(win.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);
    setIsMobile(win.innerWidth < MOBILE_BREAKPOINT);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
