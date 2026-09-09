import chevronLeft from '../../assets/icons/chevron-left.svg'
import Button, { ButtonTypes } from '@cox/core-ui8/dist/Button'
import Banner, { BannerType, BannerVariation } from '@cox/core-ui8/dist/Banner'
import { Statement } from '../../pages/OktaEasyPay'
import { OKTA_EASYPAY_GET_ENROLLMENT_DATA_URL, OKTA_EASYPAY_MANAGE_PAGE_PROTOTYPE, OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE, OKTA_EASYPAY_STATEMENT_PAGE_PROTOTYPE } from '../../hooks/constants'
import { useAxios } from '@cox/core-ui8/dist/useAxios'
import { useState } from 'react'
import SuccessAlert from '../../components/Alerts/SuccessAlert'
import InfoAlert from '../../components/Alerts/InfoAlert'
import { Spinner } from '@cox/core-ui8/dist/Spinner'

interface RequestParams {
    [key: string]: string | undefined;
}

const OktaEasyPaySelectionTemplate = (props: any) => {
    const { payment } = props
    const { statements = [], errorMessages = [] } = props.payment
    const enrollmentUnavailable = errorMessages.length > 0;
    const getLabelForBackNavigation = payment?.navigateTo?.includes('ibill') ? 'Billing home' : 'Account overview';
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { axiosAPI } = useAxios({
        autoFetch: false, // autoFetch will make a call on laod
        onCompleted: (data: any) => {
            handleOnComplete(data);
        },
        onError: (error) => {
            console.log("onAjaxError", error);
        }
    });

    const handleManageStatement = async (statement: Statement) => {
        const currentUrl = window.location.href;
        if (isSubmitting) return;

        setIsSubmitting(true);

        if (statement.enrolled) {
            if (currentUrl.includes("/ui/v8")) {
                window.location.href = OKTA_EASYPAY_MANAGE_PAGE_PROTOTYPE;
            } else {
                const selectedStatement = [props.payment.statements.find((stat: Statement) =>
                    stat.statementCode === statement.statementCode && stat.name === statement.name
                )];
                props.setPaymentData({ ...props.payment, pageName: "manage-statement", statements: selectedStatement })
            }
        } else {
            if (currentUrl.includes("/ui/v8")) {
                if (statements.length === 1) {
                    window.location.href = OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE;
                } else {
                    window.location.href = OKTA_EASYPAY_STATEMENT_PAGE_PROTOTYPE;
                }
            } else {
                const requestParams: RequestParams = {};
                requestParams["statementCode"] = statement.statementCode;
                try {
                    const host = window.location.origin;
                    await axiosAPI({
                        url: `${host}${OKTA_EASYPAY_GET_ENROLLMENT_DATA_URL}`,
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(requestParams)
                    });
                } catch (error) {
                    console.error("Error:", error);
                }
            }
        }
    }

    const handleOnComplete = (data: any) => {
        setIsSubmitting(false);
        if (data) {
            props.setPaymentData(data);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            {isSubmitting &&
                <div className="throbber-container" data-automation-id="throbber">
                    <Spinner
                        size={'xl'}
                    />
                </div>
            }
            <div className="selection-template-container">
                <div className='link__container' data-testid='link-container'>
                    <a href={payment?.navigateTo}
                        className='link__anchor'>
                        <img src={chevronLeft} className='link__icon' alt="chevronLeft" />
                        {getLabelForBackNavigation}
                    </a>
                </div>
                <div className="easypay-header-container">
                    <div className="headline">
                        {payment?.headerText}
                    </div>
                    {!enrollmentUnavailable &&
                        <div className="sub-title">A safe, automatic, and recurrent payment program that allows you to pay your bill automatically each month.
                        </div>
                    }
                </div>
                {errorMessages.map((message: string, index: number) => (
                    <InfoAlert key={index} message={message} id="easypay-enrollment-unavailable" />
                ))}
                {props.showBanner && <div>
                    <Banner bannerType={BannerType.DYNAMIC} variation={BannerVariation.SUCCESS} message='Your scheduled payments have been cancelled and a confirmation email is on its way to your inbox.' iconPath={'/content/dam/cox/common/icons/ui_components/circle-check-lime-green.svg'} />
                </div>}
                {payment?.cancelEasyPayDetails?.successMessage &&
                    <SuccessAlert message={payment?.cancelEasyPayDetails?.successMessage} id="cancel-easypay" />
                }
                {!enrollmentUnavailable &&
                <div className="statements-list">
                    {statements?.map((statement: Statement) => {
                        const { statementCode, name, paymentMethod, enrolled } = statement
                        return (
                            <div key={statementCode} className="statement">
                                <div className="statement-details">
                                    <span className="statement-code-details">{`Statement ${statementCode}: ${name}`}</span>
                                    <span className="payment-details">EasyPay: <span className={enrolled ? 'enrolled' : 'un-enrolled'}>{`${enrolled ? 'On' : 'Off'}`}</span></span>
                                    {enrolled && <span className="payment-details">{paymentMethod}</span>}
                                </div>
                                <div className='statement-button'>
                                    <Button text={enrolled ? 'Manage' : 'Enroll'} buttonTypes={ButtonTypes.SECONDARY}
                                        customClickEvent={() => handleManageStatement(statement)}
                                    /></div>
                            </div>
                        )
                    })}
                </div>
                }
            </div>
        </>
    )
}
export default OktaEasyPaySelectionTemplate