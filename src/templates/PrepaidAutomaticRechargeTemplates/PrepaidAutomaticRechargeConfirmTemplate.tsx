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
import PaymentMethodCard from "../../components/common/PaymentMethodCard";
import AccountDetailsSection from "../../components/common/AccountDetailsSection";
import PaymentInfoSection from "../../components/common/PaymentInfoSection";
import AlertList from "../../components/common/AlertList";

interface PrepaidAutomaticRechargeConfirmTemplateProps {
  payment: PaymentData;
}

// A statement's outcome is served either as "success"/"failed" or as
// "Succeeded"/"Failed", so match on the stem rather than the exact string.
const isSucceeded = (status?: string) =>
  status?.toLowerCase().startsWith("succe") ?? false;

/**
 * Prepaid automatic recharge confirmation view (EasyPay enrollment success
 * and failure). Reuses the shared CardMop, PaymentInfoSection and alert/banner
 * components — same shape as PrepaidRechargeConfirmTemplate.
 */
const PrepaidAutomaticRechargeConfirmTemplate = ({
  payment,
}: PrepaidAutomaticRechargeConfirmTemplateProps) => {
  const { paymentConfirmDetails } = payment;
  const description = paymentConfirmDetails?.paymentDetailsInfo?.description;
  const alerts = paymentConfirmDetails?.alerts ?? [];
  const isSuccess = isSucceeded(paymentConfirmDetails?.paymentStatus);
  // Payment method/date travel per statement; prepaid always has a single statement.
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
      const setupUrl = getPrototypeStepUrl(
        "prepaid-automatic-recharge",
        "setup-mop",
      );
      if (setupUrl) window.location.href = setupUrl;
    } else {
      window.location.reload();
    }
  };

  return (
    <div id="prepaid-automatic-recharge-confirm">
      {description && (
        <p
          className="review-heading-text text-left pt-1"
          data-automation-id="confirm-header-description-txt"
        >
          {description}
        </p>
      )}

      {alerts.length > 0 && (
        <div className="content mb-4">
          <AlertList alerts={alerts} id="prepaid-automatic-recharge" />
        </div>
      )}

      <AccountDetailsSection
        id="prepaid-automatic-recharge-confirm-account-details"
        className="payment-details-container mb-4 pb-2 mt-4"
        headingTag="h4"
        headingClassName="payment-header"
        variant="confirm"
        accountNumber={paymentConfirmDetails?.accountDetails?.accountNumber}
        serviceAddress={paymentConfirmDetails?.accountDetails?.serviceAddress}
      />

      <PaymentInfoSection
        id="prepaid-automatic-recharge-confirm-payment-method"
        className="payment-card-container mb-4 pb-2"
        heading="Payment method"
        headingTag="h4"
        headingClassName="payment-header"
      >
        <PaymentMethodCard
          automationId="confirm-card-number"
          detailLine={paymentDetailLine}
        />
      </PaymentInfoSection>

      {isSuccess && (
        <PaymentInfoSection
          id="prepaid-automatic-recharge-confirm-payment-details"
          className="payment-details-container mb-4 pb-3"
          heading="Payment details"
          headingTag="h4"
          headingClassName="payment-header"
        >
          {paymentConfirmDetails?.paymentDetails?.map(
            (detail: PaymentDetailLine) => (
              <div className="payment-detail mt-3" key={detail?.statementCode}>
                <div>
                  Statement {detail?.statementCode}: {detail?.serviceName}
                </div>
              </div>
            ),
          )}
        </PaymentInfoSection>
      )}

      <div className="payment-done button-group print-trigger">
        {!isSuccess && (
          <Button
            openInNewTab={false}
            alignment={AlignmentProps.CENTER}
            text="Cancel"
            size=""
            buttonStates={ButtonStates.ACTIVE}
            buttonTypes={ButtonTypes.SECONDARY}
            customClickEvent={() => (window.location.href = MY_BILL_HOME_PAGE)}
            data-automation-id="prepaid-automatic-recharge-confirm-cancel-button"
          />
        )}
        <Button
          openInNewTab={false}
          alignment={AlignmentProps.CENTER}
          text={isSuccess ? "Done" : "Try again"}
          size=""
          buttonStates={ButtonStates.ACTIVE}
          buttonTypes={ButtonTypes.PRIMARY}
          customClickEvent={handlePrimaryClick}
          data-automation-id="prepaid-automatic-recharge-confirm-primary-button"
        />
      </div>
    </div>
  );
};

export default PrepaidAutomaticRechargeConfirmTemplate;
