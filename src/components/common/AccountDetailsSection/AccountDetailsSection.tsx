import PaymentInfoSection from "../PaymentInfoSection";

interface AccountDetailsSectionProps {
  id?: string;
  accountNumber?: string;
  serviceAddress?: string;
  /** Matches each step's existing markup/spacing: review's stacked `<p>` lines
   *  vs confirm's single wrapping `<div>` — kept separate rather than forced
   *  into one shape, since collapsing them would change spacing on one side. */
  variant?: "review" | "confirm";
  className?: string;
  headingTag?: "h2" | "h3" | "h4";
  headingClassName?: string;
}

/** "Account details" section (account number + service address) shared by
 *  any flow's review/confirm views. */
const AccountDetailsSection = ({
  id,
  accountNumber,
  serviceAddress,
  variant = "review",
  className,
  headingTag,
  headingClassName,
}: AccountDetailsSectionProps) => (
  <PaymentInfoSection
    id={id}
    className={className}
    heading="Account details"
    headingTag={headingTag}
    headingClassName={headingClassName}
  >
    {variant === "confirm" ? (
      <div className="description">
        <div>
          <span>Account number:</span> {accountNumber}
        </div>
        <div>
          <span>Service Address:</span> {serviceAddress}
        </div>
      </div>
    ) : (
      <>
        <p className="description">
          <span>Account number:</span> {accountNumber}
        </p>
        <p className="description">
          <span>Service Address:</span> {serviceAddress}
        </p>
      </>
    )}
  </PaymentInfoSection>
);

export default AccountDetailsSection;
