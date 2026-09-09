import { ReactNode } from "react";
import { FormMessage, MessageStatus } from "@cox/core-ui8";

interface TermsCheckboxProps {
  id: string;
  name?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
  automationId?: string;
  /** Inline error text; when set, the control renders in its error state. */
  error?: string;
  /** Label content — plain text and/or a modal link/rich markup. */
  children: ReactNode;
}

/**
 * Custom styled checkbox with a rich label, shared by any flow that needs a
 * consent/terms control (One-Time Payment / EasyPay / Autopay / prepaid terms).
 * Keeps the checkbox scaffolding and error presentation in one place; callers
 * supply the label content (including any modal link) via children.
 *
 * NOTE: this stays raw input/label markup instead of core-ui8's FormCheckbox
 * because FormCheckbox's option label is a plain string (FormItemProps) with
 * no children/ReactNode slot and no way to bind a click handler to part of
 * the label. Callers here render an inline Link that opens a Terms modal on
 * click — only that phrase is clickable, not the whole label — plus, in some
 * flows, server-supplied HTML and inline bold text. None of that is
 * expressible as a string, so FormCheckbox can't render it.
 */
const TermsCheckbox = ({
  id,
  name,
  checked,
  onChange,
  ariaLabel,
  automationId = "review-terms-service-checkbox",
  error,
  children,
}: TermsCheckboxProps) => {
  return (
    <>
      <label
        className={`${error ? "custom-checkbox-error" : ""} custom-checkbox`}
        htmlFor={id}
      >
        <input
          type="checkbox"
          id={id}
          name={name || id}
          aria-label={ariaLabel}
          aria-required="true"
          checked={checked}
          onChange={onChange}
          data-automation-id={automationId}
        />
        <span className="checkmark"></span>
        <span className="checkbox-label"></span>
        <label className="terms-checkbox-label" htmlFor={id}>
          {children}
        </label>
      </label>
      {error && (
        <FormMessage
          id={`${id}-error`}
          status={MessageStatus.ERROR}
          message={error}
        />
      )}
    </>
  );
};

export default TermsCheckbox;
