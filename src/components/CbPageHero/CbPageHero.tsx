import { useAxios } from "@cox/core-ui8";
import CbMoreLink from "../CbMoreLink";
import { MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE, OKTA_FLOW_CB_PAYMENT_BACK_URL } from "../../hooks/constants";
import { useContext } from "react";
import PaymentContext from "../../context/PaymentContext";
import chevronLeft from '../../assets/icons/chevron-left.svg';
import { FUTURE_PAYMENT_CB_BACKBUTTON_URL } from "../../hooks/constants"

interface CbPageHeroProps {
    sections?: any;
}

interface RequestParams {
  [key: string]: string | undefined | boolean;
}

const CbPageHero: React.FC<CbPageHeroProps> = ({ sections }) => {
    const { payment = {} } = sections;
    const { paymentData, setPaymentData } = useContext<any>(PaymentContext);

    const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      onAjaxResponseForBack(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  const onAjaxResponseForBack = (data: any) => {
    setPaymentData(data);
  };

    async function handleBackBtnClick() {
        const isAutoPay = ["Autopay"].includes(paymentData?.headerText || payment?.headerText);
        const isFuturePayment = ["Review future payment"].includes(paymentData?.headerText || payment?.headerText);
        if (paymentData?.pageName === "review") {
            const requestParams: RequestParams = {};
            requestParams.pageName = isAutoPay ? "setup" : "setup-mop";
            requestParams.flowName = isAutoPay ? "okta-automatic-payments" : isFuturePayment ? "future-payment" : "one-time-payments";
            if (paymentData?.multiAccount || payment?.multiAccount) {
                requestParams.multiAccount = true;
            }
        const currentUrl = window.location.href;
        if (currentUrl.includes("/ui/v8") && payment?.multiAccount) {
                window.location.href = MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE;
                return;
            }

            try {
                const host = window.location.origin;
                await axiosAPIForBack({
                    url: `${host}${isFuturePayment ? FUTURE_PAYMENT_CB_BACKBUTTON_URL : OKTA_FLOW_CB_PAYMENT_BACK_URL}`,
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
        } else {
            return window.location.href = paymentData?.navigateTo;
        }
    }

    return (
        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 header-with-title-desc">
            <div className="navigation-back">
                <a href="javascript:void(0)" onClick={handleBackBtnClick} data-testid="updateprofile-navigation-back-link" data-automation-id="updateprofile-navigation-back-link">
                    <span>
                        <img src={chevronLeft} alt="chevronLeft" className="mt-n1" />
                    </span>
                    <span className="ml-2">{paymentData?.cbBackLink || payment?.cbBackLink}</span>
                </a>
                <CbMoreLink sections={sections} />
            </div>
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 p-0">
                <h1 className="pageheader-title">
                    {paymentData?.headerText || payment?.headerText}
                </h1>
                <div>
                    <div className="pageheader-description preformat-text">
                        {paymentData?.cbHeaderDescription || payment?.cbHeaderDescription}
                    </div>
                </div >
            </div >
        </div>
    )
};

export default CbPageHero;
