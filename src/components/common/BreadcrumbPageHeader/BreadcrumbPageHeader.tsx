import chevronLeft from "../../../assets/icons/chevron-left.svg";
import PageHeader from "../../PageHeader";

interface BreadcrumbPageHeaderProps {
  /** Also used as the PageHeader id, so heading classnames/automation-ids stay per-page. */
  id: string;
  backLinkLabel: string;
  backLinkTestId: string;
  navigateTo?: string;
  primaryHeader?: string;
  secondaryHeader?: string;
  showPrint?: boolean;
  onPrintClick?: () => void;
}

/**
 * Back-link breadcrumb + PageHeader, used at the top of a payment flow page.
 * The print link is opt-in — only pages with a printable confirmation pass it.
 */
const BreadcrumbPageHeader = ({
  id,
  backLinkLabel,
  backLinkTestId,
  navigateTo,
  primaryHeader,
  secondaryHeader,
  showPrint,
  onPrintClick,
}: BreadcrumbPageHeaderProps) => (
  <>
    <div className="navigation-back d-flex justify-content-between">
      <a href={navigateTo} data-testid={backLinkTestId}>
        <span>
          <img src={chevronLeft} alt="chevronLeft" />
        </span>
        {backLinkLabel}
      </a>
      {showPrint && (
        <span>
          <a
            href="#"
            title="Print"
            className="print-trigger no-print desktop-only"
            aria-label="Print confirmation"
            onClick={onPrintClick}
            data-automation-id="confirm-print-confirmation-link"
          >
            Print
          </a>
        </span>
      )}
    </div>

    <PageHeader id={id} primaryHeader={primaryHeader ?? ""} secondaryHeader={secondaryHeader} />
  </>
);

export default BreadcrumbPageHeader;
