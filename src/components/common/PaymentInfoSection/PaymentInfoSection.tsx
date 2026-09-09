import { ReactNode } from "react";

interface PaymentInfoSectionProps {
  /** Section heading text, e.g. "Account details", "Billing", "Payment details". */
  heading: string;
  /** Optional muted suffix next to the heading, e.g. "(Optional)" or "(Required)". */
  label?: string;
  id?: string;
  /** Wrapper class. Defaults to the review/confirm "sub-container" look. */
  className?: string;
  /** Heading tag to render. Defaults to h3. */
  headingTag?: "h2" | "h3" | "h4";
  /** Heading class. Defaults to the review/confirm "sub-header" look. */
  headingClassName?: string;
  headingAutomationId?: string;
  children?: ReactNode;
}

/**
 * A labeled content section shared by the payment flows (Account details, Payment
 * method, Billing, Payment details, Billing options, Terms & conditions, ...).
 * Heading tag/class and wrapper class are configurable so the same component fits
 * both the setup-view ("content"/h4) and the review/confirm ("sub-container"/h3)
 * layouts without duplicating markup.
 */
const PaymentInfoSection = ({
  heading,
  label,
  id,
  className = "sub-container",
  headingTag: HeadingTag = "h3",
  headingClassName = "sub-header",
  headingAutomationId,
  children,
}: PaymentInfoSectionProps) => {
  return (
    <div id={id} className={className}>
      <HeadingTag className={headingClassName} data-automation-id={headingAutomationId}>
        {heading}
        {label && <span className="sub-header-label">{label}</span>}
      </HeadingTag>
      {children}
    </div>
  );
};

export default PaymentInfoSection;
