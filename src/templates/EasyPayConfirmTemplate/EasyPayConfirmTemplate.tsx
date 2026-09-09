import { useEffect, useState } from "react";
import { setUDOVariables } from "../../hooks/utils";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import CardMop from "../../components/CardMop/CardMop";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import { AlignmentProps, Button, ButtonStates, ButtonTypes, LinkTypes } from "@cox/core-ui8";
import { MY_BILL_HOME_PAGE, OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE } from "../../hooks/constants";
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";
import WarningAlert from "../../components/Alerts/WarningAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";

export const enum Cookie {
    CBATCC = "_cbatcc",
}

export class CookieDomain{
    coxdotcom = 'cox.com'
}


const EasyPayConfirmTemplate = ({ payment, customerType }: any) => {
  const {
    paymentConfirmDetails = {},
    udoVariables = {}
  } = payment;

  const getLabelForBackNavigation = payment?.navigateTo?.includes('ibill') ? 'Billing home' : 'Account overview';

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
  }, []);

  useEffect(() => {
    const hasAlerts =
      paymentConfirmDetails?.paymentStatus ||
      paymentConfirmDetails?.paymentDetailsInfo?.errorMessage ||
      paymentConfirmDetails?.messages?.successMessages?.length > 0 ||
      paymentConfirmDetails?.messages?.errorMessages?.length > 0 ||
      paymentConfirmDetails?.messages?.failed

    if (hasAlerts) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    paymentConfirmDetails?.paymentStatus,
    paymentConfirmDetails?.paymentDetailsInfo?.errorMessage,
    paymentConfirmDetails?.messages?.successMessages?.length,
    paymentConfirmDetails?.messages?.errorMessages?.length,
    paymentConfirmDetails?.messages?.failed
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleTryAgainAndDone = () => {
    const currentUrl = window.location.href;
    if (paymentConfirmDetails?.paymentStatus !== "success") {    
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE;
      }
      else {
        window.location.reload();
      }
    } else {
      if (customerType === "business" && payment?.oktaLogin) {
        const domain = new CookieDomain();
        if (currentUrl.includes("/ui/v8")) {
          document.cookie = `${Cookie.CBATCC}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          document.cookie = `${Cookie.CBATCC}=; path=/; domain=${domain.coxdotcom}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; secure`;
        }
        window.location.href = payment.navigateTo;
      } else {
        window.location.href = MY_BILL_HOME_PAGE;
      }
    }
  }
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div id="easy-pay-confirm" className="confirm-container">
        {/* Breadcrumb - OKTA FLOW */}
        {customerType !== "business" && (
          <div className={`${!payment.oktaLogin ? "text-right" : "navigation-back d-flex justify-content-between pb-0"}`}>
            {(payment.oktaLogin &&
              <a href={payment.navigateTo}
                className='link__anchor'>
                <img src={chevronLeft} className='link__icon' alt="chevronLeft" />
                {getLabelForBackNavigation}
              </a>
            )}

            {((!payment.oktaLogin) || (payment.oktaLogin && paymentConfirmDetails?.paymentStatus === "success")) && <span>
              <a
                href="#"
                title="Print"
                className="print-trigger no-print desktop-only"
                aria-label="Print confirmation"
                onClick={handlePrint}
                data-automation-id="confirm-print-confirmation-link"
              >
                Print
              </a>
            </span>}
          </div>
        )}

        {/* HEADER */}
        <div className="d-flex justify-content-between">
          <h3 className={`confirm-heading text-left ${(customerType === "business" && payment?.oktaLogin) ? '' : 'pt-4'}`} data-automation-id="confirm-header-txt">
            {paymentConfirmDetails?.paymentDetailsInfo?.headerText}
          </h3>
          {((payment?.oktaLogin && customerType === "business" && paymentConfirmDetails?.paymentStatus === "success") && (<span>
            <a
              href="#"
              title="Print"
              className="print-trigger no-print desktop-only"
              aria-label="Print confirmation"
              onClick={handlePrint}
              data-automation-id="confirm-print-confirmation-link"
            >
              Print
            </a>
          </span>
          ))}
        </div>
        {paymentConfirmDetails?.paymentDetailsInfo?.description && <p className="review-heading-text text-left pt-1" data-automation-id="confirm-header-description-txt">
          {paymentConfirmDetails.paymentDetailsInfo.description}
        </p>}

        {/* ERROR ALERT */}
        {paymentConfirmDetails?.paymentDetailsInfo?.errorMessage && (
          <div className="col-12">
            <ErrorAlert
              message={paymentConfirmDetails.paymentDetailsInfo?.errorMessage} id="one-time-payment" />
          </div>
        )}

        {paymentConfirmDetails?.messages?.successMessages && (
          paymentConfirmDetails.messages.successMessages.map((successMessage: String, index: number) => (
            <div key={index}>
              <SuccessAlert message={successMessage} id="easy-pay" />
            </div>
          )
          )
        )}

        {paymentConfirmDetails?.messages?.warningMessages && (
          paymentConfirmDetails.messages.warningMessages.map((warningMessage: String, index: number) => (
            <div key={index}>
              <WarningAlert message={warningMessage} id="easy-pay" />
            </div>
          )
          )
        )}

        {/* ERROR ALERT FOR TOKENIZED FLOW*/}
        {paymentConfirmDetails?.messages?.errorMessages && (
          paymentConfirmDetails.messages.errorMessages.map((errorMessage: String) => (
            <div key={errorMessage.toString()}>
              <ErrorAlert message={errorMessage} id="easy-pay" />
            </div>
          )
          )
        )}

        {/* ERROR ALERT WITH CONTACT US LINK */}
        {paymentConfirmDetails?.messages?.failed &&
          <>
            {paymentConfirmDetails?.messages?.linkText &&
              <Banner
                altIcon="circle-exclamation-moderate-red"
                bannerType={BannerType.DYNAMIC}
                buttonStates={ButtonStates.ACTIVE}
                iconPath="/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg"
                linkType={LinkTypes.CHAT}
                linkText={paymentConfirmDetails?.messages?.linkText}
                linkUrl={paymentConfirmDetails?.messages?.linkUrl}
                message={paymentConfirmDetails?.messages?.failed}
                variation={BannerVariation.ERROR}
              />}
          </>
        }

        {paymentConfirmDetails?.achOfferAlertStatus && (
          <WarningAlert message={paymentConfirmDetails?.achOfferAlert} id={"ach-offer-alert"} />
        )}

        {/* PAYMENT DETAILS - OKTA FLOW */}
        {payment.oktaLogin && <>
          <div className="payment-details-container mb-4 pb-2 mt-4">
            <div id="confirm-pay-payment-container">
              <h4 className="payment-header">
                Account details
              </h4>
              <div className="description">
                <div><span>Account number:</span> {paymentConfirmDetails?.accountDetails?.accountNumber}</div>
                <div><span>Service Address:</span> {paymentConfirmDetails?.accountDetails?.serviceAddress}</div>
              </div>
            </div>
          </div>
          <div className="payment-card-container mb-4 pb-2">
            <div id="confirm-pay-payment-container">
              <h3 className="payment-header">
                Payment method
              </h3>
              <CardMop
                automationId={paymentConfirmDetails?.paymentMethod.type === "bank" ? "review-bank-account-number" : "review-card-number"}
                type={paymentConfirmDetails?.paymentMethod.type}
                paymentProviderId={paymentConfirmDetails?.paymentMethod?.paymentProviderId}
                mopDetails={paymentConfirmDetails?.paymentMethod.cclast4} />
            </div>
          </div>

          {/* PAYMENT DETAILS FOR RESI TYPE */}
          {((paymentConfirmDetails?.paymentStatus === "success" || paymentConfirmDetails?.paymentStatus === "partial-success") &&
            customerType !== "business") &&
            <div className="payment-details-container mb-4 pb-3">
              <div id="payment-details-container">
                <h4 className="payment-header">
                  Payment details
                </h4>
                {paymentConfirmDetails?.paymentDetails && paymentConfirmDetails?.paymentDetails.map((card: any) => (
                  <div className="mt-3">
                    <div>Statement {card.statementCode}: {card.serviceName} </div>
                    {paymentConfirmDetails?.paymentStatus === "partial-success" &&
                      <div>Status: {card.status === "Succeeded" && (
                        <span className="success-text font-weight-700">{card.status}</span>
                      )}
                        {card.status === "Failed" && (
                          <span className="error-text  font-weight-700">{card.status}</span>
                        )}
                      </div>}
                    {/* <div>Next payment date: {card.nextPaymentDate}</div> */}
                  </div>
                ))}
              </div>
            </div>
          }

          {/* PAYMENTS DETAILS FOR BUSINESS TYPE */}
          {(paymentConfirmDetails?.paymentStatus === "success" ||
            paymentConfirmDetails?.paymentStatus === "partial-success") &&
            (customerType === "business" && payment.oktaLogin) && (
              <div className="payment-details-container mb-4 pb-3">
                <div id="payment-details-container">
                  <h4 className="payment-header mb-3">Payment details</h4>
                  {paymentConfirmDetails?.paymentDetails &&
                    (showAll
                      ? paymentConfirmDetails.paymentDetails
                      : paymentConfirmDetails.paymentDetails.slice(0, 2)
                    ).map((card: any) => (
                      <div className="mb-3" key={card.statementCode}>
                        <div>
                          Statement: {card.serviceName}
                        </div>
                        {paymentConfirmDetails.paymentStatus === "partial-success" && (
                          <div>
                            Status:{" "}
                            {card.status === "Succeeded" && (
                              <span className="success-text font-weight-700">
                                {card.status}
                              </span>
                            )}
                            {card.status === "Failed" && (
                              <span className="error-text font-weight-700">
                                {card.status}
                              </span>
                            )}
                          </div>
                        )}
                        <div>
                          Next payment date: {card.nextPaymentDate}
                        </div>
                      </div>
                    ))}
                  {paymentConfirmDetails?.paymentDetails?.length > 2 && (
                    <div className="viewAll" onClick={() => setShowAll(prev => !prev)}>
                      {showAll ? "View less" : "View all"}
                    </div>
                  )}
                </div>
              </div>
            )}


          <div className={`payment-done display-mbl-gap button-group print-trigger ${paymentConfirmDetails?.paymentStatus === "failed" ? "mt-4 pt-3" : ""} `}>
            {paymentConfirmDetails?.paymentStatus !== "success" && (
              <Button
                openInNewTab={false}
                alignment={AlignmentProps.CENTER}
                text="Cancel"
                size=""
                buttonStates={ButtonStates.ACTIVE}
                buttonTypes={ButtonTypes.SECONDARY}
                customClickEvent={() => window.location.href = (customerType === "business" && payment.oktaLogin) ? payment.navigateTo : MY_BILL_HOME_PAGE}
                data-automation-id="okta-easypay-confirm-cancel-button"
              />
            )
            }
            <Button
              openInNewTab={false}
              alignment={AlignmentProps.CENTER}
              text={paymentConfirmDetails?.paymentStatus !== "success" ? "Try again" : "Done"}
              size=""
              buttonStates={ButtonStates.ACTIVE}
              buttonTypes={ButtonTypes.PRIMARY}
              customClickEvent={handleTryAgainAndDone}
              data-automation-id="okta-easypay-confirm-submit-button"
            />
          </div>
        </>
        }

        {/* PAYMENT DETAILS - TOKENIZED FLOW */}
        {paymentConfirmDetails?.paymentConfirmMethod && !payment.oktaLogin && (
          <>
            <div className="row">
              <div className="p-0">
                <div className="my-3">
                  <p className="mb-2 blockquote text-left header-2">
                    <>Payment method</>
                  </p>
                  <div className="saved-mop-container-confirm">
                    <CardMop
                      mopDetails={paymentConfirmDetails?.paymentConfirmMethod.methodData.cardNumber}
                      type={paymentConfirmDetails?.paymentConfirmMethod.methodData.type}
                      paymentProviderId={paymentConfirmDetails?.paymentConfirmMethod?.methodData?.paymentProviderId}
                      automationId={paymentConfirmDetails?.paymentConfirmMethod.methodData.type === "bank" ? "success-bank-account-number" : "success-card-number"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default EasyPayConfirmTemplate;
