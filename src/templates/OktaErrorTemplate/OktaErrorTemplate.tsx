import PageHeader from "../../components/PageHeader";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import InfoAlert from "../../components/Alerts/InfoAlert";

interface OktaErrorProps {
  payment: any;
  customerType?: any;
  showHeader?: boolean;
}

const OktaErrorTemplate = ({
  payment,
  customerType,
  showHeader = true,
}: OktaErrorProps) => {
  const getLabelForBackNavigation = payment?.navigateTo?.includes("ibill")
    ? "Billing home"
    : "Account overview";

  return (
    <>
      {showHeader && (
        <div
          id="payment-error"
          className={`text-start ${customerType === "business" ? "page-layout-cb" : ""}`}
        >
          {customerType !== "business" && (
            <div className="navigation-back  d-flex justify-content-between">
              <a href={payment?.navigateTo} className="link__anchor">
                <img
                  src={chevronLeft}
                  className="link__icon"
                  alt="chevronLeft"
                />
                {getLabelForBackNavigation}
              </a>
            </div>
          )}
          {customerType !== "business" && (
            <PageHeader
              id="payment-error"
              primaryHeader={payment?.headerText}
            />
          )}
        </div>
      )}
      <div className="alerts-wrapper">
        {payment?.errorMessages?.map((message: any) =>
          payment?.bannerType === "info" ? (
            <InfoAlert message={message} id="payment-error" key={message} />
          ) : (
            <ErrorAlert message={message} id="payment-error" key={message} />
          )
        )}
      </div>
    </>
  );
};

export default OktaErrorTemplate;
