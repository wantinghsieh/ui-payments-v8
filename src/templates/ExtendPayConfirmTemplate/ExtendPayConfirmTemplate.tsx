import { useEffect } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
} from "@cox/core-ui8";
import {
  EXTEND_PAYMENT_DONE_URL,
  EXTEND_PAYMENT_STATEMENT_PROTOTYPE,
  MY_BILL_HOME_PAGE,
} from "../../hooks/constants";
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";
import { setUDOVariables } from "../../hooks/utils";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import { useAxios } from "@cox/core-ui8/dist/useAxios";

interface RequestParams {
  [key: string]: string | undefined;
}

const ExtendPayConfirmTemplate = ({ payment }: any) => {
  const { paymentConfirmDetails, udoVariables = {} } = payment;

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
  }, []);

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on load
    onCompleted: (data) => handleOnComplete(data),
    onError: (error) => {
      console.error("onAjaxError", error);
    },
  });

  const handleOnComplete = (data: any) => {
    if (data) {
      window.location.href = MY_BILL_HOME_PAGE;
    }
  };

  const handleTryAgainAndDone = () => {
    const currentUrl = window.location.href;
    if (paymentConfirmDetails?.paymentStatus !== "success") {
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = EXTEND_PAYMENT_STATEMENT_PROTOTYPE;
      } else {
        window.location.reload();
      }
    } else {
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = MY_BILL_HOME_PAGE;
      } else {
        try {
          const requestParams: RequestParams = {};
          requestParams.isDone = "true";
          const host = window.location.origin;
          const url = EXTEND_PAYMENT_DONE_URL;
          axiosAPI({
            url: `${host}${url}`,
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
    }
  };

  return (
    <div className="future-confirm-container">
      {paymentConfirmDetails?.paymentStatus === "success" && (
        <Banner
          bannerType={BannerType.DYNAMIC}
          variation={BannerVariation.SUCCESS}
          message={paymentConfirmDetails?.messages.successMessage}
          iconPath={
            "/content/dam/cox/common/icons/ui_components/circle-check-lime-green.svg"
          }
        />
      )}
      {paymentConfirmDetails?.paymentStatus !== "success" && (
        <ErrorAlert
          message={paymentConfirmDetails?.messages.errorMessage}
          id={"future-payment-error"}
        />
      )}
      {/* PAYMENT DETAILS */}
      {payment.oktaLogin && (
        <>
          <div className="account-payment-details-container">
            <h4 className="payment-header mb-0">Account details</h4>
            <div className="details">
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
          <div className="account-payment-details-container">
            <h4 className="payment-header">Payment extension date</h4>
            <div className="details">
              <div>
                {new Date(
                  paymentConfirmDetails?.paymentExtensionDate.paymentDate,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
          {paymentConfirmDetails?.paymentStatus === "success" && (
            <div className="account-payment-details-container">
              <h4 className="payment-header">Minimum amount due</h4>
              {paymentConfirmDetails?.paymentDetails && (
                <div className="details">
                  <div>
                    ${paymentConfirmDetails?.paymentDetails?.totalAmount}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <Button
              openInNewTab={false}
              alignment={AlignmentProps.CENTER}
              text={
                paymentConfirmDetails?.paymentStatus !== "success"
                  ? "Try Again"
                  : "Done"
              }
              size=""
              buttonStates={ButtonStates.ACTIVE}
              buttonTypes={ButtonTypes.PRIMARY}
              customClickEvent={handleTryAgainAndDone}
              data-automation-id="extend-pay-confirm-submit-button"
            />
          </div>
        </>
      )}
    </div>
  );
};
export default ExtendPayConfirmTemplate;
