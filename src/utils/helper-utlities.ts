import BankIcon from "../assets/icons/bank.svg";

// Base URL for paywithmybank.com institution assets
const BANK_ICON_BASE = "https://paywithmybank.com/start/assets/institutions";

/**
 * Returns the icon src for a saved payment method (MOP).
 *
 * Resolution order:
 *  1. BANK + paymentProviderId  → provider-specific logo from paywithmybank.com
 *  2. BANK (no paymentProviderId) → generic green bank icon from paywithmybank.com
 *  3. CARD/CREDIT + classType   → bundled SVG matched by classType (e.g. "visa", "mastercard")
 *  4. CARD/CREDIT (no classType) → bank.svg fallback
 *  5. type is a brand name      → bundled SVG matched by type directly (e.g. type="visa")
 *                                 NOTE: type is used as-is; casing must match the SVG filename
 *                                 (e.g. "ATM" → ATM.svg, "visa" → visa.svg)
 *  6. type missing/unknown      → bank.svg fallback
 */
export const getMopIcon = (
  type?: string,
  classType?: string,
  paymentProviderId?: string,
): string => {
  if (type?.toUpperCase() === "BANK") {
    // Trim to guard against whitespace-only provider IDs producing a broken URL
    const providerId = paymentProviderId?.trim();
    return providerId
      ? `${BANK_ICON_BASE}/icons/${providerId}.png`
      : `${BANK_ICON_BASE}/defaults/icon/default_green.png`;
  }

  if (type?.toUpperCase() === "CARD" || type?.toUpperCase() === "CREDIT") {
    if (!classType) {
      // No classType available — cannot resolve a card-brand icon
      return BankIcon;
    }
    // Dynamically require the card-brand SVG; fall back to bank.svg if not found
    try {
      return require(`../assets/icons/${classType}.svg`);
    } catch {
      return BankIcon;
    }
  }

  if (type) {
    // type itself is a card brand (e.g. "visa", "mastercard", "ATM") — try {type}.svg directly
    try {
      return require(`../assets/icons/${type}.svg`);
    } catch {
      return BankIcon;
    }
  }

  // Default fallback when type is absent or unrecognised
  return BankIcon;
};

// Navigates the browser to the given URL
const redirectToPage = (url: string) => {
  window.location.href = url;
};

// Returns true when running in the prototype environment (/ui/v8 with ?protoversion)
const checkProtoVersionEnabled = () => {
  return (
    window.location.href.includes("ui/v8") &&
    window.location.search.includes("protoversion")
  );
};

/**
 * Returns the subset of statement blocks to display.
 * When viewAll is false, caps the total visible statement rows at MAX_STATEMENTS,
 * slicing the last block if needed rather than dropping it entirely.
 */
const getVisbileStatements = (cbPaymentDetails: any, viewAll: boolean) => {
  const MAX_STATEMENTS = 2;
  const visibleStatements = [];
  let showStatementCount = 0;
  for (let block of cbPaymentDetails) {
    const statementBlock = block?.statementDetails?.length || 0;
    if (viewAll) {
      visibleStatements.push(block);
    } else {
      if (showStatementCount + statementBlock <= MAX_STATEMENTS) {
        visibleStatements.push(block);
        showStatementCount += statementBlock;
      } else {
        const remainingStatements = MAX_STATEMENTS - showStatementCount;
        if (remainingStatements > 0) {
          visibleStatements.push({
            serviceName: block?.serviceName,
            statementDetails: block?.statementDetails?.slice(
              0,
              remainingStatements,
            ),
          });
        }
        break;
      }
    }
  }
  return visibleStatements;
};

// Returns true when NOT in the prototype environment (i.e. RequestJson is injected by the server)
export function isPrototype() {
  return window?.RequestJson === undefined;
}

/* True when running under the Storybook/QA prototype (served from the /ui/v8 prefix),
   where flow transitions are hard redirects to protoversion URLs rather than REST posts. */
export const isPrototypeUrl = () =>
  typeof window !== "undefined" && window.location.href.includes("/ui/v8");

/**
 * Resolves a relative AEM DAM asset path (e.g. "/content/dam/cox/...") so it loads
 * correctly outside the environments that reverse-proxy AEM at their own origin.
 * Mirrors @cox/core-ui8's own internal resolver (used by Banner's iconPath) so a raw
 * <img src> behaves the same as core-rendered icons: on localhost, where there is no
 * AEM proxy, the path is prefixed with the public Cox domain; elsewhere it's left
 * relative since the serving domain already proxies /content/dam itself.
 */
export const resolveAemAssetPath = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) {
    return path;
  }
  const isLocalhost =
    typeof window !== "undefined" && window.location.href.includes("localhost");
  return isLocalhost ? `https://www.cox.com${path}` : path;
};

/**
 * Fires a custom page action event to New Relic for observability.
 * No-ops in the prototype environment or when New Relic is not loaded.
 */
export const logToNewRelicPageAction = async (
  message: string,
  type: string,
  info: string,
) => {
  if (isPrototype()) {
    console.log("Aborting logToNewRelicPageAction as isPrototype=true");
    return;
  }

  if (!(window as any)?.newrelic) {
    console.log("New Relic not available, logging to console only");
    return;
  }

  console.log(`Logging to New Relic: ${message}`);

  (window as any)?.newrelic.addPageAction("PaymentV8PageActionLog", {
    message,
    type,
    timestamp: new Date().toISOString(),
    info,
  });
};

export { redirectToPage, checkProtoVersionEnabled, getVisbileStatements };
