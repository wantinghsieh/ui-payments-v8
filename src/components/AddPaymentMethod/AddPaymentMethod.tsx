import { useEffect, useState } from "react";
import {
    FormContainer,
    FormFieldsAlign,
    FormInputTypes,
    FormOptionsTypes,
    FormStatusPosition,
    useAxios
} from "@cox/core-ui8";
import TrustlyWidget from "../TrustlyWidget";
import TrustlyErrorWidget from "../TrsutlyErrorWidget";
import ErrorAlert from "../Alerts/ErrorAlert";
import Tab from "../Tab";
import SavedMop from "./SavedMop";
import FormItems from "./FormItems";
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";

interface FormData {
    nameOnCC: string;
    cardNumber: string;
    encCardNumber: string;
    cardType: string;
    cvvNumber: string;
    encCvvNumber: string;
    country: string;
    countryZip: string;
    ccMonth: string;
    ccYear: string;
    setDefault: boolean;
    cardExpiration: string;
    integrityCheck: string;
}

const initialFormData: FormData = {
    nameOnCC: "",
    cardNumber: "",
    encCardNumber: "",
    cardType: "",
    country: "US",
    cvvNumber: "",
    encCvvNumber: "",
    countryZip: "",
    ccMonth: "",
    ccYear: "",
    setDefault: false,
    cardExpiration: "",
    integrityCheck: ""
};

interface RequestParams {
    [key: string]: string | undefined | boolean;
}

interface FormErrors {
    [key: string]: string | undefined;
}

interface AddPaymentMethodProps {
    id?: string;
    payment: any;
    showExistingPaymentMethodsTab?: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    showLinks?: boolean;
    paymentRestrictions?: any;
    checkclass?: any;
    setCheckclass?: any;
    formButtons: [];
    trustlyMethodUrl?: string;
    saveCardApiUrl?: string;
    flowName?: string;
    getCardDataApiUrl?: string;
    updateCardDataApiUrl?: string;
    getDeleteMopApiUrl?: string;
    postDeleteMopApiUrl?: string;
    makeDefaultApiUrl?: string;
    onResponse?: (data: any) => void;
    setSuccessMsgSetupMopRMDModal?: (msg: string) => void
    isSPMAccount?: boolean;
    customerType?: string;
    multiAccount?: boolean;
}

function AddPaymentMethod({ id, payment, showExistingPaymentMethodsTab, activeTab, setActiveTab,
    showLinks, paymentRestrictions, checkclass, setCheckclass, formButtons,
    trustlyMethodUrl, saveCardApiUrl, flowName, getCardDataApiUrl, updateCardDataApiUrl,
    getDeleteMopApiUrl, postDeleteMopApiUrl, makeDefaultApiUrl, onResponse, customerType, isSPMAccount, multiAccount }: AddPaymentMethodProps) {
    const {
        trustlyJs,
        trustlyWidgetProps,
        pciChaseEncryptKeyJs = "",
        pciChaseEncryptJs = "",
        listOfYears = [],
        savedMop = []
    } = payment;

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showErrors, setShowErrors] = useState<any>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { axiosAPI } = useAxios({
        autoFetch: false, // autoFetch will make a call on laod
        onCompleted: (data: any) => {
            if (onResponse) {
                onResponse(data);
            }
        },
        onError: (error) => {
            console.log("onAjaxError", error.message);
        }
    })

    useEffect(() => {
        const script1 = document.createElement("script");
        script1.src = pciChaseEncryptKeyJs;
        script1.async = true;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.src = pciChaseEncryptJs;
        script2.async = true;
        document.head.appendChild(script2);

        return () => {
            document.head.removeChild(script1);
            document.head.removeChild(script2);
        };
    }, []);

    useEffect(() => {
        setFormData(initialFormData);
    }, [activeTab]);

    /* Function to determine the type of card based on its number */
    const getCardType = (value: any) => {
        const visa = /^4/;  /* Visa cards start with a 4 */
        const masterCard = /^5[1-5]/;  /* MasterCard cards start with 51-55 */
        const discover = /^6(?:011|5)/;  /* Discover cards start with 6011 or 65 */
        const amex = /^3[47]/;  /* American Express cards start with 34 or 37 */

        if (visa.test(value)) {
            return "Visa";
        } else if (masterCard.test(value)) {
            return "MasterCard";
        } else if (discover.test(value)) {
            return "Discover";
        } else if (amex.test(value)) {
            return "Amex";
        } else {
            return "randomcard";
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (isSubmitting) return;

        /* If there are no errors, proceed with form submission */
        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);

            /* Encrypt the card number and CV */
            const formattedCardNumber = formData.cardNumber.replace(/[^\d-]/g, "").replace(/(?!^)\-/g, "").match(/.{1,4}/g)?.join("-") ?? "";
            const ccno = formattedCardNumber;
            const cvv = formData.cvvNumber;
            const result = window.ProtectPANandCVV(ccno, cvv, false);
            if (result !== null) {
                formData.encCardNumber = result[0]; /* Encrypted card number */
                formData.encCvvNumber = result[1];  /* Encrypted CVV */
                formData.integrityCheck = result[2];  /* Integrity check result */
            }

            /* Prepare request parameters for the API call */
            const requestParams: RequestParams = {};

            requestParams.nameOnCC = formData.nameOnCC;
            requestParams.cardNumber = formData.encCardNumber;
            requestParams.cvvNumber = formData.encCvvNumber;
            requestParams.countryZip = formData.countryZip;
            requestParams.ccMonth = formData.ccMonth;
            requestParams.ccYear = formData.ccYear;
            requestParams.cardType = getCardType(formattedCardNumber);
            requestParams.country = formData.country || "US";
            requestParams.integrityCheck = formData.integrityCheck;
            requestParams.setDefault = formData.setDefault;

            if (payment?.oktaLogin) {
                requestParams.flowName = flowName;
            }

            console.log("requestParams:", requestParams);

            const currentUrl = window.location.href;

            if (currentUrl.includes("/ui/v8")) {
                console.log("Form Submitted", formData);
                setIsSubmitting(false);
                return;
            } else {
                try {
                    const host = window.location.origin;
                    await axiosAPI({
                        url: `${host}${saveCardApiUrl}`,
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(requestParams)
                    });
                } catch (error) {
                    console.error("Error:", error);
                } finally {
                    setIsSubmitting(false);
                }
            }
        } else {
            console.log("Form validation error:", errors);
            setShowErrors(true);
            setIsSubmitting(false);
        }
    }

    return (
        <div className={`${id}-mop-container`}>
            <Tab
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showExistingPaymentMethodsTab={showExistingPaymentMethodsTab}
                paymentRestrictions={paymentRestrictions}
                isSPMAccount={isSPMAccount}
                multiAccount={multiAccount}
                savedMop={savedMop}
            />
            {activeTab === 'existingPaymentMethods' && (
                <SavedMop
                    payment={payment}
                    savedMop={savedMop}
                    checkclass={checkclass}
                    setCheckclass={setCheckclass}
                    showLinks={showLinks}
                    flowName={flowName}
                    getCardDataApiUrl={getCardDataApiUrl}
                    updateCardDataApiUrl={updateCardDataApiUrl}
                    getDeleteMopApiUrl={getDeleteMopApiUrl}
                    postDeleteMopApiUrl={postDeleteMopApiUrl}
                    makeDefaultApiUrl={makeDefaultApiUrl}
                    multiAccount={multiAccount} />
            )}
            {activeTab === 'bankAccount' && (
                <div className={`bank-account-container`}>
                    {trustlyWidgetProps && Object.keys(trustlyWidgetProps).length > 0 ? (
                        <TrustlyWidget
                            trustlyJs={trustlyJs}
                            accessId={trustlyWidgetProps.accessId}
                            merchantId={trustlyWidgetProps.merchantId}
                            paymentType={trustlyWidgetProps.paymentType}
                            merchantReference={trustlyWidgetProps.merchantReference}
                            flowTypeIndicator={trustlyWidgetProps.flowTypeIndicator}
                            customer={trustlyWidgetProps.customer}
                            requestSignature={trustlyWidgetProps.requestSignature}
                            trustlyMethodUrl={trustlyMethodUrl}
                            customerType={customerType}
                            multiAccount={multiAccount}
                        />) : (
                        <TrustlyErrorWidget />
                    )}
                </div>
            )}
            {activeTab === 'creditCard' && (
                <div className={`credit-card-container`}>
                    {payment?.messages?.errorMessages && (
                        payment.messages.errorMessages.map((errorMessage: String) => (
                            <div key={errorMessage.toString()}>
                                <ErrorAlert message={errorMessage} id={id} />
                            </div>
                        )
                        )
                    )}
                    <FormContainer
                        formButtons={formButtons}
                        errorIcon="/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg"
                        errorMessage="Please correct the items marked below to continue."
                        statusMessagePosition={FormStatusPosition.TOP}
                        onSubmit={handleSubmit}
                        formState={{
                            nameOnCC: {
                                inputType: FormInputTypes.TEXT,
                                isRequired: true,
                                value: formData.nameOnCC,
                            },
                            cardNumber: {
                                inputType: FormInputTypes.CARDNUMBER,
                                isRequired: true,
                                value: formData.cardNumber,
                            },
                            cvvNumber: {
                                inputType: FormInputTypes.TEXT,
                                isRequired: true,
                                value: formData.cvvNumber,
                            },
                            country: {
                                inputType: FormOptionsTypes.dropdown,
                                isRequired: true,
                                value: formData.country,
                            },
                            countryZip: {
                                inputType: FormInputTypes.ZIPCODE,
                                isRequired: true,
                                value: formData.countryZip,
                            },
                            ccMonth: {
                                inputType: FormOptionsTypes.dropdown,
                                isRequired: true,
                                value: formData.ccMonth,
                            },
                            ccYear: {
                                inputType: FormOptionsTypes.dropdown,
                                isRequired: true,
                                value: formData.ccYear,
                            },
                        }}
                        method="post"
                        successIcon="/content/dam/cox/common/icons/ui_components/circle-check-lime-green.svg"
                        subheading="Add credit or debit card"
                        heading=""
                        eyebrow=""
                        fieldsAlignment={FormFieldsAlign.LEFT}
                        cssClass='add-payment-form-container form'
                    >
                        {
                            /* Show client side alert message */
                            showErrors && (
                                <Banner
                                    bannerType={BannerType.DYNAMIC}
                                    variation={BannerVariation.ERROR}
                                    message={"Please correct the items marked below to continue."}
                                    iconPath='/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg'
                                    id={id + '-error'}
                                />
                            )
                        }
                        <FormItems
                            formData={formData}
                            setFormData={setFormData}
                            setErrors={setErrors}
                            setShowErrors={setShowErrors}
                            listOfYears={listOfYears}
                            oktaLogin={payment?.oktaLogin}
                            isMultiAccount={multiAccount}
                        />
                    </FormContainer>
                </div>
            )}
        </div>
    )
}

export default AddPaymentMethod;