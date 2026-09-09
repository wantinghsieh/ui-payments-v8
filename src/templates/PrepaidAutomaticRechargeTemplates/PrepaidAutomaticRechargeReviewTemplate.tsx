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
import PaymentMethodCard from "../../components/common/PaymentMethodCard";
import AccountDetailsSection from "../../components/common/AccountDetailsSection";
import PaymentInfoSection from "../../components/common/PaymentInfoSection";
import TermsCheckbox from "../../components/common/TermsCheckbox";
import SanitizedHtml from "../../components/common/SanitizedHtml";
import Throbber from "../../components/common/Throbber";
import AlertList from "../../components/common/AlertList";

interface PrepaidAutomaticRechargeReviewTemplateProps {
  payment: PaymentData;
  onPostSubmitResponse: (data: PaymentData) => void;
  setPaymentData: (data: PaymentData) => void;
}

/**
 * Prepaid automatic recharge review view. This step enrolls the account in
 * EasyPay, so the consent checkbox below is the required EasyPay terms —
 * unlike PrepaidRechargeReviewTemplate's optional EasyPay opt-in, which
 * upsells enrollment during an unrelated one-time payment.
 */
const PrepaidAutomaticRechargeReviewTemplate = ({
  payment,
  onPostSubmitResponse,
  setPaymentData,
}: PrepaidAutomaticRechargeReviewTemplateProps) => {
  const { easyPayReviewDetails, alerts, subTitle } = payment;
  // Payment method/date travel per statement; prepaid always has a single statement.
  const paymentDetailLine = easyPayReviewDetails?.paymentDetails?.[0];

  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalBody, setModalBody] = useState("");

  const { isSubmitting, errorMessages, setErrorMessages, submit } =
    usePaymentStepSubmit({
      flow: "prepaid-automatic-recharge",
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
      const backUrl = getPrototypeStepUrl(
        "prepaid-automatic-recharge",
        "setup-mop",
      );
      if (backUrl) window.location.href = backUrl;
      return;
    }
    try {
      await axiosAPIForBack(
        buildBackRequest({
          pageName: "setup-mop",
          flowName: "prepaid-automatic-recharge",
        }),
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
      buildStepRequest("prepaid-automatic-recharge", "confirm", {
        isEasyPayChecked: isTermsChecked,
      }),
    );
  };

  const termsLinkText = easyPayReviewDetails?.easyPayTerms?.headerText || "EasyPay Terms of Service";

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

      {subTitle && (
        <p
          className="description"
          data-automation-id="prepaid-automatic-recharge-review-description"
        >
          {subTitle}
        </p>
      )}

      <AlertList
        alerts={alerts}
        messages={errorMessages}
        id="prepaid-automatic-recharge"
      />

      <AccountDetailsSection
        id="prepaid-automatic-recharge-review-account-details"
        accountNumber={easyPayReviewDetails?.accountDetails?.accountNumber}
        serviceAddress={easyPayReviewDetails?.accountDetails?.serviceAddress}
      />

      <PaymentInfoSection
        id="prepaid-automatic-recharge-review-payment-method"
        heading="Payment method"
      >
        <PaymentMethodCard
          automationId="review-card-number"
          detailLine={paymentDetailLine}
        />
      </PaymentInfoSection>

      <PaymentInfoSection
        id="prepaid-automatic-recharge-review-payment-details"
        heading="Payment details"
      >
        <div className="statement-container">
          {easyPayReviewDetails?.paymentDetails?.map(
            (detail: PaymentDetailLine) => (
              <div key={detail?.statementCode}>
                <p className="description">
                  Statement {detail?.statementCode}: {detail?.serviceName}
                </p>
              </div>
            ),
          )}
        </div>
      </PaymentInfoSection>

      <form method="post" onSubmit={handleSubmit}>
        <PaymentInfoSection
          id="prepaid-automatic-recharge-review-terms"
          heading="Terms and conditions"
          label="(Required)"
        >
          <TermsCheckbox
            id="easy-pay-terms-and-service"
            ariaLabel="easy-pay-terms-of-service"
            checked={isTermsChecked}
            error={termsError}
            onChange={(e) => {
              setIsTermsChecked(e.target.checked);
              if (e.target.checked) setTermsError("");
            }}
          >
            By checking this box, I confirm that I have read and agree to the{" "}
            <Link
              className="modal-link"
              data-automation-id="easy-pay-terms-and-service-link"
              role="button"
              to="#"
              onClick={(e: any) => {
                e.preventDefault();
                openModal(
                  easyPayReviewDetails?.easyPayTerms?.headerText,
                  easyPayReviewDetails?.easyPayTerms?.termsAndConditionsText,
                );
              }}
            >
              {termsLinkText}
            </Link>
            .
          </TermsCheckbox>
        </PaymentInfoSection>

        <div
          id="prepaid-automatic-recharge-review-buttons"
          className="button-group pt-4"
        >
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
            text="Enroll"
          />
        </div>
      </form>
    </div>
  );
};

export default PrepaidAutomaticRechargeReviewTemplate;
