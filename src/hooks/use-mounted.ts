import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False while rendering on the server / the first hydration pass, true in
 * the browser afterwards. Every page is pre-built as static HTML, so
 * anything that depends on the visitor (their clock, localStorage, the
 * URL's query string) must wait for this rather than be baked in.
 */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/** Reads a ?query value from the current URL once in the browser ("" on the server). */
export function useQueryParam(name: string) {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get(name) ?? "",
    () => ""
  );
}

const NARROW_QUERY = "(max-width: 600px)";

/** True on phone-width screens (false on the server); follows window resizes. */
export function useIsNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(NARROW_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false
  );
}
