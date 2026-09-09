import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
} from "@cox/core-ui8";
import { useEffect } from "react";
import { MY_BILL_HOME_PAGE } from "../../hooks/constants";
import { isPrototypeUrl } from "../../utils/helper-utlities";
import { getPrototypeStepUrl } from "../../services/paymentsService";
import { PaymentData, PaymentDetailLine } from "../../types/payment";
import { formatDate } from "../../hooks/utils";
import PaymentMethodCard from "../../components/common/PaymentMethodCard";
import AccountDetailsSection from "../../components/common/AccountDetailsSection";
import PaymentInfoSection from "../../components/common/PaymentInfoSection";
import AlertList from "../../components/common/AlertList";

interface PrepaidRechargeConfirmTemplateProps {
  payment: PaymentData;
}

// A statement's outcome is served either as "success"/"failed" or as
// "Succeeded"/"Failed", so match on the stem rather than the exact string.
const isSucceeded = (status?: string) =>
  status?.toLowerCase().startsWith("succe") ?? false;
const isFailed = (status?: string) =>
  status?.toLowerCase().startsWith("fail") ?? false;

/**
 * Prepaid recharge confirmation view (success and failure). Reuses the shared
 * CardMop, PaymentInfoSection and alert/banner components.
 */
const PrepaidRechargeConfirmTemplate = ({
  payment,
}: PrepaidRechargeConfirmTemplateProps) => {
  const { paymentConfirmDetails } = payment;
  const alerts = paymentConfirmDetails?.alerts ?? [];
  const isSuccess = isSucceeded(paymentConfirmDetails?.paymentStatus);
  // Payment method/amount/date travel per statement; prepaid recharge always has a single statement.
  const paymentDetailLine = paymentConfirmDetails?.paymentDetails?.[0];

  useEffect(() => {
    if (alerts.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [alerts.length]);

  const handlePrimaryClick = () => {
    if (isSuccess) {
      window.location.href = MY_BILL_HOME_PAGE;
      return;
    }
    // Failure → try again.
    if (isPrototypeUrl()) {
      const setupUrl = getPrototypeStepUrl("prepaid-recharge", "setup-mop");
      if (setupUrl) window.location.href = setupUrl;
    } else {
      window.location.reload();
    }
  };

  return (
    <div id="prepaid-recharge-confirm">
      <div className="content mb-4">
        <AlertList alerts={alerts} id="prepaid-recharge" />
      </div>

      <AccountDetailsSection
        id="prepaid-confirm-account-details"
        className="payment-details-container mb-4"
        headingTag="h4"
        headingClassName="payment-header"
        variant="confirm"
        accountNumber={paymentConfirmDetails?.accountDetails?.accountNumber}
        serviceAddress={paymentConfirmDetails?.accountDetails?.serviceAddress}
      />

      <PaymentInfoSection
        id="prepaid-confirm-payment-method"
        className="payment-card-container mb-4"
        heading="Payment method"
        headingTag="h4"
        headingClassName="payment-header"
      >
        <PaymentMethodCard
          automationId="confirm-card-number"
          detailLine={paymentDetailLine}
        />
      </PaymentInfoSection>

      <PaymentInfoSection
        id="prepaid-confirm-billing"
        className="payment-billing-container mb-4"
        heading="Billing"
        headingTag="h4"
        headingClassName="payment-header"
      >
        <div className="description">
          <div>
            {isSuccess ? "Payment amount:" : "Attempted payment amount:"}{" "}
            <strong>${paymentDetailLine?.totalAmount}</strong>
          </div>
          <div>
            {isSuccess ? "Payment date:" : "Attempted payment date:"}{" "}
            {formatDate(paymentDetailLine?.paymentDate ?? "")}
          </div>
        </div>
      </PaymentInfoSection>

      <PaymentInfoSection
        id="prepaid-confirm-payment-details"
        className="payment-details-container mb-4"
        heading="Payment details"
        headingTag="h4"
        headingClassName="payment-header"
      >
        {paymentConfirmDetails?.paymentDetails?.map(
          (detail: PaymentDetailLine) => (
            <div className="payment-detail mb-3" key={detail?.statementCode}>
              <div>
                Statement {detail?.statementCode}: {detail?.serviceName}
              </div>
              <div>
                Total: ${detail?.totalAmount}
                {isSucceeded(detail?.status) && (
                  <span>
                    {" "}
                    -{" "}
                    <span className="success-text font-weight-700">
                      Succeeded
                    </span>
                  </span>
                )}
                {isFailed(detail?.status) && (
                  <span>
                    {" "}
                    -{" "}
                    <span className="error-text font-weight-700">Failed</span>
                  </span>
                )}
              </div>
              {isSucceeded(detail?.status) && detail?.confirmation && (
                <div>Confirmation: {detail.confirmation}</div>
              )}
            </div>
          ),
        )}
      </PaymentInfoSection>

      <div className="payment-done button-group print-trigger">
        <Button
          openInNewTab={false}
          alignment={AlignmentProps.CENTER}
          text={isSuccess ? "Done" : "Try again"}
          size=""
          buttonStates={ButtonStates.ACTIVE}
          buttonTypes={ButtonTypes.PRIMARY}
          customClickEvent={handlePrimaryClick}
          data-automation-id="prepaid-confirm-primary-button"
        />
        {!isSuccess && (
          <Button
            openInNewTab={false}
            alignment={AlignmentProps.CENTER}
            text="Account overview"
            size=""
            buttonStates={ButtonStates.ACTIVE}
            buttonTypes={ButtonTypes.SECONDARY}
            customClickEvent={() => (window.location.href = MY_BILL_HOME_PAGE)}
            data-automation-id="prepaid-confirm-secondary-button"
          />
        )}
      </div>
    </div>
  );
};

export default PrepaidRechargeConfirmTemplate;
