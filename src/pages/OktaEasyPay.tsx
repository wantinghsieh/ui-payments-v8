import { useContext, useEffect } from "react";
import OktaEasyPaySelectionTemplate from "../templates/OktaEasyPaySelectionTemplate/OktaEasyPaySelectionTemplate";
import OktaEasyPayEnrollTemplate from "../templates/OktaEasyPayEnrollTemplate/OktaEasyPayEnrollTemplate";
import OktaEasyPayManageTemplate from "../templates/OktaEasyPayManageTemplate/OktaEasyPayManageTemplate";
import EasyPaySetupTemplate from "../templates/EasyPaySetupTemplate";
import EasyPayReviewTemplate from "../templates/EasyPayReviewTemplate";
import EasyPayConfirmTemplate from "../templates/EasyPayConfirmTemplate";
import { setUDOVariables } from "../hooks/utils";
import OktaErrorTemplate from "../templates/OktaErrorTemplate";
import PaymentContext from "../context/PaymentContext";

export interface Statement {
    statementCode: string,
    name: string,
    paymentMethod?: string,
    enrolled?: boolean,
    expired?: boolean,
    selected?: boolean,
    status?: string
}

const OktaEasyPay = ({ sections, customerType, setCoxAppContentUrl }: any) => {
    const { payment = {} } = sections;

    /**  set initial paymentData from context **/
    const { paymentData, setPaymentData } = useContext<any>(PaymentContext);

    /** update the paymentData when the payment prop is updated **/
    useEffect(() => {
        setPaymentData(payment);
    }, [payment]);

    /**
     * Update the UDO variables in the window object when the paymentData.udoVars changes.
     * We use a setTimeout to ensure that the UDO variables are set after the initial
     * render, which happens before the useEffect is called. 
     **/
    useEffect(() => {
        if (paymentData?.udoVars) {
            setTimeout(function () {
                /* As there is no api call for manage-statement page, so namually setting the pageName in the UDO variables */
                if (paymentData?.pageName === "manage-statement") {
                    setUDOVariables({ ...paymentData?.udoVars, 'pageName': 'cox:res:payments:automatic-payments:manage' });
                } else {
                    setUDOVariables(paymentData?.udoVars);
                }
            }, 0);
        }
    }, [paymentData]);

    const doShowReviewCallback = (data: any) => {
        console.log("Submit POST Response is returned so show Review tab");
        setPaymentData(data);
    };

    const doShowConfirmCallback = (data: any) => {
        console.log("Submit POST Response is returned so show Confirm tab");
        setPaymentData(data);
    };

    if (paymentData?.pageName === "confirm" && paymentData?.coxAppContent?.url) {
        setCoxAppContentUrl(paymentData.coxAppContent.url);
    }

    return (
        <><div className={`page-container text-start ${customerType === "business" ? "page-layout-cb" : ""}`}>
            {paymentData?.pageName === 'easyPay-statements' && (
                <OktaEasyPaySelectionTemplate
                    payment={paymentData}
                    setPaymentData={setPaymentData}
                    showBanner={paymentData.cancelEasyPaySuccessMessage}
                />
            )}
            {paymentData?.pageName === "manage-statement" && (
                <OktaEasyPayManageTemplate
                    payment={paymentData}
                    setPaymentData={setPaymentData}
                />
            )}
            {paymentData?.pageName === "statements-selection" && (
                <OktaEasyPayEnrollTemplate
                    payment={paymentData}
                    setPaymentData={setPaymentData}
                />
            )}
            {paymentData?.pageName === "setup" && (
                <EasyPaySetupTemplate payment={paymentData} onPostSubmitResponse={doShowReviewCallback}
                    customerType={customerType} setPaymentData={setPaymentData} />
            )}
            {paymentData?.pageName === "review" && (
                <EasyPayReviewTemplate payment={paymentData} onPostSubmitResponse={doShowConfirmCallback}
                    customerType={customerType} setPaymentData={setPaymentData} />
            )}
            {paymentData?.pageName === "confirm" && (
                <EasyPayConfirmTemplate payment={paymentData} customerType={customerType} />
            )}
            {paymentData?.pageName === "error" && (
                <OktaErrorTemplate payment={paymentData} customerType={customerType} />
            )}
        </div>
        </>
    );
}

export default OktaEasyPay;
