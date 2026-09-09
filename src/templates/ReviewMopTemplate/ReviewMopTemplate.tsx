import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import {
  ONE_TIME_PAYMENT_SETUP_MOP_PAGE_PROTOTYPE,
  ONE_TIME_PAYMENT_CONFIRM_MOP_PAGE_PROTOTYPE,
  OKTA_FLOW_PAYMENT_BACK_URL,
  ONE_TIME_PAYMENT_CONFIRM_POST_URL,
  ONE_TIME_PAYMENT_CB_CONFIRM_MOP_PAGE_PROTOTYPE,
  OKTA_FLOW_CB_PAYMENT_BACK_URL,
  ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE,
  ONE_TIME_PAYMENT_CB_CONFIRM_POST_URL,
  MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE,
  MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_CONFIRM_MOP_PAGE_PROTOTYPE,
  MULTI_ACCOUNT_CB_CONFIRM_POST_URL,
} from "../../hooks/constants";
import { formatDate } from "../../hooks/utils";
// components
import { Link } from "react-router-dom";
import {
  Button,
  ButtonStates,
  ButtonTypes,
  FormMessage,
  MessageStatus,
  Modal,
  useAxios,
} from "@cox/core-ui8";
import CardMop from "../../components/CardMop/CardMop";
import WarningAlert from "../../components/Alerts/WarningAlert";
import WarningAlertWithViewMore from "../../components/Alerts/WarningAlertWithViewMore";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import { getVisbileStatements } from "../../utils/helper-utlities";

interface RequestParams {
  [key: string]: string | undefined | boolean;
}

const ReviewMopTemplate = ({
  payment,
  setPaymentData,
  onPostSubmitResponse,
  customerType,
}: any) => {
  const {
    paymentReviewDetails = {}
  } = payment;
  const [isEasyPayChecked, setIsEasyPayChecked] = useState<boolean>(false);
  const [isPaperlessChecked, setIsPaperlessChecked] = useState<boolean>(false);
  const [isOTPChecked, setIsOTPChecked] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalHeader, setModalHeader] = useState<string>("");
  const [modalBody, setModalBody] = useState<string>("");
  const [showError, setShowError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [showApiError, setShowApiError] = useState(false);
  const totalStatements = paymentReviewDetails?.cbPaymentDetails?.reduce((sum: any, block: { statementDetails: string | any[]; }) => sum + (block.statementDetails?.length || 0), 0)
  const visibleStatements = customerType === "business" ? getVisbileStatements(paymentReviewDetails?.cbPaymentDetails, viewAll) : [];

  const { axiosAPI: axiosAPIForConfirm } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForReview(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
      if (customerType === "business") { setShowApiError(true); }
    },
  });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForBack(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  useEffect(() => {
    const hasAlerts =
      errorMessages?.length > 0 ||
      showApiError ||
      paymentReviewDetails?.cardExpiredWarning;

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [
    errorMessages?.length,
    showApiError,
    paymentReviewDetails?.cardExpiredWarning
  ]);

  const handleEasyPayChecked = (e: any) => {
    setIsEasyPayChecked(e.target.checked);
  };

  const handlePaperlessChecked = (e: any) => {
    setIsPaperlessChecked(e.target.checked);
  };

  const handleOTPChecked = (e: any) => {
    setIsOTPChecked(e.target.checked);
    if (e.target.checked) {
      setShowError("");
    }
  };

  const handleOpenModal = (header: string, body: string) => {
    setModalHeader(header);
    setModalBody(body);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleBackBtnClick = async () => {
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = customerType === "business" ? payment?.multiAccount ? MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE : ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE : ONE_TIME_PAYMENT_SETUP_MOP_PAGE_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};
      requestParams.pageName = "setup-mop";
      requestParams.flowName = "one-time-payments";
      if (payment?.multiAccount) {
        requestParams.multiAccount = true;
      }

      try {
        const host = window.location.origin;
        await axiosAPIForBack({
          url: `${host}${customerType === "business" ? OKTA_FLOW_CB_PAYMENT_BACK_URL : OKTA_FLOW_PAYMENT_BACK_URL}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(requestParams),
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const onAjaxResponseForBack = (data: any) => {
    setPaymentData(data);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setShowApiError(false);

    if (!isOTPChecked) {
      setShowError("Please check this option to continue.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = customerType === "business" ? payment?.multiAccount ? MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_CONFIRM_MOP_PAGE_PROTOTYPE : ONE_TIME_PAYMENT_CB_CONFIRM_MOP_PAGE_PROTOTYPE : ONE_TIME_PAYMENT_CONFIRM_MOP_PAGE_PROTOTYPE;
      return;
    } else {
      const requestParams: RequestParams = {};
      
      if (payment?.multiAccount) {
        requestParams.isOTPChecked = isOTPChecked;
      } else {
        requestParams.isEasyPayChecked = isEasyPayChecked;
        requestParams.isPaperlessChecked = isPaperlessChecked;
        requestParams.isOTPChecked = isOTPChecked;
      }

      try {
        const host = window.location.origin;
        const confirmUrl = customerType === "business" ? payment?.multiAccount ?
          MULTI_ACCOUNT_CB_CONFIRM_POST_URL : ONE_TIME_PAYMENT_CB_CONFIRM_POST_URL :
          ONE_TIME_PAYMENT_CONFIRM_POST_URL;
        await axiosAPIForConfirm({
          url: `${host}${confirmUrl}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(requestParams),
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const onAjaxResponseForReview = (data: any) => {
    if (data?.pageName !== "error" && data?.errorMessages?.length > 0) {
      setErrorMessages(data.errorMessages);
    } else {
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="review-payments-container">
      {/* MODAL */}
      <Modal
        title={modalHeader}
        description={modalBody}
        isParsed={false}
        show={showModal}
        handleClose={handleCloseModal}
        primaryBtnText="Close"
        primaryBtnClick={() => setShowModal(false)}
        modalId={`${modalHeader}`}
      >
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(modalBody),
          }}
        ></p>
      </Modal>

      {isSubmitting &&
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner
            size={'xl'}
          />
        </div>
      }

      {/* DISPLAYING THE SUB-HEADER */}
      {customerType === "business" && (
        <div className="sub-header-text">
          {payment?.cbSubHeaderDescription}
        </div>)}

      {/* ERROR ALERTS - OKTA FLOW */}
      {(customerType === "business" && showApiError) && (
        <div className={`warning-container ${(customerType === "business") ? "business-container" : ""}`}>
          <ErrorAlert
            message='Something went wrong. Please try again later.'
            id={"error-alert"}
          />
        </div>
      )}

      {/* ALERTS */}
      {payment?.messages?.warningMessages?.length > 0 &&
        payment.messages.warningMessages.map((msg: string) => (
          <WarningAlertWithViewMore
            key={msg}
            id="partial-or-over-payment-alert"
            message={msg}
          />
        ))}

      {paymentReviewDetails?.cardExpiredWarning && (
        <ErrorAlert
          message={paymentReviewDetails?.cardExpiredWarning}
          id={"card-expired-warning"}
        />
      )}

      {errorMessages?.length > 0 && (
        <>
          {errorMessages.map((message: any, index: number) => (
            <div key={index}>
              <ErrorAlert
                message={message}
                id="one-time-payment"
              />
            </div>
          ))}
        </>
      )}

      {paymentReviewDetails?.achOfferAlertPendingStatus && (
        <WarningAlert message={paymentReviewDetails?.achOfferAlertPending} id={"ach-offer-alert"} />
      )}

      {/* ACCOUNT DETAILS CONTAINER */}
      {customerType !== "business" && (
        <div id="okta-otp-review-account-details-container" className="sub-container">
          <h3 className="sub-header">Account details</h3>
          <p className="description">
            <span>Account number:</span>{" "}
            {paymentReviewDetails?.accountDetails?.accountNumber}
          </p>
          <p className="description">
            <span>Service address:</span>{" "}
            {paymentReviewDetails?.accountDetails?.serviceAddress}
          </p>
        </div>
      )}

      {/* PAYMENT METHOD CONTAINER */}
      <div
        id="okta-otp-review-payment-method-container"
        className="sub-container"
      >
        <h3 className="sub-header">Payment method</h3>
        <CardMop
          automationId={
            paymentReviewDetails.paymentMethod.type === "bank"
              ? "review-bank-account-number"
              : "review-card-number"
          }
          type={paymentReviewDetails?.paymentMethod?.type}
          paymentProviderId={paymentReviewDetails?.paymentMethod?.paymentProviderId}
          mopDetails={paymentReviewDetails?.paymentMethod?.cclast4}
        />
      </div>

      {/* BILLING CONTAINER */}
      <div id="okta-otp-review-billing-container" className="sub-container">
        <h3 className="sub-header">Billing</h3>
        <p className="description">
          {customerType === "business" ? 'Total payment amount' : 'Payment amount'}:{" "}
          <span className="fw-bold">
            ${paymentReviewDetails?.billing?.paymentAmount}
          </span>
        </p>
        <p className="description">
          Payment date:{" "}
          {formatDate(
            paymentReviewDetails?.billing?.paymentDate
          )}
        </p>
      </div>

      {/* PAYMENT DETAILS CONTAINER FOR CUSTOMER TYPE = RESIDENTIAL*/}
      {customerType !== "business" && <div
        id="okta-otp-review-payment-details-container"
        className="sub-container"
      >
        <h3 className="sub-header">Payment details</h3>
        {/* map here */}
        <div className="statement-container">
          {paymentReviewDetails?.paymentDetails.map((paymentData: any) => {
            return (
              <div>
                <p className="description">
                  Statement {paymentData?.statementCode}: {paymentData?.serviceName}
                </p>
                <p className="description">
                  Total: ${paymentData?.totalAmount}
                  {/* {paymentData.paymentOption === "totalBalance"
                    ? paymentData.totalBalanceDue
                    : paymentData.paymentOption === "pastDue"
                      ? paymentData.pastDueBalance
                      : paymentData.otherAmount} */}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      }

      {/* PAYMENT DETAILS CONTAINER FOR CUSTOMER TYPE = BUSINESS*/}
      {customerType === "business" && <><div className="payment-details-container mt-2">
        <div id="payment-details-container">
          <h4 className="payment-header mb-3">
            Payment details
          </h4>
          {paymentReviewDetails?.cbPaymentDetails && visibleStatements?.map((card: any) => (
            <><div className="payment-header mb-2">{card.serviceName} </div>
              {card.statementDetails.map((block: any) => (<div className="mb-3">
                <div>Account number: {block?.accountNumber?.slice(0, 3)} {block?.accountNumber?.slice(3, 7)} {block?.accountNumber?.slice(7)}</div>
                <div>Account alias: {block?.accountAlias}</div>
                <div>Statement: {block?.statement}</div>
                <div>Amount: ${block?.amount}</div>
              </div>))}
            </>
          ))}
        </div>
      </div>
        {totalStatements > 2 && <div className="mt-n3 viewAll">
          {!viewAll ? (<span onClick={() => setViewAll(true)}>View all</span>) : (<span onClick={() => setViewAll(false)}>View less</span>)}
        </div>}</>}


      {/* FORM CONTAINER */}
      <form method="post" onSubmit={handleSubmit}>
        {/*
          NOTE: the checkboxes below (easy-pay, paperless, otp-terms-and-service) stay raw
          input/label markup instead of core-ui8's FormCheckbox because FormCheckbox's option
          label is a plain string (FormItemProps) with no children/ReactNode slot and no way to
          bind a click handler to part of the label. Each of these labels embeds an inline Link
          that opens a Terms modal on click — only that phrase is clickable, not the whole label —
          plus server-supplied HTML and inline bold text in two of the three. None of that is
          expressible as a string, so FormCheckbox can't render them.
        */}
        {/* BILLING OPTIONS CONTAINER */}
        {!payment?.multiAccount && (paymentReviewDetails?.billingOptions?.showEasyPayCheckbox || paymentReviewDetails?.billingOptions?.showPaperlessCheck) && (
          <div
            id="okta-otp-review-billing-options-container"
            className="sub-container"
          >
            <h3 className="sub-header">
              Billing options<span className="sub-header-label">(Optional)</span>
            </h3>

            {paymentReviewDetails?.billingOptions?.showEasyPayCheckbox && (
              <label className="custom-checkbox" htmlFor="easy-pay">
                <input
                  type="checkbox"
                  id="easy-pay"
                  name="easy-pay"
                  aria-label="easy-pay-terms-of-service"
                  aria-required="true"
                  checked={isEasyPayChecked}
                  onChange={handleEasyPayChecked}
                  data-automation-id="review-terms-service-checkbox"
                />
                <span className="checkmark"></span>
                <span className="checkbox-label"></span>

                {customerType !== "business" && <label htmlFor="easy-pay">
                  {paymentReviewDetails?.billingOptions?.clickToCancelText && (
                    <>
                      <div
                        className="click-to-cancel-text"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            paymentReviewDetails?.billingOptions?.clickToCancelText
                          ),
                        }}
                      ></div>
                      <br />
                    </>
                  )}
                  <p>
                    By checking this box, I confirm that I have read and agree to
                    the{" "}
                    <Link
                      className="modal-link"
                      data-automation-id="easy-pay-terms-of-service-link"
                      onClick={(e: any) => {
                        e.preventDefault();
                        handleOpenModal(
                          paymentReviewDetails?.billingOptions?.easyPayModalHeader,
                          paymentReviewDetails?.billingOptions?.easyPayModalBody
                        );
                      }}
                      role="button"
                      to="#"
                    >
                      EasyPay Terms of Service
                    </Link>
                    .
                  </p>
                </label>
                }

                {/* {LABEL FOR CUSTOMER TYPE BUSINESS } */}
                {customerType === "business" && (<label htmlFor="auto-pay">
                  <p>
                    Never miss a payment by saving and enrolling this payment
                    method in automatic monthly payments with Auto pay.
                    I have read and agree to the{" "}
                    <Link
                      className="modal-link"
                      data-automation-id="auto-pay-terms-of-service-link"
                      onClick={(e: any) => {
                        e.preventDefault();
                        handleOpenModal(
                          paymentReviewDetails?.billingOptions?.easyPayModalHeader,
                          paymentReviewDetails?.billingOptions?.easyPayModalBody
                        );
                      }}
                      role="button"
                      to="#"
                    >
                      Autopay Terms of Service
                    </Link>
                    .
                  </p>
                </label>)}
              </label>
            )}

            {paymentReviewDetails?.billingOptions?.showPaperlessCheck && (
              <label className="custom-checkbox" htmlFor="paperless">
                <input
                  type="checkbox"
                  id="paperless"
                  name="paperless"
                  aria-label="enroll-in-paperless-billing"
                  aria-required="true"
                  checked={isPaperlessChecked}
                  onChange={handlePaperlessChecked}
                  data-automation-id="review-terms-service-checkbox"
                />
                <span className="checkmark"></span>
                <span className="checkbox-label"></span>

                <label htmlFor="paperless">
                  <p>
                    Enroll in paperless billing. View your bill anytime, reduce
                    clutter and protect the environment. We'll send statement
                    reminders to{" "}
                    <span className="fw-bold">
                      {customerType === "business" ? paymentReviewDetails?.billingOptions?.cbMailId : paymentReviewDetails?.billingOptions?.mailId}.
                    </span>
                  </p>
                </label>
              </label>
            )}
          </div>
        )}

        {/* TERMS & CONDITIONS CONTAINER */}
        <div
          id="okta-otp-review-terms-and-conditions-container"
          className="sub-container"
        >
          <h3 className="sub-header">
            Terms and Conditions
            <span className="sub-header-label">(Required)</span>
          </h3>

          <label
            className={`${showError ? "custom-checkbox-error" : ""} custom-checkbox`}
            htmlFor="otp-terms-and-service"
          >
            <input
              type="checkbox"
              id="otp-terms-and-service"
              name="otp-terms-and-service"
              aria-label="one-time-payment-terms-of-service"
              aria-required="true"
              checked={isOTPChecked}
              onChange={handleOTPChecked}
              data-automation-id="review-terms-service-checkbox"
            />
            <span className="checkmark"></span>
            <span className="checkbox-label"></span>

            <label
              className="otp-terms-and-service-label"
              htmlFor="otp-terms-and-service"
            >
              I have read and agree to the{" "}
              <Link
                className="modal-link"
                data-automation-id="one-time-payment-terms-and-service-link"
                onClick={(e: any) => {
                  e.preventDefault();
                  handleOpenModal(
                    payment.termsAndConditions.otpModalHeader,
                    payment.termsAndConditions.otpModalBody
                  );
                }}
                role="button"
                to="#"
              >
                One-Time Payment Terms of Service
              </Link>
              .
            </label>
          </label>

          {showError && (
            <FormMessage
              id="otp-terms-and-service-error"
              status={MessageStatus.ERROR}
              message={showError}
            />
          )}
        </div>

        {/* BUTTON CONTAINER */}
        <div id="okta-otp-review-buttons-container" className="button-group pt-4">
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

export default ReviewMopTemplate;
