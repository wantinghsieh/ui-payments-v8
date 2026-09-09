import { useEffect, useState } from "react";
import SetupTemplate from "../templates/SetupTemplate";
import StepIndicator from "../components/widgets/stepindicator/stepindicator";
import ConfirmTemplate from "../templates/ConfirmTemplate";
import ReviewTemplate from "../templates/ReviewTemplate";
import AccountSnapshot from "../components/AccountSnapshot";

const Makepayment = ({ sections = {} }: any) => {
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

  return (
    <div id="container" className="container-fluid" tabIndex={-1}>
      <div className="mybill-container">
        <div className="row justify-content-center">
          {/* <!-- mini account snapshot --> */}
          {paymentData.oktaLogin && <AccountSnapshot payment={paymentData} />}
          <div className="col-md-2"></div>
          <div className="payment-container payment-radio-buttons chat-payment col-md-8">

            <StepIndicator
              headerText={paymentData.headerText ? paymentData.headerText : ""}
              firstStep={{
                title: "Set up",
                default: !!paymentData.paymentSetupDetails,
              }}
              secondStep={{
                title: "Review",
                default: !!paymentData.paymentReviewDetails,
              }}
              thirdStep={{
                title: "Confirm",
                default: !!paymentData.paymentConfirmDetails,
              }}
            />

            <>
              {
                !!paymentData.paymentSetupDetails &&
                <SetupTemplate
                  payment={paymentData}
                  onPostSubmitResponse={doShowReviewCallback}
                />
              }

              {
                !!paymentData.paymentReviewDetails &&
                <ReviewTemplate
                  payment={paymentData}
                  onPostSubmitResponse={doShowConfirmCallback}
                />
              }

              {
                !!paymentData.paymentConfirmDetails &&
                <ConfirmTemplate payment={paymentData} />
              }
            </>

          </div>
          <div className="col-md-2"></div>
        </div>
      </div>
    </div>
  );

};

export default Makepayment;
