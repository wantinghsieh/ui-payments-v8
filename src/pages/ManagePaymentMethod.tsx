import { useContext, useEffect } from "react";
import chevronLeft from "../assets/icons/chevron-left.svg";
import PageHeader from "../components/PageHeader";
import { setUDOVariables } from "../hooks/utils";
import PaymentContext from "../context/PaymentContext";
import NoPaymentMethodSaved from "../templates/ManagePaymentMethodTemplates/NoPaymentMethodSaved";
import ManagePaymentSavedMopTemplate from "../templates/ManagePaymentMethodTemplates/ManagePaymentSavedMopTemplate";
import OktaErrorTemplate from "../templates/OktaErrorTemplate";

/**
 * ManagePaymentMethod page
 *
 * Entry point for the Manage Payment Methods flow. Receives server-rendered
 * data via `sections.payment` and stores it in PaymentContext so child
 * templates can access and update it.
 *
 * Renders one of three views based on `paymentData.pageName`:
 *  - "manage-payment-method": saved MOPs list (or empty state if none exist)
 *  - "error": Okta error template
 */
function ManagePaymentMethod({ sections }: any) {
  const { payment = {} } = sections;

  const { paymentData, setPaymentData } = useContext<any>(PaymentContext);

  // Seed PaymentContext with the server-provided payment object on mount
  useEffect(() => {
    setPaymentData(payment);
  }, [payment]);

  // Push UDO analytics variables whenever paymentData is updated
  useEffect(() => {
    if (paymentData?.udoVars) {
      setTimeout(function () {
        setUDOVariables(paymentData?.udoVars);
      }, 0);
    }
  }, [paymentData]);

  return (
    <div className="page-container text-start">
      {/* Back navigation link — destination driven by server-provided navigateTo */}
      <div className="navigation-back d-flex justify-content-between">
        <a
          href={paymentData?.navigateTo}
          data-testid="manage-payment-method-navigation-back-link"
        >
          <span>
            <img src={chevronLeft} alt="chevronLeft" />
          </span>
          Billing home
        </a>
      </div>

      {/* Page title rendered from server-provided headerText */}
      <PageHeader
        id="manage-payment-method"
        primaryHeader={paymentData?.headerText}
      />

      {/* Main content: show saved MOPs or the empty state */}
      {paymentData?.pageName === "manage-payment-method" && (
        <>
          {!paymentData?.savedMop?.length ? (
            // No saved payment methods on the account
            <div className="payment-container">
              <NoPaymentMethodSaved />
            </div>
          ) : (
            // Saved MOPs exist — render the list with Edit / Remove / Make Default actions
            <ManagePaymentSavedMopTemplate
              payment={paymentData}
              customerType={paymentData?.customerType}
              setPaymentData={setPaymentData}
            />
          )}
        </>
      )}

      {/* Server returned an error page — render the generic Okta error template */}
      {paymentData?.pageName === "error" && (
        <OktaErrorTemplate payment={paymentData} showHeader={false} />
      )}
    </div>
  );
}

export default ManagePaymentMethod;
