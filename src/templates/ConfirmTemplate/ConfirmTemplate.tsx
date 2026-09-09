import React, { useEffect } from "react";
import DOMPurify from "dompurify";

const ConfirmTemplate = ({ payment }: any) => {
  const {
    paymentConfirmDetails = {}
  } = payment;

  const { udoVars } = paymentConfirmDetails;

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
    amountAttempted = udoVars?.amountAttempted,
    amountPaid = udoVars?.amountPaid,
    eventNames = udoVars?.eventNames,
    selfHelpName = udoVars?.selfHelpName,
    formError = udoVars?.formError
  } = udoVars;

  const { errorMessage } = paymentConfirmDetails.paymentDetailsInfo;

  useEffect(() => {
    if (errorMessage == null) {
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
          amountAttempted: amountAttempted,
          amountPaid: amountPaid,
          eventNames: eventNames,
          selfHelpName: selfHelpName
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
          amountAttempted: amountAttempted,
          amountPaid: amountPaid,
          eventNames: eventNames,
          selfHelpName: selfHelpName
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
          amountAttempted: amountAttempted,
          amountPaid: amountPaid,
          eventNames: eventNames,
          selfHelpName: selfHelpName
        });

        window?.utag?.link?.({
          channel: channel,
          pageName: pageName,
          pageType: pageType,
          subSection: subSection,
          businessUnit: businessUnit,
          purchaseStep: purchaseStep,
          visitorLoginStatus: visitorLoginStatus,
          amountAttempted: amountAttempted,
          amountPaid: amountPaid,
          eventNames: eventNames,
          selfHelpName: selfHelpName
        });
      }
    }
    else if (amountDue != null) {
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
        eventNames: eventNames,
        selfHelpName: selfHelpName,
        formError: formError
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
        eventNames: eventNames,
        selfHelpName: selfHelpName,
        formError: formError
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
        eventNames: eventNames,
        selfHelpName: selfHelpName,
        formError: formError
      });

      window?.utag?.link?.({
        channel: channel,
        pageName: pageName,
        pageType: pageType,
        subSection: subSection,
        businessUnit: businessUnit,
        purchaseStep: purchaseStep,
        visitorLoginStatus: visitorLoginStatus,
        eventNames: eventNames,
        selfHelpName: selfHelpName,
        formError: formError
      });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {paymentConfirmDetails.paymentDetailsInfo.errorMessage ? (
        <div className="col-12">
          <div
            className="alert alert-danger pl-1 pr-2 ml-alert-err"
            role="alert"
            data-automation-id="confirm-error-alert-icon"
          >
            <div className="alert-content error ml-1"></div>
            <span data-automation-id="confirm-error-alert-msg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paymentConfirmDetails.paymentDetailsInfo.errorMessage) }}>
            </span>
          </div>
        </div>
      ) : (
        ""
      )}

      {paymentConfirmDetails.paymentDetailsInfo.successMessage ? (
        <div className="col-12">
          <div
            className="alert pl-1 pr-2 ml-alert-info"
            role="alert"
            data-automation-id="confirm-success-icon"
          >
            <div className="alert-content info ml-1"></div>
            <span data-automation-id="confirm-success-msg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paymentConfirmDetails.paymentDetailsInfo.successMessage) }}>
            </span>
          </div>
        </div>
      ) : (
        ""
      )}

      <p className="review-heading" data-automation-id="confirm-thank-you-header-txt">
        {paymentConfirmDetails.paymentDetailsInfo.headerText}
      </p>
      <p className="review-heading-text" data-automation-id="confirm-header-description-txt">
        {paymentConfirmDetails.paymentDetailsInfo.description}
      </p>

      <div className="row payment-review-confirm-container box-style-border">
        <div className="center-content payment-review-details-wrapper">
          <p className="subheading-payment-details mt-2" data-automation-id="confirm-sub-header-txt">
            {paymentConfirmDetails.paymentDetailsInfo.subHeaderText}
          </p>
          <div className="payment-review-section my-3">
            <p className="mb-0" data-automation-id="confirm-payment-method-lbl">
              <strong>Payment method:</strong>
            </p>
            <div className="saved-mop-container">
              <div className="saved-mop">
                <div className="saved-mop-content my-1 py-0">
                  <div className={`saved-mop-details ${paymentConfirmDetails.paymentConfirmMethod.methodData.type}`}>
                    {paymentConfirmDetails.paymentConfirmMethod.methodData.type === "bank" ?
                      (
                        <>
                          <span data-automation-id="confirm-bank-name">
                            {paymentConfirmDetails.paymentConfirmMethod.methodData.endDate}
                          </span>
                          <span data-automation-id="confirm-bank-account-number">
                            {" "}{paymentConfirmDetails.paymentConfirmMethod.methodData.cardNumber}
                          </span>
                        </>
                      ) :
                      (
                        <>
                          <span data-automation-id="confirm-card-number">
                            {" "}{paymentConfirmDetails.paymentConfirmMethod.methodData.cardNumber}
                          </span>
                          <span data-automation-id="confirm-card-exp-date">
                            {paymentConfirmDetails.paymentConfirmMethod.methodData.endDate}
                          </span>
                        </>
                      )
                    }
                    <span data-automation-id="confirm-full-name">
                      {paymentConfirmDetails.paymentConfirmMethod.methodData.fullName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {paymentConfirmDetails.paymentConfirmMethod.billingText ? (
            <div className="payment-review-section my-3">
              <p className="mb-1" data-automation-id="confirm-billing-lbl">
                <strong>Billing:</strong>
              </p>
              <p className="mb-1" data-automation-id="confirm-billing-text-val">
                <span>{paymentConfirmDetails.paymentConfirmMethod.billingText}</span>
              </p>
            </div>
          ) : (
            ""
          )}
          {paymentConfirmDetails.paymentConfirmMethod.totalAmount ? (
            <div className="payment-review-section my-3">
              <p className="mb-1" data-automation-id="confirm-total-payment-lbl">
                <strong>Total payment:</strong>
              </p>
              <p className="mb-1" data-automation-id="confirm-total-amount-val">{paymentConfirmDetails.paymentConfirmMethod.totalAmount}</p>
            </div>
          ) : (
            ""
          )}
          {paymentConfirmDetails.paymentConfirmMethod.attemptedAmount ? (
            <div className="payment-review-section my-3">
              <p className="mb-1" data-automation-id="confirm-attempted-amount-lbl">
                <strong>Attempted amount:</strong>
              </p>
              <p className="mb-1" data-automation-id="confirm-attempted-amount-val">
                {paymentConfirmDetails.paymentConfirmMethod.attemptedAmount}
              </p>
            </div>
          ) : (
            ""
          )}
          {paymentConfirmDetails.paymentConfirmMethod.confirmationCode ? (
            <div className="payment-review-section my-3">
              <p className="mb-1" data-automation-id="confirm-confirmation-lbl">
                <strong>Confirmation:</strong>
              </p>
              <p className="mb-1" data-automation-id="confirm-confirmation-code">
                {paymentConfirmDetails.paymentConfirmMethod.confirmationCode}
              </p>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

      {paymentConfirmDetails.paymentConfirmMethod.totalAmount ? (
        <div className="row">
          <div className="center-content">
            <div className="form-buttons text-center">
              <a
                href="#"
                title="Print Confirmation"
                className="print-trigger no-print desktop-only"
                aria-label="Print confirmation"
                onClick={handlePrint}
                data-automation-id="confirm-print-confirmation-link"
              >
                {" "}
                Print confirmation
              </a>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ConfirmTemplate;
