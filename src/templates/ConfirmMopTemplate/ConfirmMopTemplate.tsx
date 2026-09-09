import ErrorAlert from "../../components/Alerts/ErrorAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";
import CardMop from "../../components/CardMop/CardMop";
import DOMPurify from "dompurify";
import {
  MY_BILL_HOME_PAGE,
  ONE_TIME_PAYMENT_STATEMENT_PAGE_PROTOTYPE,
} from "../../hooks/constants";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
} from "@cox/core-ui8";
import { useState, useEffect } from "react";
import { getVisbileStatements } from "../../utils/helper-utlities";
import WarningAlert from "../../components/Alerts/WarningAlert";

interface RequestParams {
  [key: string]: string | undefined | boolean;
}

export const enum Cookie {
  CBATCC = "_cbatcc",
}

export class CookieDomain {
  coxdotcom = "cox.com";
}

function ConfirmMopTemplate({ payment, customerType, setPaymentData }: any) {
  const { paymentConfirmDetails = {} } = payment;
  const [viewAll, setViewAll] = useState(false);
  const totalStatements = paymentConfirmDetails?.cbPaymentDetails?.reduce(
    (sum: any, block: { statementDetails: string | any[] }) =>
      sum + (block.statementDetails?.length || 0),
    0,
  );
  const visibleStatements =
    customerType === "business"
      ? getVisbileStatements(paymentConfirmDetails?.cbPaymentDetails, viewAll)
      : [];

  useEffect(() => {
    const hasAlerts =
      paymentConfirmDetails?.messages?.success ||
      paymentConfirmDetails?.messages?.failed;

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [
    paymentConfirmDetails?.messages?.success,
    paymentConfirmDetails?.messages?.failed,
  ]);

  async function handleClick() {
    const currentUrl = window.location.href;
    if (paymentConfirmDetails?.paymentStatus !== "success") {
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = ONE_TIME_PAYMENT_STATEMENT_PAGE_PROTOTYPE;
      } else {
        window.location.reload();
      }
    } else {
      if (customerType === "business") {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div
        id="payment-confirm"
        className={customerType === "business" ? "cb-customer" : ""}
      >
        {customerType === "business" && (
          <div className="navigation-back  d-flex justify-content-between">
            <div
              id="payment-confirm-sub-header"
              data-automation-id="payment-confirm-sub-header"
              className="sub-header-text"
            >
              {payment?.cbSubHeaderDescription}
            </div>
            {payment.pageName === "confirm" && (
              <span>
                <a
                  href="#"
                  title="Print"
                  className="print-trigger no-print desktop-only text-decoration-none"
                  aria-label="Print confirmation"
                  onClick={handlePrint}
                  data-automation-id="confirm-print-confirmation-link"
                >
                  Print
                </a>
              </span>
            )}
          </div>
        )}
        <div className="content mb-4">
          {paymentConfirmDetails?.messages?.success && (
            <SuccessAlert
              message={paymentConfirmDetails?.messages?.success}
              id="one-time-payment"
            />
          )}
          {paymentConfirmDetails?.messages?.failed && (
            <ErrorAlert
              message={paymentConfirmDetails?.messages?.failed}
              id="one-time-payment"
              linkText={paymentConfirmDetails?.messages?.linkText}
              linkUrl={paymentConfirmDetails?.messages?.linkUrl}
            />
          )}
          {paymentConfirmDetails?.achOfferAlertPendingStatus && (
            <WarningAlert
              message={paymentConfirmDetails?.achOfferAlertPending}
              id={"ach-offer-alert"}
            />
          )}
          <p
            data-testid="payment-description"
            data-automation-id="payment-description"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                paymentConfirmDetails?.paymentArrangementText,
              ),
            }}
          />
        </div>
        {customerType !== "business" && (
          <div className="payment-details-container mb-4">
            <div id="confirm-pay-payment-container">
              <h4 className="payment-header">Account details</h4>
              <div className="description">
                <div>
                  <span>Account number:</span>{" "}
                  {paymentConfirmDetails?.accountDetails?.accountNumber}
                </div>
                <div>
                  <span>Service Address:</span>{" "}
                  {paymentConfirmDetails?.accountDetails?.serviceAddress}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="payment-card-container mb-4">
          <div id="confirm-pay-payment-container">
            <h3 className="payment-header">Payment method</h3>
            <CardMop
              automationId={
                paymentConfirmDetails?.paymentMethod.type === "bank"
                  ? "review-bank-account-number"
                  : "review-card-number"
              }
              type={paymentConfirmDetails?.paymentMethod.type}
              paymentProviderId={
                paymentConfirmDetails?.paymentMethod?.paymentProviderId
              }
              mopDetails={paymentConfirmDetails?.paymentMethod.cclast4}
            />
          </div>
        </div>
        <div className="payment-billing-container mb-4">
          <div id="billing-pay-payment-container">
            <h4 className="payment-header">Billing</h4>
            <div className="description">
              <div>
                {paymentConfirmDetails?.paymentStatus === "failed"
                  ? "Attempted payment amount:"
                  : customerType === "business"
                    ? "Total payment amount:"
                    : "Payment amount:"}{" "}
                <strong>${paymentConfirmDetails?.billing.paymentAmount}</strong>
              </div>
              <div>
                {paymentConfirmDetails?.paymentStatus === "failed"
                  ? "Attempted payment date:"
                  : "Payment date:"}{" "}
                {new Date(
                  paymentConfirmDetails?.billing.paymentDate,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
        {customerType !== "business" && (
          <div className="payment-details-container mb-4">
            <div id="payment-details-container">
              <h4 className="payment-header">Payment details</h4>
              {paymentConfirmDetails?.paymentDetails &&
                paymentConfirmDetails?.paymentDetails.map((card: any) => (
                  <div className="payment-detail mb-3">
                    <div>
                      Statement {card.statementCode}: {card.serviceName}
                    </div>
                    <div>
                      Total: ${card.totalAmount}
                      {card.status === "Succeeded" && (
                        <span>
                          {" "}
                          -{" "}
                          <span className="success-text font-weight-700">
                            {card.status}
                          </span>
                        </span>
                      )}
                      {card.status === "Failed" && (
                        <span>
                          {" "}
                          -{" "}
                          <span className="error-text font-weight-700">
                            {card.status}
                          </span>
                        </span>
                      )}
                    </div>
                    {card.status === "Succeeded" && (
                      <div>Confirmation: {card.confirmation}</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
        {customerType === "business" && (
          <>
            <div className="payment-details-container mb-3">
              <div id="payment-details-container">
                <h4 className="payment-header mb-3">Payment details</h4>
                {paymentConfirmDetails?.cbPaymentDetails &&
                  visibleStatements.map((card: any) => (
                    <>
                      <div className="payment-header mb-2">
                        {card.serviceName}{" "}
                      </div>
                      {card.statementDetails.map((block: any) => (
                        <div className="mb-3">
                          <div>
                            Account number: {block?.accountNumber?.slice(0, 3)}{" "}
                            {block?.accountNumber?.slice(3, 7)}{" "}
                            {block?.accountNumber?.slice(7)}
                          </div>
                          <div>Account alias: {block?.accountAlias}</div>
                          <div>Statement: {block?.statement}</div>
                          <div>
                            Amount: ${block?.amount} -{" "}
                            <span
                              className={`font-weight-700 ${block?.status === "Succeeded" ? "success-text" : "error-text"}`}
                            >
                              {block?.status === "Succeeded"
                                ? "Succeeded"
                                : "Failed"}
                            </span>
                          </div>
                          {block.status === "Succeeded" && (
                            <div>Confirmation: {block?.confirmation}</div>
                          )}
                        </div>
                      ))}
                    </>
                  ))}
              </div>
            </div>
            {totalStatements > 2 && (
              <div className="mb-4 pb-2 viewAll">
                {!viewAll ? (
                  <span onClick={() => setViewAll(true)}>View all</span>
                ) : (
                  <span onClick={() => setViewAll(false)}>View less</span>
                )}
              </div>
            )}
          </>
        )}
        <div className="payment-done button-group print-trigger">
          <Button
            openInNewTab={false}
            alignment={AlignmentProps.CENTER}
            text={
              paymentConfirmDetails?.paymentStatus !== "success"
                ? "Try again"
                : "Done"
            }
            size=""
            buttonStates={ButtonStates.ACTIVE}
            buttonTypes={ButtonTypes.PRIMARY}
            customClickEvent={handleClick}
            data-automation-id="edit-mop-modal-submit-button"
          />
          {paymentConfirmDetails?.paymentStatus !== "success" && (
            <Button
              openInNewTab={false}
              alignment={AlignmentProps.CENTER}
              text={
                customerType === "business"
                  ? "Billing details"
                  : "Account overview"
              }
              size=""
              buttonStates={ButtonStates.ACTIVE}
              buttonTypes={ButtonTypes.SECONDARY}
              customClickEvent={() =>
                (window.location.href =
                  customerType === "business"
                    ? payment.navigateTo
                    : MY_BILL_HOME_PAGE)
              }
              data-automation-id="edit-mop-modal-submit-button"
            />
          )}
        </div>
      </div>
    </>
  );
}

export default ConfirmMopTemplate;
