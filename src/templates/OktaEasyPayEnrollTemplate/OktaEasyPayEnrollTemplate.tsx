import Button, { ButtonTypes } from '@cox/core-ui8/dist/Button'
import chevronLeft from '../../assets/icons/chevron-left.svg'
import { ButtonStates, FormCheckbox, FormOptionsLayout, FormOptionsTypes } from '@cox/core-ui8'
import { useState } from 'react'
import { Statement } from '../../pages/OktaEasyPay'
import { OKTA_EASYPAY_GET_MOP_DATA_URL, OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE, OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE, OKTA_FLOW_PAYMENT_BACK_URL } from '../../hooks/constants'
import { useAxios } from '@cox/core-ui8/dist/useAxios'
import { Spinner } from '@cox/core-ui8/dist/Spinner'
import InfoAlert from '../../components/Alerts/InfoAlert'

interface RequestParams {
    selectedStatement: Statement[];
    pageName: string;
}

const OktaEasyPayEnrollTemplate = (props: any) => {
    const { payment = {} } = props
    const { statements = [], errorMessages = [] } = payment
    const [statementsData, setStatementsData] = useState(statements);
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

    const { axiosAPI: axiosAPIForBack } = useAxios({
        autoFetch: false, // autoFetch will make a call on load
        onCompleted: (data: any) => {
            onAjaxResponseForBack(data);
        },
        onError: (error) => {
            console.log("onAjaxError", error);
        },
    });

    const toggleCheckbox = (statId: string) => {
        setStatementsData((prev: any) =>
            prev.map((stat: Statement) => {
                if (stat.statementCode === statId) {
                    return { ...stat, selected: !stat.selected };
                } else {
                    return stat;
                }
            })
        )

    };
    const atLeastOneSelectedStatement = statementsData?.some((statement: Statement) => statement.selected);
    const noStatementsToEnroll = statementsData === null || statementsData === undefined || statementsData.length === 0;

    const handleContinueStatementsSelection = async (event: any) => {
        event.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        const currentUrl = window.location.href;
        if (currentUrl.includes("/ui/v8")) {
            window.location.href = OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE;
            return;
        } else {
            const requestParams: RequestParams = {
                selectedStatement: [],
                pageName: ''
            };

            const selectedStatements = statementsData.
                filter((statement: Statement) => statement.selected).
                map((statement: Statement) => ({ statementCode: statement.statementCode }));

            requestParams.selectedStatement = selectedStatements;
            requestParams.pageName = 'statements-selection';

            try {
                const hostName = window.location.origin;
                await axiosAPI({
                    url: `${hostName}${OKTA_EASYPAY_GET_MOP_DATA_URL}`,
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

    const handleBreadcrumbNavigation = async () => {
        const currentUrl = window.location.href;
        if (currentUrl.includes("/ui/v8")) {
            window.location.href = OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE;
        } else {
            if (isSubmitting) return;

            setIsSubmitting(true);

            const requestParams: any = {};

            requestParams.pageName = "easyPay-statements";
            requestParams.flowName = "okta-automatic-payments";

            try {
                const hostName = window.location.origin;
                await axiosAPIForBack({
                    url: `${hostName}${OKTA_FLOW_PAYMENT_BACK_URL}`,
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

    const handleOnComplete = (data: any) => {
        setIsSubmitting(false);
        if (data) {
            props.setPaymentData(data);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const onAjaxResponseForBack = (data: any) => {
        setIsSubmitting(false);
        if (data) {
            props.setPaymentData(data);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {isSubmitting &&
                <div className="throbber-container" data-automation-id="throbber">
                    <Spinner
                        size={'xl'}
                    />
                </div>
            }
            <div className="enroll-template-container">
                <div className='link__container' data-testid='link-container'>
                    <a
                        href='/payments/automatic-payments.html'
                        onClick={(event) => {
                            event.preventDefault();
                            handleBreadcrumbNavigation();
                        }}
                        className='link__anchor'>
                        <img src={chevronLeft} className='link__icon' alt="chevronLeft" />
                        {'EasyPay'}
                    </a>
                </div>
                <div className="headline">
                    {'Set up EasyPay automatic payments'}
                </div>
                {noStatementsToEnroll ? (
                    errorMessages.map((message: string, index: number) => (
                        <InfoAlert key={index} message={message} id="easypay-enrollment-unavailable" />
                    ))
                ) : (
                <form
                    className="form wrap-errors collapse-form-validate"
                    onSubmit={handleContinueStatementsSelection}
                    data-validate-onblur="true"
                >
                    <div className="statements-list">
                        {statementsData?.length > 1 && <div className='statements-headline'>Select which statements you would like to enroll in EasyPay.</div>}
                        {statementsData.map((statement: Statement) => {
                            const { statementCode, name } = statement
                            return (
                                <div className={`statement-config-card ${statement.selected ? 'selected-card' : ''}`}>
                                    <FormCheckbox
                                        type={FormOptionsTypes.checkbox}
                                        title=''
                                        name={statementCode + name}
                                        layout={FormOptionsLayout.HORIZONTAL}
                                        id={`statement-checkbox-${statementCode}`}
                                        parameters={false}
                                        radioCheckMark='/content/dam/cox/common/icons/ui_components/white-check-mark.svg'
                                        checkboxCheckMark='/content/dam/cox/common/icons/ui_components/white-check-mark.svg'
                                        onChange={() => toggleCheckbox(statementCode)}
                                        items={[
                                            {
                                                text: 'Statement ' + statement.statementCode + ': ' + statement.name,
                                                selected: statement.selected || false,
                                                disabled: false,
                                                value: 'on'
                                            }
                                        ]}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <div className='button-continue'>
                        <Button
                            isFormSubmit={true}
                            text='Continue'
                            buttonTypes={ButtonTypes.PRIMARY}
                            buttonStates={atLeastOneSelectedStatement ? ButtonStates.ACTIVE : ButtonStates.DISABLED} />
                    </div>
                </form>
                )}
            </div>
        </>
    )
}
export default OktaEasyPayEnrollTemplate