# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`ui-payments-v8` (Maven artifact `com.cox.webstrategy.ui.payments-v8`, app name `payments`) is the
Cox.com **Payments** React v8 frontend — one-time payments, EasyPay/automatic payments, future payments,
payment extensions, prepaid recharge, and saved payment-method (MOP) management. It is served at the
`/ui/v8/payments/` path prefix and consumed by the Cox.com Java backend (webapi-wafr3 / eCare "CB" flows)
via server-injected page data, not a typical SPA-owns-its-data app. See `~/.claude/CLAUDE.md` for the
broader Cox.com repo ecosystem.

## Commands

Package manager is **pnpm** (registry: internal Artifactory, see `.npmrc`).

- `pnpm install`
- `pnpm start` — dev server (CRA `react-scripts start`), localhost:3000
- `pnpm test` — Jest via CRA, interactive watch. Single test: `pnpm test -- src/path/File.test.tsx` or `pnpm test -- -t "test name"`
- `pnpm run build` — `react-scripts build && node build.js`. `build.js` stamps `public/release.txt`
  (Build-Date/Release-Tag/UI-Core-Tag) from a `--jenkinsVersion=` arg; without that arg (e.g. running
  locally) it logs an error to console but does not fail the build — the try/catch swallows it.
- `pnpm storybook` — Storybook 8 dev server on port 6006
- `pnpm storybook:build` — static Storybook build
- `pnpm format` — `prettier --write .`
- Full CI packaging is Maven-driven: `pom.xml` uses `frontend-maven-plugin` to install a pinned
  node/pnpm, then runs `pnpm install`, `pnpm run build --jenkinsVersion=${jenkins.version}`,
  `pnpm run storybook:build`, and `scripts/inject-build-info.js`, then bundles three separate
  `maven-assembly-plugin` outputs (`src/main/assembly/{assembly,prototype,storybook-static}.xml`).
  `jenkins.version` is `${MAJOR_VERSION}.${MINOR_VERSION}.${BUILD_NUMBER}` from `build.properties`.

There is no ESLint/typecheck script beyond what `react-scripts` runs inline; `tsc` is `noEmit` (CRA
handles transpilation). `@craco/craco` is a devDependency but unused by any script — don't assume a
`craco.config.js` exists.

## Prototype vs. production: the load-bearing split

Nearly every page and hook branches on **which environment it's running in**, and this distinction
drives most non-obvious code in the repo:

- **Prototype/QA mode**: served under a URL containing `/ui/v8` with a `?protoversion=` query param
  (Storybook-adjacent static hosting). Step transitions are **hard redirects** (`window.location.href`)
  to static `*.html?protoversion=<step>` URLs, driven by static JSON fixtures. Detected by
  `isPrototypeUrl()` (checks `/ui/v8` in the URL) and `isPrototype()` (checks `window.RequestJson` is
  undefined) in `src/utils/helper-utlities.ts` — these are **not the same check** and are used in
  different places; don't conflate them.
- **Production mode**: the Java backend injects page state as `window.RequestJson`, surfaced to React
  via `@cox/core-ui8`'s `useAppDataContext()`. Step transitions are real `POST`s through core-ui8's
  `useAxios`, which injects the CSRF token and credentials and handles server redirects — application
  code should never issue these requests directly, only build the request config.

`src/services/paymentsService.ts` centralizes, per `PaymentFlowName`/`PaymentStep`
(`src/types/payment.ts`), both the prototype redirect URL and the production POST URL/config, but
returns a plain `PaymentRequestConfig` object rather than performing the HTTP call itself. The shared
hook `src/hooks/usePaymentStepSubmit.ts` is what actually branches on `isPrototypeUrl()` and either
redirects or calls `axiosAPI(request)`. New payment flows should route through this hook + service
rather than reimplementing the branch.

`src/hooks/constants.ts` holds both `*_PAGE_PROTOTYPE` (static `/ui/v8/payments/*.html` URLs) and
production `*.rest` endpoints / error redirect URLs side by side, grouped per flow (make-payment,
easypay/automatic-payments, future-payment, extend-payment, prepaid-recharge,
prepaid-automatic-recharge, MOP management).

## Request flow: server payload → step-driven templates

1. `src/index.tsx` mounts `ThemeProvider` (`@cox/ui-theme`, `initialTheme="cox-resi"`) +
   `ThemeClassSyncer` (`src/utils/ThemeClassSyncer.tsx`, keeps core-ui8's own DOM wrappers in sync
   with the active theme class since they don't consume `ThemeProvider` directly), then `App`.
2. `App.tsx` wraps everything in core-ui8's `Layout` and `PaymentContextProvider`
   (`src/context/PaymentContextProvider.tsx` — a thin `{ paymentData, setPaymentData }` context; this
   is the in-memory holder for the *current step's* server payload, separate from `appData`).
3. `AppRoutes.tsx` reads `appData` via `useAppDataContext()` and derives `customerType`
   (`"residential"` vs `"business"`), then mounts **three separate `<Router>` instances**, each with
   its own route table — this split is deliberate, preserve it when adding routes:
   - `OktaFlowRoutes` — session-authenticated flows gated behind `GlobalSideNav` (prepaid recharge,
     automatic payments, future payment, payment extension, manage-payment-method).
   - `TokenizedFlowRoutes` — token-authenticated flows (`pay-now.html`, `auto-pay.html`,
     add-payment-method, error pages), rendered outside the side-nav shell.
   - `CbOktaFlowRoutes` — business/"CB" routes, path-prefixed `business/...`.
   `AppRoutes` also flips the active theme class (`cox-resi`/`cox-busi`) per `customerType` and
   conditionally renders Cox-branded vs. CB-branded header/footer/hero chrome.
4. Each **page** component (`src/pages/*`) receives `sections` (parsed from `appData`), copies
   `sections.payment` into `PaymentContext` on mount, and re-renders whichever **template**
   (`src/templates/<Flow>Template/`) matches `paymentData.pageName` — a `PaymentStep` value
   (`"setup" | "setup-mop" | "review" | "confirm" | "error" | ...`, see `src/types/payment.ts`). The
   step to render comes from the *payload*, not the router — advancing a flow means the POST response
   carries a new `pageName`, which `setPaymentData` swaps in.
5. **Templates** receive `payment` + `onPostSubmitResponse` and use `usePaymentStepSubmit` to advance
   to the next step. `src/types/payment.ts`'s `PaymentData` is the typed contract for
   `sections.payment` — fields are optional by design since the payload shape varies per flow/step.

## Theming

`@cox/ui-tokens` ships residential and business primitive token sets scoped by `.cox-resi`/`.cox-busi`
classes (both imported unconditionally in `src/index.tsx`); `@cox/ui-theme`'s `ThemeProvider` owns
which class is active on `<html>`. Style import order in `index.tsx` is significant and commented
in-place: bootstrap → core-ui8 `index.css` (so core-ui8 tokens win the cascade) → `styles/gaps.scss`
(font-face + spacing, must precede font-family usage) → `styles/app-tokens.scss` → `styles/globals.scss`.

## Component layout conventions

- `src/components/Cb*` (`CbPageHeader`, `CbPageFooter`, `CbPageHero`, plus `MegaMenu`/`Notifications`/
  `Support` under `CbPageHeader/`) and `BlurCbBackground` are the business/"CB" chrome.
- `src/components/widgets` (`minimalHeader`/`minimalFooter`) plus `PageHeader` are the residential
  minimal chrome, used when the server payload says not to display the full header/footer.
- Payment-specific UI: `CardMop`, `PaymentAmount`, `PaymentDate`, `AddPaymentMethod`/
  `EditPaymentMethod` (card/bank forms), `RemoveOrMakeDefaultModal`, `TrustlyWidget`/
  `TrsutlyErrorWidget` (Trustly bank-account payment integration — note the existing typo in the
  "Trsutly" filename, don't silently rename it in unrelated changes).
- `src/utils/helper-utlities.ts`'s `getMopIcon` resolves saved-payment-method icons with a specific
  fallback order (bank+providerId → generic bank icon → card classType SVG → type-as-brand SVG →
  generic bank icon); read its doc comment before changing icon resolution logic.

## Storybook

`src/stories/*.mdx` document each flow against static fixtures in `src/stories/data/`, used for
prototype/QA review independent of the live backend. Config: `.storybook/main.ts`
(`@storybook/react-webpack5` + CRA preset).
