import { useEffect } from "react";
import CardMop from "../../components/CardMop/CardMop";
import { AlignmentProps, Button, ButtonStates, ButtonTypes, LinkTypes } from "@cox/core-ui8";
import { FUTURE_PAYMENT_STATEMENT_SELECTOR_PROTOTYPE, MY_BILL_HOME_PAGE, OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE } from "../../hooks/constants";
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";
import { setUDOVariables } from "../../hooks/utils";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import { FUTURE_PAYMENT_BACKBUTTON_DONE } from "../../hooks/constants";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import { redirectToPage } from "../../utils/helper-utlities";

export const enum Cookie {
  CBATCC = "_cbatcc",
}

export class CookieDomain {
  coxdotcom = 'cox.com'
}

const FuturePayConfirmTemplate = ({ payment, onPostSubmitResponse, customerType }: any) => {

  const {
    futurePayConfirmDetails, udoVariables = {},
  } = payment;

  interface RequestParams {
    [key: string]: string | undefined;
  }

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const hasAlerts = futurePayConfirmDetails?.paymentStatus || futurePayConfirmDetails?.messages?.successMessage ||
            futurePayConfirmDetails?.messages?.errorMessage;

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [futurePayConfirmDetails?.paymentStatus, futurePayConfirmDetails?.messages?.successMessage, futurePayConfirmDetails?.messages?.errorMessage]);

  const handlePrint = () => {
    window.print();
  };

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data) => handleOnComplete(data)
  });

  const handleOnComplete = (data: any) => {
    console.log("Redirecting to ibill payment options");
    window.location.href = MY_BILL_HOME_PAGE;
  };

  const handleTryAgainAndDone = (e: any) => {
    const currentUrl = window.location.href;
    if (customerType !== 'business') {
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = FUTURE_PAYMENT_STATEMENT_SELECTOR_PROTOTYPE;
      }
      else {
        if (futurePayConfirmDetails?.paymentStatus === "success") {
          try {
            const requestParams: RequestParams = {};
            requestParams.isDone = "true";
            const host = window.location.origin;
            const url = FUTURE_PAYMENT_BACKBUTTON_DONE;
            axiosAPI({
              url: `${host}${url}`,
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": window?.RequestJson?.page?.reserved?.csrfToken
              },
              data: JSON.stringify(requestParams),
            });
          } catch (error) {
            console.error("Error:", error);
          }
        } else {
          window.location.reload();
        }
      }
    } else {
      if (futurePayConfirmDetails?.paymentStatus === "success") {
        const domain = new CookieDomain();
        if (currentUrl.includes("/ui/v8")) {
          document.cookie = `${Cookie.CBATCC}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          document.cookie = `${Cookie.CBATCC}=; path=/; domain=${domain.coxdotcom}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; secure`;
        }
       redirectToPage(payment?.navigateTo);
      } else {
        const domain = (payment?.navigateTo && payment?.navigateTo.startsWith("https://")) ? new URL(payment.navigateTo).origin : null;
        redirectToPage(`${domain}/cbma/billingsummary/choosestatement?from=futurepayment`);
      }
    }
  };

  return (
    <div className="future-confirm-container">
      {customerType === "business" && <div className={`d-flex justify-content-end`}>
        {((futurePayConfirmDetails?.paymentStatus !== "failed") && (<span>
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
      </div>}
      {futurePayConfirmDetails?.paymentStatus === 'success' &&
        <Banner
          bannerType={BannerType.DYNAMIC}
          variation={BannerVariation.SUCCESS}
          message={futurePayConfirmDetails?.messages.successMessage}
          iconPath={'/content/dam/cox/common/icons/ui_components/circle-check-lime-green.svg'}
        />}
      {futurePayConfirmDetails?.paymentStatus !== 'success' &&
        <ErrorAlert message={futurePayConfirmDetails?.messages.errorMessage} id={'future-payment-error'} />}
      {/* PAYMENT DETAILS */}
      {payment.oktaLogin && <>
        <div className="account-payment-details-container">
          <h4 className="payment-header mb-0">
            Account details
          </h4>
          <div className="details">
            <div><span>Account number:</span> {futurePayConfirmDetails?.accountDetails?.accountNumber}</div>
            <div><span>Service Address:</span> {futurePayConfirmDetails?.accountDetails?.serviceAddress}</div>
          </div>
        </div>
        <div className="account-payment-details-container">
          <h3 className="payment-header">
            Payment method
          </h3>
          <CardMop
            automationId={futurePayConfirmDetails?.paymentMethod?.methodData?.type === "bank" ? "review-bank-account-number" : "review-card-number"}
            type={futurePayConfirmDetails?.paymentMethod?.methodData?.type}
            paymentProviderId={futurePayConfirmDetails?.paymentMethod?.methodData?.paymentProviderId}
            mopDetails={futurePayConfirmDetails?.paymentMethod?.methodData?.cardNumber} />
        </div>
        <div className="account-payment-details-container">
          <h4 className="payment-header">
            Billing
          </h4>
          <div className="details">
            <div>{futurePayConfirmDetails?.paymentStatus === "failed" ? 'Attempted payment amount:' : 'Payment amount:'} <strong>${futurePayConfirmDetails?.billing.paymentAmount}</strong></div>
            <div>{futurePayConfirmDetails?.paymentStatus === "failed" ? 'Attempted payment date:' : 'Payment date:'}  {new Date(futurePayConfirmDetails?.billing.paymentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</div>
          </div>
        </div>
        {futurePayConfirmDetails?.paymentStatus === "success" &&
          <div className="account-payment-details-container">
            <h4 className="payment-header">
              Payment details
            </h4>
            {futurePayConfirmDetails?.paymentDetails &&
              <div className="details">
                {customerType === "business" ? <div>Statement: {futurePayConfirmDetails?.paymentDetails?.serviceName}</div> : <div>Statement {futurePayConfirmDetails?.paymentDetails?.statementCode}: {futurePayConfirmDetails?.paymentDetails?.serviceName} </div>}
                <div>Total: ${futurePayConfirmDetails?.paymentDetails?.totalAmount}</div>
                <div>Confirmation: {futurePayConfirmDetails?.paymentDetails?.confirmation}</div>
              </div>
            }
          </div>}

        <div>
          <Button
            openInNewTab={false}
            alignment={AlignmentProps.CENTER}
            text={futurePayConfirmDetails?.paymentStatus !== "success" ? "Try Again" : "Done"}
            size=""
            buttonStates={ButtonStates.ACTIVE}
            buttonTypes={ButtonTypes.PRIMARY}
            customClickEvent={handleTryAgainAndDone}
            data-automation-id="future-pay-confirm-submit-button"
          />
        </div>
      </>
      }
    </div>
  );
};
export default FuturePayConfirmTemplate;
