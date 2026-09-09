import React, { useState, useEffect } from "react";
import OneTimePaymentModal from "../../components/widgets/onetimepayment/onetimepaymentmodal";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormMessage,
  MessageStatus,
} from "@cox/core-ui8";
import { useAxios } from '@cox/core-ui8/dist/useAxios';
import { apiHost } from '../../config'
import {
  MAKE_PAYMENT_CONFIRM_INFO_POST_URL, MAKE_PAYMENT_AUTHORIZATION_FAILED_URL,
  MAKE_PAYMENT_CONFIRM_PAGE_PROTOTYPE, MAKE_PAYMENT_CSRF_VALIDATION_FAILED_URL,
  MAKE_PAYMENT_HOME_PAGE_PROTOTYPE
} from "../../hooks/constants";

const ReviewTemplate = ({ payment, onPostSubmitResponse }: any) => {
  const {
    paymentReviewDetails = {}
  } = payment;

  const { udoVars } = paymentReviewDetails;

  const {
    channel = udoVars?.channel,
    pageName = udoVars?.pageName,
    pageType = udoVars?.pageType,
    subSection = udoVars?.subSection,
    businessUnit = udoVars?.businessUnit,
    purchaseStep = udoVars?.purchaseStep,
    visitorLoginStatus = udoVars?.visitorLoginStatus,
    amountDue = udoVars?.amountDue,
    amountPastDue = udoVars?.amountPastDue,
    amountAttempted = udoVars?.amountAttempted
  } = udoVars;

  useEffect(() => {
    if (amountDue != null) {
      window?.utag?.view?.({
        channel: channel,
        pageName: pageName,
        pageType: pageType,
        subSection: subSection,
        businessUnit: businessUnit,
        purchaseStep: purchaseStep,
        visitorLoginStatus: visitorLoginStatus,
        amountDue: amountDue,
        amountPastDue: amountPastDue,
        amountAttempted: amountAttempted
      });

      window?.utag?.link?.({
        channel: channel,
        pageName: pageName,
        pageType: pageType,
        subSection: subSection,
        businessUnit: businessUnit,
        purchaseStep: purchaseStep,
        visitorLoginStatus: visitorLoginStatus,
        amountDue: amountDue,
        amountPastDue: amountPastDue,
        amountAttempted: amountAttempted
      });
    }
    else {
      window?.utag?.view?.({
        channel: channel,
        pageName: pageName,
        pageType: pageType,
        subSection: subSection,
        businessUnit: businessUnit,
        purchaseStep: purchaseStep,
        visitorLoginStatus: visitorLoginStatus,
        amountAttempted: amountAttempted
      });

      window?.utag?.link?.({
        channel: channel,
        pageName: pageName,
        pageType: pageType,
        subSection: subSection,
        businessUnit: businessUnit,
        purchaseStep: purchaseStep,
        visitorLoginStatus: visitorLoginStatus,
        amountAttempted: amountAttempted
      });
    }
  }, []);

  interface RequestParams {
    [key: string]: string | undefined;
  }

  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState("");

  const [modalShowPayment, setModalShowPayment] = useState(false);
  const [modalUrlPayment, setModalUrlPayment] = useState("");

  const [errorMessages, setErrorMessages] = useState([]);

  const { axiosAPI } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      handleOnComplete(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    }
  });

  const handleOnComplete = (data: any) => {
    // if (response.status !== 200) {
    //   throw new Error("Network response was not okay");
    // }

    // const data = response.data;

    if (typeof data.errorMessages == "undefined") {
      console.log("CSRF validation failed.");
      window.location.href = MAKE_PAYMENT_CSRF_VALIDATION_FAILED_URL;
      return;
    } else if (data.errorMessages != null && data.errorMessages.length > 0) {
      console.log("Server side validation is not successful.");
      // display the error messages at top of the screen
      setErrorMessages(data.errorMessages);
    } else {
      console.log("Server side validation is successful.");
      setErrorMessages([]);
      // Callback to parent which navigates user to review page
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  }

  const handleOpenModalPayment = (url: string) => {
    setModalUrlPayment(url);
    setModalShowPayment(true);
  };

  const handleCloseModalPayment = () => {
    setModalShowPayment(false);
  };

  const handleInputChange = (event: any) => {
    setIsChecked(event.target.checked);
    if (!isChecked) {
      setErrors("");
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!isChecked) {
      setErrors("Please check this option to continue.");
    } else {
      setErrors("");
      const currentUrl = window.location.href;
      if (currentUrl.includes("/ui/v8")) {
        if (currentUrl.includes("pay-now.html")) {
          window.location.href = MAKE_PAYMENT_CONFIRM_PAGE_PROTOTYPE;
        }
        return;
      } else {
        const requestParams: RequestParams = {};

        //fetch token from url and send it in request parameter
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
          requestParams.id = id;
        } else {
          window.location.href = MAKE_PAYMENT_AUTHORIZATION_FAILED_URL;
          return;
        }

        try {
          const host = window.RequestJson === undefined ? apiHost : window.location.origin
          await axiosAPI({
            url: `${host}${MAKE_PAYMENT_CONFIRM_INFO_POST_URL}`,
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            data: JSON.stringify(requestParams)
          });
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
  };

  function handleBackBtnClick() {
    const currentUrl = window.location.href;
    /* if prototype url, return to pay-now.html*/
    if (currentUrl.includes("/ui/v8")) {
      if (currentUrl.includes("pay-now.html")) {
        window.location.href = MAKE_PAYMENT_HOME_PAGE_PROTOTYPE;
      }
      return;
    } else {
      /*const searchParams = new URLSearchParams(document.location.search)
      window.location.href ="/payments/pay-now.html?id=" + searchParams.get('id');*/
      window.location.reload();
    }
  }

  return (
    <>
      <div className="row">
        <div className="col-sm-12 px-0">
          <p
            className="review-heading mt-2"
            data-automation-id="review-submit-payment-text"
          >
            Review details and submit payment
          </p>
          <p
            className="review-heading-text mx-3"
            data-automation-id="review-payment-desc-text"
          >
            You're almost done. Review your payment details and click Submit. We'll schedule your payment today.
          </p>
        </div>
      </div>
      <div className="row justify-content-center box-style-border">
        <div className="col-sm-12 mt-3">
          <p className="subheading-payment-details text-center" data-automation-id="review-payment-details-text">
            Payment details
          </p>
          <div className="row payment-review-confirm-container">
            <div className="center-content payment-review-details-wrapper">
              <div className="payment-review-section my-3">
                <p className="mb-0" data-automation-id="review-payment-method-lbl">
                  <strong>Payment method:</strong>
                </p>
                <div className="saved-mop-container">
                  <div className="saved-mop">
                    <div className="saved-mop-content my-1 py-0">
                      <div className={`saved-mop-details ${paymentReviewDetails.paymentReviewMethod.methodData.type}`}>
                        {paymentReviewDetails.paymentReviewMethod.methodData.type === "bank" ?
                          (
                            <>
                              <span data-automation-id="review-bank-name">
                                {paymentReviewDetails.paymentReviewMethod.methodData.endDate}
                              </span>
                              <span data-automation-id="review-bank-account-number">
                                {" "}{paymentReviewDetails.paymentReviewMethod.methodData.cardNumber}
                              </span>
                            </>
                          ) :
                          (
                            <>
                              <span data-automation-id="review-card-number">
                                {" "}{paymentReviewDetails.paymentReviewMethod.methodData.cardNumber}
                              </span>
                              <span data-automation-id="review-card-exp-date">
                                {paymentReviewDetails.paymentReviewMethod.methodData.endDate}
                              </span>
                            </>
                          )
                        }
                        <span data-automation-id="review-full-name">
                          {paymentReviewDetails.paymentReviewMethod.methodData.fullName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="payment-review-section my-3">
                <p className="mb-1" data-automation-id="review-billing-lbl">
                  <strong>Billing:</strong>
                </p>
                <p className="mb-1" data-automation-id="review-billing-text">
                  <span>{paymentReviewDetails.paymentReviewMethod.billingText}</span>
                </p>
              </div>
              <div className="payment-review-section my-3">
                <p className="mb-1" data-automation-id="review-total-payment-lbl">
                  <strong>Total payment:</strong>
                </p>
                <p className="mb-1" data-automation-id="review-billing-totalAmount">
                  ${paymentReviewDetails.paymentReviewMethod.totalAmount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
        NOTE: the terms-of-service checkbox below stays raw input/label markup instead of
        core-ui8's FormCheckbox because FormCheckbox's option label is a plain string
        (FormItemProps) with no children/ReactNode slot and no way to bind a click handler to
        part of the label. The label embeds an inline Link that opens a Terms modal on click —
        only that phrase is clickable, not the whole label — which isn't expressible as a
        string, so FormCheckbox can't render it.
      */}
      <div className="row box-style-border">
        <div className="col-md-12 center-content">
          <form className="form wrap-errors collapse-form-validate" method="post" onSubmit={handleSubmit}>
            <div className="one-time-review mt-2">
              <div data-content="ibill-verify-page">
                <input
                  type="checkbox"
                  id="terms-of-service-check"
                  name="time-terms-of-service"
                  className={`${errors ? "terms-of-service required error" : "terms-of-service required"}`}
                  aria-label="terms-of-service"
                  aria-required="true"
                  checked={isChecked}
                  onChange={handleInputChange}
                  data-automation-id="review-terms-service-checkbox"
                />
                <label htmlFor="terms-of-service-check" className={`${errors ? "errorLabel" : ""}`}>
                  <span data-automation-id="review-terms-service-complete-text">
                    I have read and agree to the{" "}
                    <a
                      href="#"
                      onClick={() =>
                        handleOpenModalPayment(
                          "../../components/widgets/onetimepayment/onetimepaymentmodal.tsx",
                        )
                      }
                      role="button"
                      data-toggle="modal"
                      id="link-terms-of-service"
                      data-target="#one-time-payment-terms-modal"
                      data-automation-id="review-otp-link"
                    >
                      {paymentReviewDetails.serviceLinkText}
                    </a>{" "}
                    Terms of Service.
                    <OneTimePaymentModal
                      oneTimePaymentHeader={
                        paymentReviewDetails.oneTimePayment.headerText
                      }
                      oneTimePaymentData={
                        paymentReviewDetails.oneTimePayment.oneTimePaymentData
                      }
                      show={modalShowPayment}
                      onHide={handleCloseModalPayment}
                      url={modalUrlPayment}
                      modalId="one-time-payment-terms-modal"
                    />
                  </span>
                </label>
                {errors && (
                  <FormMessage id="reviewtemplate-error-1" status={MessageStatus.ERROR} message={errors} />
                )}
              </div>
            </div>
            <div className="form-buttons review-buttons text-center">
              <Button
                isFormSubmit={true}
                openInNewTab={false}
                alignment={AlignmentProps.CENTER}
                text="Submit"
                size=""
                buttonStates={ButtonStates.ACTIVE}
                buttonTypes={ButtonTypes.PRIMARY}
                data-automation-id="review-submit-btn"
              />
            </div>
          </form>
          <div className="form-buttons review-buttons-back text-center">
            <Button
              openInNewTab={false}
              alignment={AlignmentProps.CENTER}
              text="Back"
              size=""
              buttonStates={ButtonStates.ACTIVE}
              buttonTypes={ButtonTypes.SECONDARY}
              customClickEvent={handleBackBtnClick}
              data-automation-id="review-back-btn"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewTemplate;
