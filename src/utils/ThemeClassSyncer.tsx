import { useEffect } from 'react';
import { THEME_IDS, useTheme, type ThemeId } from '@cox/ui-theme/provider';

/**
 * core-ui8's `useLobExperience()` stamps a `cox-resi` / `cox-busi` theme class onto its
 * own component wrappers (derived from window.location.href), independent of ThemeProvider.
 * That closer scope re-declares every design token with residential values, shadowing the
 * Spectrum (.spectrum-kite) tokens on the <html> element — so core-ui8 widgets render
 * residential colors even when ThemeProvider has selected spectrum-kite.
 *
 * This shim rewrites those injected theme classes to the active theme so the wrappers pick
 * up the `.spectrum-kite { --... }` token block (from @cox/ui-tokens). core-ui8 uses these
 * classes only to define tokens (never as `.cox-resi .x` style selectors), so swapping the
 * class is safe — it only changes which token values the wrapper resolves.
 *
 * ThemeProvider is the single writer for <html>; this only touches descendant wrappers.
 *
 * The active theme is customerType-driven (resi → spectrum-kite, business → cox-busi), so on
 * business flows this is a no-op that keeps wrappers on cox-busi.
 */
const ALL_THEMES = THEME_IDS as readonly ThemeId[];
const SELECTOR = ALL_THEMES.map((t) => `.${t}`).join(', ');

export const ThemeClassSyncer = () => {
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const sync = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el === document.documentElement) return;
        ALL_THEMES.forEach((id) => {
          if (id !== theme) el.classList.remove(id);
        });
        if (!el.classList.contains(theme)) el.classList.add(theme);
      });
    };

    sync();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          sync();
          return;
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [theme]);

  return null;
};
