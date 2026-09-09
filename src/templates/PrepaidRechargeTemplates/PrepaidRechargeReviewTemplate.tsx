import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  ButtonStates,
  ButtonTypes,
  Modal,
  useAxios,
} from "@cox/core-ui8";
import { isPrototypeUrl } from "../../utils/helper-utlities";
import {
  getPrototypeStepUrl,
  buildStepRequest,
  buildBackRequest,
} from "../../services/paymentsService";
import { usePaymentStepSubmit } from "../../hooks/usePaymentStepSubmit";
import { PaymentData, PaymentDetailLine } from "../../types/payment";
import { formatDate } from "../../hooks/utils";
import PaymentMethodCard from "../../components/common/PaymentMethodCard";
import AccountDetailsSection from "../../components/common/AccountDetailsSection";
import PaymentInfoSection from "../../components/common/PaymentInfoSection";
import TermsCheckbox from "../../components/common/TermsCheckbox";
import SanitizedHtml from "../../components/common/SanitizedHtml";
import Throbber from "../../components/common/Throbber";
import AlertList from "../../components/common/AlertList";

interface PrepaidRechargeReviewTemplateProps {
  payment: PaymentData;
  onPostSubmitResponse: (data: PaymentData) => void;
  setPaymentData: (data: PaymentData) => void;
}

interface TextWithModalLinkProps {
  text: string;
  /** Phrase within `text` that opens the modal. */
  linkLabel: string;
  automationId: string;
  onLinkClick: () => void;
}

/**
 * Renders server-owned consent copy with the first occurrence of `linkLabel`
 * turned into the modal trigger, so the whole sentence stays with the payload.
 * Copy that does not contain the label renders as plain text.
 */
const TextWithModalLink = ({
  text,
  linkLabel,
  automationId,
  onLinkClick,
}: TextWithModalLinkProps) => {
  const linkStart = linkLabel ? text.indexOf(linkLabel) : -1;
  if (linkStart === -1) {
    return <>{text}</>;
  }
  return (
    <>
      {text.slice(0, linkStart)}
      <Link
        className="modal-link"
        data-automation-id={automationId}
        role="button"
        to="#"
        onClick={(e: any) => {
          e.preventDefault();
          onLinkClick();
        }}
      >
        {linkLabel}
      </Link>
      {text.slice(linkStart + linkLabel.length)}
    </>
  );
};

/**
 * Prepaid recharge review view. Composes the shared CardMop, PaymentInfoSection,
 * TermsCheckbox and SanitizedHtml components. Offers the optional EasyPay
 * enrollment and requires the prepaid payment terms before submitting.
 */
const PrepaidRechargeReviewTemplate = ({
  payment,
  onPostSubmitResponse,
  setPaymentData,
}: PrepaidRechargeReviewTemplateProps) => {
  const { paymentReviewDetails, termsAndConditions, alerts } = payment;
  const billingOptions = paymentReviewDetails?.billingOptions || {};
  // Payment method/date now travel per statement; prepaid recharge always has a single statement.
  const paymentDetailLine = paymentReviewDetails?.paymentDetails?.[0];

  const [isEasyPayChecked, setIsEasyPayChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalBody, setModalBody] = useState("");

  const { isSubmitting, errorMessages, setErrorMessages, submit } =
    usePaymentStepSubmit({
      flow: "prepaid-recharge",
      onSuccess: onPostSubmitResponse,
    });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      setPaymentData(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => {
      setErrorMessages(["Something went wrong. Please try again later."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const openModal = (header = "", body = "") => {
    setModalHeader(header);
    setModalBody(body);
    setShowModal(true);
  };

  const handleBackBtnClick = async () => {
    if (isPrototypeUrl()) {
      const backUrl = getPrototypeStepUrl("prepaid-recharge", "setup-mop");
      if (backUrl) window.location.href = backUrl;
      return;
    }
    try {
      await axiosAPIForBack(
        buildBackRequest({ pageName: "setup-mop", flowName: "prepaid-recharge" }),
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTermsChecked) {
      setTermsError("Please check this option to continue.");
      return;
    }
    submit(
      "confirm",
      buildStepRequest("prepaid-recharge", "confirm", {
        setUpEasyPay: isEasyPayChecked,
        termsAccepted: isTermsChecked,
      }),
    );
  };

  const termsLinkText =
    termsAndConditions?.otpModalHeader || "StraightUp Payment Terms of Service";
  const easyPayLinkText =
    billingOptions?.easyPayModalHeader || "EasyPay Terms of Service";
  const easyPayTermsText =
    billingOptions?.easyPayTermsText ||
    `By checking this box, I confirm that I have read and agree to the ${easyPayLinkText}.`;

  return (
    <div className="review-payments-container">
      <Modal
        title={modalHeader}
        description={modalBody}
        isParsed={false}
        show={showModal}
        handleClose={() => setShowModal(false)}
        primaryBtnText="Close"
        primaryBtnClick={() => setShowModal(false)}
        modalId={`${modalHeader}`}
      >
        <SanitizedHtml html={modalBody} />
      </Modal>

      <Throbber show={isSubmitting} />

      <AlertList
        alerts={alerts}
        messages={errorMessages}
        id="prepaid-recharge"
      />

      <AccountDetailsSection
        id="prepaid-review-account-details"
        accountNumber={paymentReviewDetails?.accountDetails?.accountNumber}
        serviceAddress={paymentReviewDetails?.accountDetails?.serviceAddress}
      />

      <PaymentInfoSection
        id="prepaid-review-payment-method"
        heading="Payment method"
      >
        <PaymentMethodCard
          automationId="review-card-number"
          detailLine={paymentDetailLine}
        />
      </PaymentInfoSection>

      <PaymentInfoSection id="prepaid-review-billing" heading="Billing">
        <p className="description">
          Payment date: {formatDate(paymentDetailLine?.paymentDate ?? "")}
        </p>
      </PaymentInfoSection>

      <PaymentInfoSection
        id="prepaid-review-payment-details"
        heading="Payment details"
      >
        <div className="statement-container">
          {paymentReviewDetails?.paymentDetails?.map(
            (detail: PaymentDetailLine) => (
              <div key={detail?.statementCode}>
                <p className="description">
                  Statement {detail?.statementCode}: {detail?.serviceName}
                </p>
                <p className="description">
                  Total: ${detail?.totalAmount}
                </p>
              </div>
            ),
          )}
        </div>
      </PaymentInfoSection>

      <form method="post" onSubmit={handleSubmit}>
        {billingOptions?.showEasyPayCheckbox && (
          <PaymentInfoSection
            id="prepaid-review-billing-options"
            heading="Billing options"
            label="(Optional)"
          >
            <TermsCheckbox
              id="easy-pay"
              ariaLabel="easy-pay-terms-of-service"
              checked={isEasyPayChecked}
              onChange={(e) => setIsEasyPayChecked(e.target.checked)}
            >
              <SanitizedHtml
                className="easy-pay-opt-in-text"
                html={billingOptions?.easyPayEnrollText}
              />
              <p>
                <TextWithModalLink
                  text={easyPayTermsText}
                  linkLabel={easyPayLinkText}
                  automationId="easy-pay-terms-of-service-link"
                  onLinkClick={() =>
                    openModal(
                      billingOptions?.easyPayModalHeader,
                      billingOptions?.easyPayModalBody,
                    )
                  }
                />
              </p>
            </TermsCheckbox>
          </PaymentInfoSection>
        )}

        <PaymentInfoSection
          id="prepaid-review-terms"
          heading="Terms and conditions"
          label="(Required)"
        >
          <TermsCheckbox
            id="prepaid-terms-and-service"
            ariaLabel="prepaid-payment-terms-of-service"
            checked={isTermsChecked}
            error={termsError}
            onChange={(e) => {
              setIsTermsChecked(e.target.checked);
              if (e.target.checked) setTermsError("");
            }}
          >
            I have read and agree to the{" "}
            <Link
              className="modal-link"
              data-automation-id="prepaid-payment-terms-and-service-link"
              role="button"
              to="#"
              onClick={(e: any) => {
                e.preventDefault();
                openModal(
                  termsAndConditions?.otpModalHeader,
                  termsAndConditions?.otpModalBody,
                );
              }}
            >
              {termsLinkText}
            </Link>
            .
          </TermsCheckbox>
        </PaymentInfoSection>

        <div id="prepaid-review-buttons" className="button-group pt-4">
          <Button
            buttonStates={ButtonStates.ACTIVE}
            buttonTypes={ButtonTypes.SECONDARY}
            customClickEvent={handleBackBtnClick}
            data-automation-id="review-back-btn"
            openInNewTab={false}
            text="Back"
          />
          <Button
            buttonStates={ButtonStates.ACTIVE}
            buttonTypes={ButtonTypes.PRIMARY}
            data-automation-id="review-submit-btn"
            isFormSubmit={true}
            openInNewTab={false}
            text="Submit"
          />
        </div>
      </form>
    </div>
  );
};

export default PrepaidRechargeReviewTemplate;
