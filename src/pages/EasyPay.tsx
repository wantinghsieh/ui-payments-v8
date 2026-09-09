import { useState } from "react";
import EasyPaySetupTemplate from "../templates/EasyPaySetupTemplate";
import EasyPayReviewTemplate from "../templates/EasyPayReviewTemplate";
import EasyPayConfirmTemplate from "../templates/EasyPayConfirmTemplate";
import AemRenderer from "@cox/core-ui8/dist/AemRenderer";

const EasyPay = ({ sections, customerType, setCoxAppContentUrl }: any) => {
  const { payment = {} } = sections;

  /**
   * This variable paymentData is used to rewrite the response received
   * from server call back to show it on Review and Confirm page respectively
   **/
  const [paymentData, setPayment] = useState(payment);

  const doShowReviewCallback = (data: any) => {
    console.log("Submit POST Response is returned so show Review tab");
    setPayment(data);
  };

  const doShowConfirmCallback = (data: any) => {
    console.log("Submit POST Response is returned so show Confirm tab");
    setPayment(data);
  };

  if (paymentData.pageName === "confirm" && paymentData?.coxAppContent?.url) {
    setCoxAppContentUrl(paymentData.coxAppContent.url);
  }

  return (
    <>
      <div id="easy-pay" className={`container text-left ${customerType === "business" ? "cox-busi" : ""}`}  tabIndex={-1}>
        <div className="col-12 col-lg-8 col-xl-9 mx-auto">
          <div className="card-theme-white mt-4 mb-4">
            <div className="page-container">
              {paymentData.pageName === "setup" && (
                <EasyPaySetupTemplate
                  payment={paymentData}
                  onPostSubmitResponse={doShowReviewCallback}
                  customerType={customerType}
                  setPaymentData={setPayment}
                />
              )}

              {paymentData.pageName === "review" && (
                <EasyPayReviewTemplate
                  payment={paymentData}
                  onPostSubmitResponse={doShowConfirmCallback}
                  customerType={customerType}
                  setPaymentData={setPayment}
                />
              )}

              {paymentData.pageName === "confirm" && (
                <EasyPayConfirmTemplate payment={paymentData}
                  customerType={customerType} />
              )}
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default EasyPay;
