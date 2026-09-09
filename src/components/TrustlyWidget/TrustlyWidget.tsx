import { useEffect, useState } from 'react';
import { Modal, useAxios } from '@cox/core-ui8';
import { Spinner } from '@cox/core-ui8/dist/Spinner';
import { FETCH_TRUSTLY_METHOD_APPROVAL_PROTPTYPE_URL } from '../../hooks/constants';
import { logToNewRelicPageAction } from '../../utils/helper-utlities';

interface Customer {
    externalId: string;
}
interface TrustlyWidgetProps {
    trustlyJs: string;
    accessId: string;
    merchantId: string;
    paymentType: string;
    merchantReference: string;
    flowTypeIndicator: string;
    customer: Customer;
    requestSignature: string;
    trustlyMethodUrl?: string;
    customerType?: string;
    multiAccount?: boolean;
}

const TrustlyWidget = ({ trustlyJs, accessId, merchantId, paymentType, merchantReference, flowTypeIndicator, customer, requestSignature, trustlyMethodUrl, multiAccount }: TrustlyWidgetProps) => {

    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const finalHTML = customer

    useEffect(() => {
        const script3 = document.createElement('script');
        script3.src = trustlyJs + accessId;
        script3.async = true;

        document.head.appendChild(script3);

        return () => {
            document.head.removeChild(script3);
        };
    }, []);

    useEffect(() => {
        const checkTrustly = setInterval(() => {
            if ((window as any).Trustly) {
                clearInterval(checkTrustly);

                const Trustly = (window as any).Trustly;

                const TrustlyOptions = {
                    closeButton: false,
                    dragAndDrop: true,
                    widgetContainerId: 'trustly-widget',
                };

                const data = {
                    merchantId: `${merchantId}`,
                    accessId: `${accessId}`,
                    paymentType: `${paymentType}`,
                    merchantReference: merchantReference ? `${merchantReference}` : `mr${Date.now()}`,
                    flowType: `${flowTypeIndicator}`,
                    requestSignature: `${requestSignature}`,
                    customer: customer,
                    ...(flowTypeIndicator === "WEBCB" ? { allowedPaymentProviderTypes: ["2"] } : {}),
                    cancelUrl: "#cancel",
                    returnUrl: "#success",
                };

                if (Trustly) {

                    Trustly.addPanelListener((command: string, event: any) => {
                        switch (command) {
                            case "open":
                                console.log("Lightbox will open");
                                break;

                            case "event":
                                switch (event.type) {
                                    case "load":
                                        console.log(
                                            "Lightbox page " + event.page +
                                            " finished loading for transaction " +
                                            event.transactionId
                                        );
                                        break;

                                    case "bank_selected":
                                        console.log(
                                            "Payment provider having id " + event.data +
                                            " was selected on the page " + event.page +
                                            " for transaction " + event.transactionId
                                        );
                                        break;

                                    case "back":
                                        console.log(
                                            "Back button was clicked on the lightbox page " +
                                            event.page + " for transaction " + event.transactionId
                                        );
                                        break;

                                    case "close":
                                        console.log(
                                            "Lightbox close process was initiated " +
                                            "on the lightbox page " + event.page +
                                            " with reason " + event.data +
                                            " for transaction " + event.transactionId
                                        );

                                        logToNewRelicPageAction("Trustly Widget - transactionId", "info", event.transactionId);
                                        break;

                                    case "new_location":
                                        console.log("Browser will be redirected to " + event.data);
                                        if (event.data) {
                                            const params = new URLSearchParams(event.data.substring(event.data.indexOf("?")));

                                            const queryParams = {
                                                transactionId: params.get("transactionId"),
                                                referenceId: params.get("merchantReference"),
                                            }

                                            if (event.data.includes("success") && queryParams?.transactionId && queryParams?.referenceId) {
                                                handleSaveBank(queryParams);
                                            }
                                        } else {
                                            console.log("No data to process.");
                                        }
                                        event.preventDefault();
                                        break;
                                }
                                break;

                            case "close":
                                console.log("Lightbox was closed");
                                break;
                        }
                    });

                    Trustly.selectBankWidget(data, TrustlyOptions);
                }
            }
        }, 100);

        return () => {
            clearInterval(checkTrustly);
        };
    }, [accessId, merchantId, paymentType, merchantReference]);

    const { axiosAPI } = useAxios({
        autoFetch: false, // autoFetch will make a call on laod
        onCompleted: (data: any) => {
            handleOnComplete(data);
        },
        onError: (error) => {
            console.log("onAjaxError", error.message);
        }
    })

    const handleSaveBank = async (queryParams: any) => {
        /* if prototype url take data from static file else make a rest call */
        let url;
        if (window.location.href.includes("/ui/v8")) {
            /* Use the prototype URL if in the prototype environment */
            url = FETCH_TRUSTLY_METHOD_APPROVAL_PROTPTYPE_URL;
        }
        else {
            url = trustlyMethodUrl;
        }

        setShowLoadingModal(true);

        try {
            const host = window.location.origin;
            const multiAccountParam = multiAccount ? '&multiAccount=true' : '';
            await axiosAPI({
                url: `${host}${url}?referenceId=${queryParams.referenceId}&transactionId=${queryParams.transactionId}${multiAccountParam}`,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
            });
        } catch (error) {
            console.error("Error:", error);
        }

    }

    const handleOnComplete = (data: any) => {
        window.location.reload();
    }

    return (
        <>
            <Modal
                title="Connecting your bank account"
                description=""
                isParsed={false}
                show={showLoadingModal}
                showFooter={false}
                modalId='trustly-loading-modal'
            >
                <div className='trustly-loading-text'>
                    <h2>We are connecting your bank account.</h2>
                    <h2>This could take up to a minute.</h2>
                    <p>Please be patient while we connect your bank account.</p>
                    <Spinner size='xl' color='gradient' />
                </div>
            </Modal>
            <div className="trustly-container">
                <h3 className='add-bank-header'>Add bank account</h3>
                <div id="trustly-widget"></div>
                <div className='disclaimer'>
                    <p className='disclaimer-text'>By continuing, you may need to disclose your financial institution
                        credentials to Trustly and allow them to access your financial account, subject to their terms
                        and privacy policy. You will enter into a separate agreement with Trustly, which may be subject
                        to change, governing Trustly’s use, handling, and storage of your information. You acknowledge
                        and agree that Trustly operates independently of Spectrum. You authorize Spectrum to receive and utilize
                        certain details from Trustly about your bank account, including your account and routing number,
                        name(s) and contact information, account balance, and fraud verification information.</p>
                </div>
            </div>
        </>
    );
}

export default TrustlyWidget