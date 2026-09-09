import chevronLeft from '../../assets/icons/chevron-left.svg'
import Button, { ButtonTypes } from '@cox/core-ui8/dist/Button'
import Toggle, { ToggleLabelDisplay, ToggleValue } from '@cox/core-ui8/dist/Toggle'
import { Badge, Modal, ModalTypes, RichText } from '@cox/core-ui8'
import { Spinner } from '@cox/core-ui8/dist/Spinner'
import { useState } from 'react'
import { Statement } from '../../pages/OktaEasyPay'
import Banner, { BannerType, BannerVariation } from '@cox/core-ui8/dist/Banner'
import { OKTA_EASYPAY_CANCEL_EASYPAY_SUCCESS_PROTOTYPE, OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE, OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE, OKTA_EASYPAY_GET_MOP_DATA_URL, OKTA_EASYPAY_CANCEL_PUT_URL, OKTA_EASYPAY_GET_CANCEL_EASYPAY_DATA_URL } from '../../hooks/constants'
import { useAxios } from '@cox/core-ui8/dist/useAxios'

interface RequestParams {
    selectedStatement: Statement[];
    pageName: string;
}

const OktaEasyPayManageTemplate = (props: any) => {
    const { statementCode, name, paymentMethod, enrolled, expired, wireless } = props.payment.statements[0];

    const [enroled, setEnrolled] = useState(enrolled)
    const [showModal, setShowModal] = useState(false)
    const [toggleKey, setToggleKey] = useState(0)
    const [failCancelEasyPay, setFailCancelEasyPay] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [cancelEasyPayWarningMessage, setCancelEasyPayWarningMessage] = useState("");

    const { axiosAPI } = useAxios({
        autoFetch: false, // autoFetch will make a call on laod
        onCompleted: (data: any) => {
            handleOnComplete(data);
        },
        onError: (error) => {
            console.log("onAjaxError", error);
        }
    });

    const { axiosAPI: axiosAPIForCancelEasyPay } = useAxios({
        autoFetch: false, // autoFetch will make a call on laod
        onCompleted: (data: any) => {
            handleCancelEasyPay(data);
        },
        onError: (error) => {
            console.log("onAjaxError", error);
        }
    });

    const { axiosAPI: axiosAPIGetCancelEasyPayData } = useAxios({
        autoFetch: false, // autoFetch will make a call on laod
        onCompleted: (data: any) => {
            setCancelEasyPayWarningMessage(data.warningMessage);
            setLoading(false);
        },
        onError: (error) => {
            console.log("onAjaxError", error);
            setLoading(false);
        }
    });

    const handleEasyPayStatus = (e: any) => {
        const checked = e.target.checked
        if (!checked) {
            getCancelEasyPayData(statementCode);

            setShowModal(true)
            setEnrolled(true)
            setToggleKey(prev => prev + 1)

        } else {
            setEnrolled(true)
        }
    }

    const getCancelEasyPayData = async (statementCode: number) => {
        const currentUrl = window.location.href;
        const host = window.location.origin;

        setLoading(true);

        if (!currentUrl.includes("/ui/v8")) {
            await axiosAPIGetCancelEasyPayData({
                method: "GET",
                url: `${host}${OKTA_EASYPAY_GET_CANCEL_EASYPAY_DATA_URL}?statementCode=${statementCode}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        } else {
            setCancelEasyPayWarningMessage("This will cancel any scheduled payments.");
            setLoading(false);
        }
    }

    // To be removed when actual API is integrated
    const fakeApiCallToDisableEasyPay = (statementCode: string) => {
        console.log('Calling API to disable EasyPay for', statementCode);

        return new Promise<{ success: boolean }>((resolve) => {
            setTimeout(() => {
                // Simulate random success/failure
                const ok = Math.random() > 0.5; // 50% chance success
                resolve({ success: ok });
            }, 2000);
        });
    };

    const handleConfirmYes = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            setLoading(true);
            const currentUrl = window.location.href;
            const host = window.location.origin;
            const requestParams: any = {
                statementCode: ''
            }

            requestParams.statementCode = statementCode;

            if (currentUrl.includes("/ui/v8")) {
                const res: any = await fakeApiCallToDisableEasyPay(statementCode);

                // If API is success
                if (res.success) {
                    setLoading(false);
                    setShowModal(false);
                    setEnrolled(false);
                    setToggleKey(prev => prev + 1);
                    window.location.href = OKTA_EASYPAY_CANCEL_EASYPAY_SUCCESS_PROTOTYPE; // Testing purpose to show protoversion with success banner

                } else {
                    // API failed → keep ON and show error
                    setLoading(false);
                    setFailCancelEasyPay(true);
                    setErrorMessage('Cancel EasyPay failed');
                    setEnrolled(true);
                    setToggleKey(prev => prev + 1);
                }
            } else {
                await axiosAPIForCancelEasyPay({
                    method: "POST",
                    url: `${host}${OKTA_EASYPAY_CANCEL_PUT_URL}`,
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(requestParams)
                });
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleConfirmNo = () => {
        setShowModal(false)
        setEnrolled(true)
        setFailCancelEasyPay(false)
        setToggleKey(prev => prev + 1)
    }
    const modalDescription = 'Are you sure you would like to turn off EasyPay automatic payments for the statement below?'

    const handleChangePaymentMethod = async () => {
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

            const selectedStatements = props.payment.statements.map((statement: Statement) => ({ statementCode: statement.statementCode }))
            requestParams.selectedStatement = selectedStatements;
            requestParams.pageName = 'manage-statement';
            try {
                const host = window.location.origin;
                await axiosAPI({
                    url: `${host}${OKTA_EASYPAY_GET_MOP_DATA_URL}`,
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

    const handleBreadcrumbNavigation = () => {
        const currentUrl = window.location.href;
        if (currentUrl.includes("/ui/v8")) {
            window.location.href = OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE;
        } else {
            // update it later with "back" functionality
            window.location.reload();
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setFailCancelEasyPay(false)
    }

    const handleOnComplete = (data: any) => {
        setIsSubmitting(false);
        if (data) {
            props.setPaymentData(data);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const handleCancelEasyPay = (data: any) => {
        if (data?.successMessages?.length > 0) {
            window.location.reload();
        }
        if (data?.pageName !== "error" && data?.errorMessages?.length > 0) {
            setLoading(false);
            setFailCancelEasyPay(true);
            setErrorMessage(data?.errorMessages[0]);
        }
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
            <div className="manage-template-container" data-automation-id='manage-statement-template'>
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
                    {'Manage EasyPay automatic payments'}
                </div>
                <div className="statements-list">
                    <div className="statement">
                        <div className="statement-details">
                            <span className="statement-code-details">{`Statement ${statementCode}: ${name}`}</span>
                            <span className="payment-details">EasyPay automatic payments</span>
                        </div>
                        {!wireless &&
                            <Toggle
                                key={toggleKey}
                                id='statement-toggle'
                                name='enrollmentStatus'
                                label={enroled ? ToggleValue.selected : ToggleValue.default}
                                labelDisplay={ToggleLabelDisplay.left}
                                selected={enroled}
                                value={enroled ? ToggleValue.selected : ToggleValue.default}
                                onChange={handleEasyPayStatus}
                            />
                        }
                    </div>
                    <div className="statement">
                        <div className="statement-details">
                            <span className="statement-code-details">{'Payment method'}</span>
                            <span className="payment-details">{paymentMethod} {expired && <Badge id='mop-expired-badge' text='Expired' />}</span>
                        </div>
                        <Button
                            text='Change'
                            customClickEvent={handleChangePaymentMethod}
                            buttonTypes={ButtonTypes.SECONDARY}
                        />
                    </div>
                </div>
                {showModal &&
                    <Modal
                        modalId='cancel-easy-pay'
                        show={showModal}
                        componentName='cancel-easy-pay'
                        handleClose={handleCloseModal}
                        responsive={true}
                        backdrop={'static'}
                        modalType={ModalTypes.custom}
                        //modal-header props
                        title='Cancel EasyPay'
                        //modal-footer props
                        secondaryBtnText={failCancelEasyPay ? '' : 'Stay enrolled'}
                        secondaryBtnClick={handleConfirmNo}
                        primaryBtnText={failCancelEasyPay ? 'Close' : 'Confirm'}
                        primaryBtnClick={failCancelEasyPay ? handleCloseModal : handleConfirmYes}
                    >
                        {loading ? <div className='modal-content-container'>
                            <Spinner
                                size={'xl'}
                                style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                            />
                        </div> : <div className='modal-content-container' data-automation-id='cancel-easypay-modal'>
                            {failCancelEasyPay ?
                                <Banner
                                    bannerType={BannerType.DYNAMIC}
                                    variation={BannerVariation.ERROR}
                                    message={errorMessage}
                                    iconPath={'/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg'}
                                /> : <>
                                    <RichText text={modalDescription} isParsed={true} className='cox-text-title1-medium' />
                                    <Banner
                                        bannerType={BannerType.DYNAMIC}
                                        variation={BannerVariation.WARNING}
                                        message={cancelEasyPayWarningMessage}
                                        iconPath={'/content/dam/cox/common/icons/ui_components/circle-exclamation-pure-orange.svg'}
                                    />
                                    <div className='config-card'>{`Statement ${statementCode}: ${name}`}</div>
                                </>}
                        </div>}
                    </Modal>
                }
            </div>
        </>
    )
}
export default OktaEasyPayManageTemplate