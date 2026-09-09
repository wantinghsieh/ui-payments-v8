# Token Gaps & Core-UI Overrides — ui-payments-v8

Companion report for the tokenization of the app's custom styles against
**`@cox/ui-tokens` 7.0.78** (the version installed in `node_modules`; re-audited
from the earlier 7.0.44 pass — see §5 for what the upgrade changed).

**Scope of live custom styles.** Only three stylesheets are imported at runtime
(`src/index.tsx`): `styles/gaps.scss` (@font-face), `styles/app-tokens.scss`
(all `--payments-*` app tokens), and `styles/globals.scss` (every app-wide +
consolidated component rule). The per-component `.scss` files under
`src/components` / `src/templates` are orphaned (not imported) and are not part
of the live cascade.

**Palette note.** The primitive scales (`--color-*`, `--space-*`, `--sizing-*`,
`--radius-*`, `--font-size-*`, `--border-width-*`) are identical in value across
all three live theme scopes (`.spectrum-kite`, `.cox-busi`, `.cox-resi`), so a
value mapped to a primitive resolves to the same pixels in every theme. Only the
*semantic* colors differ between themes (the Spectrum flip); those are handled in
`app-tokens.scss` (see the `.spectrum-kite` block there).

**How to read this file.** Every untokenized value in `globals.scss` carries an
inline marker — `/* TOKEN-GAP: … */` for a true gap, or a short `// <value>`
note where a value was tokenized (or is a documented structural raw). Those
inline comments are the authoritative per-occurrence record; the tables below
summarize them by category. `app-tokens.scss` is the single home for new
app-scoped tokens.

---

## 1. App-scoped gap tokens (`src/styles/app-tokens.scss`)

These are values with **no equivalent in `@cox/ui-tokens` 7.0.78**. They are
centralized as `--payments-*` tokens so a future token release can replace the
raw value in one place. Colors are held as raw hex only because no Core color
matches; everything that *could* chain to a Core token already does (e.g.
gradients, price/status/toggle colors).

> **Token-source priority (active policy):** prefer a **@cox/core-ui8 semantic
> token** first, then a **@cox/ui-tokens primitive**, and only fall back to an
> app-scoped `--payments-*` token when neither has a match — mirroring how
> ui-resimyaccount-v8 consumes core tokens. Custom tokens replaced by core-ui8
> tokens so far (each self-themes per scope; the manual `.spectrum-kite` flips
> were dropped):
>
> | Was (custom) | Now (core-ui8) | Visual change |
> |---|---|---|
> | `--payments-heading-color` | `--color-text-default` | Spectrum headings `#4f648c`→`#000000` (Cox same) |
> | `--payments-toggle-on-bg` / `-border` | `--toggle-color-background-selected` / `--toggle-color-border-selected` | none (exact) |
> | `--payments-tab-active-color` | `--color-text-interactive` | Cox `#0f155b`→`#285a93` (Spectrum same) |
> | `--payments-status-on-color` | `--color-text-success` | Cox `#00d258`→`#017f58`; Spectrum `#017f58`→`#187d37` |
> | `--payments-color-text-input` | `--form-input-color-text-default` | Cox `#252525`→`#202020`; Spectrum →`#000000` |
> | `--payments-color-text-placeholder` | `--form-input-color-text-placeholder` | Cox `#b3b3b3`→`#6c7880`; Spectrum →`#4f648c` |
> | radio/checkbox default border + disabled | `--form-control-color-border-default` / `-{border,background}-disabled` | lighter control borders (checked state left on `--color-text-interactive` — see note) |
> | `--payments-color-error-alt` | `--color-text-error` | none (already chained to it via fallback) |
> | `ml-alert-*` banners (border+bg) | `--color-status-{error,warning,success,info}-default` / `-lighter` | Spectrum alerts now theme correctly; Cox warning→amber, info-bg shift |
> | `--payments-color-bg-error-tooltip` | `--color-status-error-lighter` | `#fbeeed`→`#fcf4f3`/`#fff5f3` |
> | `--payments-color-bg-{header,subtle,hero,statement}` | `--color-background-muted-1` | Cox →`#f4f8f9`; Spectrum →`#ffffff` (surfaces go white); unused `bg-autocomplete` dropped |
> | `--payments-color-text-subtle` | `--color-text-lighter` | Cox `#868e96`→`#6c7880`; Spectrum →`#4f648c` |
> | `--payments-color-text-dark` | `--color-text-default` | Cox `#333333`→`#202020`; Spectrum →`#000000` (unused `text-autocomplete` dropped) |
> | `--payments-color-border-{muted,divider,card,dropdown}` | `--color-border-default` | greys →`#b9c9d2`/`#c9cfdd`; card/dropdown lighten |
> | `--payments-color-border-light` | `--color-border-light` | `#dee2e6`→`#ebeff0` (unused `border-auto` dropped) |
> | `--payments-color-focus-outline` + `-field-focus` | `--focus-ring-color-default` | both focus indicators unify to `#009ae0` (field-focus hue teal→blue) |
> | `--payments-color-link-active` / `-menu-link` | `--color-interactive-text-link-active` / `-default` | link hues shift to semantic link colors |
>
> Radio/checkbox **checked** state was NOT aligned: core's `.spectrum-kite`
> `--form-control-color-background-selected` and `-mark-selected` are both
> `#ffffff` (white box + white mark), so a literal mapping onto the baked
> white-SVG checkmark would be invisible; it stays on `--color-text-interactive`
> pending the core-ui8 Storybook reference + a themeable-mark refactor.
>
> A latent bug was also fixed: a tab `:hover` referenced dead v5 token
> `--button-primary-color-surface-default-on-default` (missing in 7.0.78, no
> fallback) → now `var(--color-text-interactive)`.

| Token | Value | Nearest Core token | Notes |
|-------|-------|--------------------|-------|
| `--payments-color-bg-list-dark` | `#e4e4e4` | — | MegaMenu list bg |
| `--payments-color-link-active-bg` | `#e0dcdc` | — | drawer active-link bg |
| `--payments-color-footer-top-start/end` | `#0565a9`/`#045791` | — | footer gradient |
| `--payments-gradient-resi-spectrum` | `#03c252`,`#005eff` | Kite `--color-border-gradient` (theme-scoped) | theme-invariant brand bar; core hex only in Kite/Nova sets |
| `--payments-gradient-busi-spectrum` | `#005eff`,`#00194a` | Kite `#005eff` + Nova `#00194a` (theme-scoped) | theme-invariant brand bar; core hex only in Kite/Nova sets |
| `--payments-business-focus-border` | `#0074b3` | — | business focus ring |
| `--payments-business-focus-shadow` | `#51cbee` | — | business focus glow |
| `--payments-business-focus-shadow2` | `#146ea6` | — | business focus shadow |
| `--payments-color-badge-text` | `#202020` | `--color-neutral-1000` (locked) | default badge text |
| `--payments-color-shadow-*` / `-overlay-*` | `rgba(0,0,0,α)` composites | no `--elevation-*` primitive | shadows / scrims |
| `--payments-font-base/bold/medium` | `var(--font-family-sans, sans-serif)` | `--font-family-sans` | aliases to theme font; weight via font-weight |
| `--payments-space-2` | `0.625rem` (10px) | between `--space-100`/`-150` | off-grid spacing |
| `--payments-space-4` | `1.875rem` (30px) | — | off-grid spacing |
| `--payments-space-5` | `3.75rem` (60px) | `--space-800 64px` | off-grid spacing |
| `--payments-radius-md` | `0.875rem` (14px) | between `--radius-lg`/`-xl` | off-grid radius |
| `--payments-radius-pill` | `50px` | `--radius-pill 999px` (different visual) | app pill |
| `--payments-modal-max-width` | `798px` | — | layout |
| `--payments-page-padding` | `50px` | `--space-600 48px` | layout |
| `--payments-page-padding-cb` | `232px` | — | sidebar offset |
| `--payments-page-padding-md` | `150px` | — | mid-width padding |
| `--payments-page-padding-mob` | `30px` | — | mobile padding |
| `--payments-border-width-alert` | `4px` | `--border-width-3 3px` | alert accent stripe (1px off, kept exact) |
| `--payments-z-base/header/modal/tooltip` | `1`/`2`/`1000`/`1070` | — | structural stacking integers |

---

## 2. Gaps — inline `TOKEN-GAP` values in `globals.scss`

~344 inline markers remain. None have a suitable `@cox/ui-tokens` match (or are
brand-agnostic structural values kept raw by design). Grouped by category:

| Category | Count (approx) | Value examples | Nearest token | Notes |
|----------|----------------|----------------|---------------|-------|
| **Line-height in px** | ~66 | `34px`, `31px`, `24px`, `22px`, `21px` | none | Core has only unitless `--font-line-height-*` ratios; px line-heights can't map without a visual change |
| **Layout widths / heights / min-widths off the sizing scale** | ~90 | `215px`, `222px`, `200px`, `143px`, `272px`, `250px`, `350px`, `160px`, `33px/36px` input heights, `46px` | none | app-specific geometry; not on `--sizing-*` |
| **em-based sizes** | ~35 | `2.75em` price, `1.3em`, `1.125em`, `1.875em`, `0.813em`, `0.2em`, `0.8em`, `2.813em` | none | em/context-relative; no token |
| **Generic off-grid px (`TOKEN-GAP: Npx`)** | ~31 | `35px`, `26px`, `34px`, `42px`, `41px` | none within 1px | >1px from any `--space-*`/`--sizing-*` |
| **Negative nudges** | ~28 | `-26px`, `-35px`, `-52px`, `-14px`, `-18px`, `-22px` | none within 1px | alignment offsets |
| **Positional offsets** (tooltip/popover `left`/`top`/`right`) | ~24 | `left: 179px`, `top: -39px`, `right: 42px`, em positionals | none | structural coordinates (also see structural-raw notes) |
| **Sub-pixel / decimal px** | ~13 | `0.4px`, `9.6px`, `12.8px`, `7.3px`, `13.33px` | none | sprite/letter-spacing precision |
| **Sprite / icon geometry** | ~16 | `background-size: 12px 9.6px`, sprite `background-position`, `width: 41px` icon | none | tied to fixed sprite image (brand-agnostic) |
| **Micro-padding** | ~9 | `6px`, `7px`, `3px` | none within 1px | 6px/14px are >1px from nearest token |
| **Arrow / decorative geometry** | ~7 | `border-width: 7px 14px 7px 0`, `height: 0.4375rem` bar | none | CSS-drawn shapes |
| **Radio / checkbox custom size** | ~4 | `26px` radio, `12px` tick (in a duplicated block) | — | component-drawn control geometry |
| **font-size with no token** | ~5 | `8px` badge, `42px`, `88px` (`5.5rem`), `1.3rem` | none | below/between the `--font-size-*` ladder |
| **em-based radius** | 2 | `0.32em`, `0.39rem` | none | context-relative radius |
| **`5rem`/`0.8rem` page padding** | 4 | `.cox-content-url` | none | not in rem→space map |

> The 1745+ region also carries 5 notes reading `--sizing-N is core-uiN …`
> (pre-existing) documenting where core-ui8's own `--sizing-*`/`--color-*`
> values coincide with `@cox/ui-tokens` primitives.

**Structural raws (intentionally not tokenized, commented in place).** Per the
rebrand rules, brand-agnostic structural values stay raw: `1px` hairline
borders/outlines, `0` resets, `50%`/`%` dimensions, `100vh`/`vw`, `calc()`
internals, `z-index` stacking integers (incl. app-specific `14212`/`14000`),
`transition`/`animation` timing, gradient stops, and `@media` breakpoints. Each
is annotated `// … — structural raw` at its site.

---

## 3. Core-UI overrides (custom CSS targeting `@cox/core-ui8` selectors)

These rules override Core UI8 component styles and are flagged for the component
team rather than tokenized. All are marked `/* CORE-UI-OVERRIDE … */` inline.

| Line | Selector | Core UI component | Property | Value | Notes |
|------|----------|-------------------|----------|-------|-------|
| 802 | `.dynamic-banner .all-variations-banner-icon` | Banner | `height` | `46px !important` | enlarges banner icon |
| 1951 | `.form-control` reset on FormInput wrapper | FormInput | border/padding/background | reset | v5 adds `form-control` to wrapper; neutralize double-styling |
| 1962 | `.card-number` on FormInput | FormInput | width/layout | — | v5/v7 class-target drift compensation |
| 1971 | `.add-payment-form-container .status-banner .banner-link` | Banner | `display` | `none !important` | hide banner link |
| 2038 | `.dynamic-banner .banner-link .button` | Banner | `min-height`/`display`/`align-items` | `auto`/`inline-flex`/`center` | neutralizes app's global `.button` min-height (48px) colliding with core-ui8's unstyled Banner-link wrapper div of the same class name |
| 2122 | `.dynamic-banner .banner-link` | Banner | `display` | `none !important` | hide banner link |
| 5447 | `.dynamic-banner .banner-link` | Banner | `display` | `none` | hide banner link |
| 6287 | `.banner-container` | Banner | `width` | `100%` | full-width banner |
| 6224 | `.dynamic-banner` (in `.modal-content-container`) | Banner | `align-self`/`height` | `stretch`/`var(--space-300) !important` | full-width alert (counters container's `align-items: center`) + 24px banner icon |
| 6296 | `.dynamic-banner … .banner-container__body` | Banner | `align-items` | `center` | banner body alignment |
| 6405 | `.dynamic-banner .banner-link` | Banner | `display` | `none` | hide banner link |
| 6280 | `.cancel-easy-pay .modal-footer` (`min-width: 768px`) | Modal | `flex-direction`/`justify-content`/`.button width` | `row-reverse`/`center`/`auto` | pulls core-ui8's own ≥992px row/auto-width button treatment forward to 768px, scoped to the Cancel EasyPay modal only |
| 6221 | `.cancel-easy-pay .basic-modal-body-wrapper.custom-modal` | Modal | `width` | `100%` | core-ui8 only sets `max-width:100%` here and relies on `align-self:stretch` for actual sizing, but that only stretches the flex cross-axis — which is height below 992px (`.modal-body` is row-direction there) and width at ≥992px (column-direction) — causing the wrapper to shrink-wrap below 992px; an explicit width fixes it at every breakpoint |

Additional Core-UI interactions handled in-place (not raw-value gaps):
- `body .modal-backdrop` re-declares `--color-overlay-backdrop` because core-ui8
  scopes that var to `.cox-resi`/`.cox-busi`, which don't wrap Bootstrap's
  backdrop element (see globals.scss §10).
- `.dynamic-banner .primary-banner-icon` / `.banner-container__body` size + align
  fixes for the info banner (globals.scss §13).
- Business button / input overrides (`.business-primary-btn`, `.business-input`,
  etc.) and the `--button-primary-color-surface-hover-on-muted-1` tab-indicator
  token restoration live in `app-tokens.scss` / globals.scss §23.

---

## 4. Follow-ups / notes for reviewers

0. **`border-radius` / `border-width` sweep — RESOLVED.** A later verification pass
   caught raw radii/border-widths the first pass (spacing/font-size/color focused)
   had missed: `border-radius: 15px` and `14px` → `var(--payments-radius-md)`
   (the app's within-1px convention), `border: 2px double` → `var(--border-width-2)`.
   Genuine off-grid gaps documented inline: `border-radius: 3px` (off the `--radius-*`
   scale) and `border-width: … 1.6px …` (CSS-drawn checkmark). `0px` resets left raw
   (structural).

1. **Uncommented raw px in shorthands — RESOLVED.** The 7.0.78 re-audit swept the
   component region and tokenized the remaining convertible values: multi-value
   shorthands (`padding: 16px 28px` → `var(--space-200) var(--space-350)`),
   `gap`/`margin`/`padding` exact matches, and control/icon `width`/`height`
   (→ `--sizing-*`). Values left raw inside a shorthand (e.g. the `38px`/`10px`/
   `6px`/`7px` sat alongside a converted token) have no same-category token and
   remain documented gaps.
2. **`2px`/`3px` borders — RESOLVED.** All `border: Npx solid …` and
   `border-width` declarations now chain to `--border-width-2` / `--border-width-3`
   (identical rendering).
3. **Token upgrade 7.0.44 → 7.0.78 — DONE and re-audited.** `node_modules` now
   carries `@cox/ui-tokens` 7.0.78 / `core-ui8` 7.0.1503. See §5 for the delta.
4. **`--payments-color-badge-text: #202020`** is an *exact* match for
   `--color-neutral-1000` but is deliberately held raw as an anti-drift lock (it
   backstops core-ui8's inline badge-text style). Left as-is by design; convert to
   `var(--color-neutral-1000)` only if that safeguard is no longer wanted.

---

## 5. 7.0.78 re-audit — what the upgrade changed

Full re-audit of every dimensional value and all inline `TOKEN-GAP` markers in
`globals.scss` against the installed 7.0.78 palette. Dimensional scales
(`--space-*`, `--sizing-*`, `--font-size-*`, `--radius-*`, `--border-width-*`,
`--font-line-height-*`, `--font-weight-*`) are **identical across `.cox-resi`,
`.cox-busi`, `.spectrum-kite`**, so a dimensional match is theme-safe.

**Gaps closed by a new 7.0.78 token (marker removed, value tokenized):**

| Value | New 7.0.78 token | Where | Category |
|-------|------------------|-------|----------|
| `13px` | `--font-size-200` | extend/label sub-text | font-size (new 13px step) |
| `0.75rem`/`12px` | `--sizing-500` | badge / icon / radio tick sizes | sizing |
| `3.5rem`/`56px` | `--space-700` | `.card-number-left` padding (marker mislabeled it "positional") | space |
| `5rem`/`80px` | `--space-1000` | footer/content padding | space (existed pre-7.0.78; prior pass missed) |

**Color gaps — UNCHANGED.** Every color in §1 (`#d8544c`, `#edf8fd`, `#868e96`,
`#f2f6f7`, `#0679ca`, the footer/Spectrum gradient hexes, etc.) is still absent
in 7.0.78 → all remain genuine gaps. `globals.scss` colors were already fully
tokenized; the only raw hex there is `#id` selectors and `var(--token, #fallback)`
defensive fallbacks.

**Off-grid dimensional gaps — UNCHANGED.** 14px radius (`--payments-radius-md`),
4px alert stripe (`--payments-border-width-alert`), all px line-heights (Core has
only unitless `--font-line-height-*`), and app-specific widths/heights off the
`--sizing-*` scale (215px, 232px, 150px, 798px, …) still have no token.

**`--payments-page-padding` (50px) and `--payments-space-5` (60px) stay gaps.**
7.0.78 added `--sizing-1150: 50px` and `--sizing-1350: 60px`, but both app tokens
are used exclusively for **spacing** (page padding, `.m-5`/`.p-5` utilities). The
`--sizing-*` scale is the wrong semantic category for spacing; the nearest
*spacing* tokens (`--space-600: 48px`, `--space-800: 64px`) are still >1px off, so
these remain documented spacing gaps.

**Alternate spacing families NOT adopted (deliberate).** 7.0.78 ships
`--spacer-*`, `--spacing-comp-*`, and `--spacing-pattern-*` scales that include
off-`--space-*` values (14px, 36px, 44px, 88px, …). We did **not** adopt them:
they are component/pattern-level semantic aliases, the app has standardized on
`--space-*` as its spacing vocabulary, and — being theme-invariant like
`--space-*` — they offer no rebrand or visual benefit over the existing
`--payments-*` gap tokens. Mixing them in would only fragment the spacing
vocabulary. 14px/36px/44px/88px spacing therefore stays a documented gap. Revisit
only if the design system deprecates raw values in favor of these families.

**Structural raws re-confirmed:** `1px` hairline borders/outlines **and** `1px`
gaps, `0`, `50%`/`%`, `vh`/`vw`, `calc()` internals, z-index integers,
transition/animation timing, gradient stops, `@media` breakpoints, and positional
offsets (`top`/`right`/`bottom`/`left` coordinates) stay raw.
