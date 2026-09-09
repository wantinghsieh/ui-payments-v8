# StepIndicator — component spec

Reverse-engineered from its two call sites (`src/pages/MakePayment.tsx`,
`src/pages/PaymentError.tsx`) and the styles that already target it
(`.step-indicator` rules in `src/styles/globals.scss`). The existing
`stepindicator.tsx` is being regenerated from scratch against this spec —
the CSS is **not** being regenerated, so the DOM contract below is
load-bearing, not a suggestion.

## Location & export

- `src/components/widgets/stepindicator/stepindicator.tsx`
- Default export, function component, matching the sibling `widgets/*`
  components' style (`MinimalHeader.tsx`, `CustomModal.tsx`): a typed
  `Props` interface + `const StepIndicator: React.FC<StepIndicatorProps> = (...) => {...}`.
- No `index.ts` barrel — both call sites import the file directly
  (`import StepIndicator from "../components/widgets/stepindicator/stepindicator"`).
  Keep the lowercase `stepindicator.tsx` filename; don't rename to
  `StepIndicator.tsx`, it would break the existing import paths.
- **Don't** add a colocated `stepindicator.scss` imported from the component.
  A colocated `stepindicator.scss` already exists in that folder today and
  is dead: nothing `import`s it. `src/index.tsx` only pulls in
  `styles/gaps.scss`, `styles/app-tokens.scss`, and `styles/globals.scss`
  (in that order, order matters — see that file's inline comments); that's
  the only chain that reaches the bundle. Live `.step-indicator` /
  `.pending-step` rules already exist in `globals.scss` (search for the
  `components/widgets/stepindicator/stepindicator.scss` section-comment
  marker there) using token vars like `var(--color-blue-700)`,
  `var(--color-neutral-600)`, `var(--space-250)`. If those rules need
  changes, edit them in `globals.scss`, not a new colocated file.

## Props

```ts
interface StepIndicatorStep {
  /** Label shown for this step, e.g. "Set up", "Review", "Confirm". */
  title: string;
  /** True when this is the step currently being rendered by the parent page. */
  default: boolean;
}

interface StepIndicatorProps {
  headerText?: string;
  firstStep: StepIndicatorStep;
  secondStep: StepIndicatorStep;
  thirdStep: StepIndicatorStep;
}
```

Fixed at three steps (`firstStep`/`secondStep`/`thirdStep`), not an array —
that's what both the current call site's props shape and the existing CSS
(`.col-4`, i.e. exactly 3 columns of a 12-col row) assume. Don't generalize
to `steps: Step[]` here; that's a bigger change than "regenerate this file"
and would require revisiting the CSS too.

Real call site (`MakePayment.tsx`), for reference:

```tsx
<StepIndicator
  headerText={paymentData.headerText ? paymentData.headerText : ""}
  firstStep={{ title: "Set up", default: !!paymentData.paymentSetupDetails }}
  secondStep={{ title: "Review", default: !!paymentData.paymentReviewDetails }}
  thirdStep={{ title: "Confirm", default: !!paymentData.paymentConfirmDetails }}
/>
```

`paymentData.paymentSetupDetails` / `paymentReviewDetails` /
`paymentConfirmDetails` are mutually exclusive at any given render (the page
renders exactly one of `SetupTemplate` / `ReviewTemplate` / `ConfirmTemplate`
per `PaymentStep`, see `src/types/payment.ts`), so in practice **exactly one
of the three `default` flags is `true` per render** — there's no
"completed vs. pending vs. current" tri-state, just current vs. not-current.
Don't build completed-step logic; the data model behind it doesn't exist.

## Behavior

1. If `headerText` is a non-empty string, render it as an `<h1>` above the
   step row. If it's empty/falsy (the call site always passes a string, but
   sometimes `""`), render nothing for it — an empty `<h1>` is an a11y
   footgun for screen readers, don't emit an empty heading tag.
2. Render the three steps left-to-right in a 3-column row, in the fixed
   order `firstStep`, `secondStep`, `thirdStep`.
3. A step whose `default` is `true` renders in the active color (no extra
   class → falls to the CSS default `span` color, `var(--color-blue-700)`).
4. A step whose `default` is `false` gets an additional `pending-step`
   class on its `span`, which mutes it to `var(--color-neutral-600)`.
5. Don't manually render the `›` separators between steps — they're a CSS
   `:after` pseudo-element on `.step-indicator .col-4:not(:last-child) span`.
   As long as the DOM contract below is followed, separators between step
   1→2 and 2→3 appear automatically, and the last column correctly gets none.

## DOM contract (must match — CSS depends on it)

```tsx
<>
  {headerText && <h1>{headerText}</h1>}
  <div className="step-indicator row">
    <div className="col-4">
      <span className={firstStep.default ? "" : "pending-step"}>
        {firstStep.title}
      </span>
    </div>
    <div className="col-4">
      <span className={secondStep.default ? "" : "pending-step"}>
        {secondStep.title}
      </span>
    </div>
    <div className="col-4">
      <span className={thirdStep.default ? "" : "pending-step"}>
        {thirdStep.title}
      </span>
    </div>
  </div>
</>
```

Selectors this must satisfy (from `globals.scss`'s `.step-indicator` block):
- `.step-indicator` — row wrapper class, required, exact name.
- `.step-indicator .col-4:not(:last-child) span:after` — chevron separator;
  requires the three steps to be `.col-4` siblings in document order, last
  one actually last (don't reorder them after render, e.g. via flex-order).
- `span.pending-step` — muted-state class, exact name `pending-step`.
- `.payment-container h1 { text-align: center; }` — centers the header, but
  that rule lives on an *ancestor* (`MakePayment.tsx`'s own
  `payment-container` wrapper div), not on anything StepIndicator renders —
  the `<h1>` just needs to exist as a descendant, no class needed on it.

`row` / `col-4` are Bootstrap grid classes (Bootstrap CSS is imported
globally in `src/index.tsx`, don't re-import it) — this codebase uses them
as plain utility classes elsewhere too (e.g. `col-md-2`, `col-md-8` in
`MakePayment.tsx`). `col-4` with no responsive breakpoint prefix is
intentional here: the layout is always exactly 3 equal columns, never
responsive-collapsing.

## QA hooks

Codebase convention is `data-automation-id` (dominant over `data-testid` —
~244 vs ~29 usages across `src/`). Add:
- `data-automation-id="step-indicator-header"` on the `<h1>`.
- `data-automation-id="step-indicator"` on the `.step-indicator` row div.
- `data-automation-id="step-indicator-step-1"` / `-step-2` / `-step-3` on
  each `span` (positional, since the props aren't semantically named beyond
  ordinal — there's no `firstStep.id` to key off of).

## Accessibility (new — not present in current usage, worth adding since this is a full rewrite anyway)

- Add `aria-current="step"` on the active step's `span` (the one with
  `default === true`), so assistive tech gets the same "you are here"
  signal the color alone currently conveys. Additive only — must not
  replace the `pending-step` class logic above.
- Do not introduce `role="list"`/`role="listitem"` or other structural
  changes beyond this — anything larger changes the DOM contract the CSS
  depends on.

## Non-goals / out of scope

- No support for >3 or <3 steps.
- No "completed" (as distinct from "active") visual state — not something
  either call site's data model can express today.
- No click/keyboard navigation between steps — both call sites treat this
  as a read-only progress display, not a nav control.
- `PaymentError.tsx` imports `StepIndicator` but never actually renders it
  in the current file — likely dead/leftover from a prior version of that
  page. Not a reason to add anything special for it; this spec makes it
  render correctly if/when it's wired back in, since it's driven entirely
  by props with no external state.
