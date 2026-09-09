import { AlignmentProps, Button, ButtonStates, ButtonTypes } from "@cox/core-ui8";
import ErrorAlert from "../components/Alerts/ErrorAlert";

const CbCoreSessionTimeout = ({ sections }: any) => {
    const { paymentError = {}, navigateTo = "" } = sections;

    return (
        <div id="container" className="container" tabIndex={-1}>
            <div className="col-12 col-lg-8 col-xl-8 mx-auto">
                <div className="card-theme-white mt-4 mb-4">
                    <div className="page-container">
                        <h3 className="error-payment-header" data-automation-id="new-payment-method-header">{paymentError.title}</h3>
                        <ErrorAlert message={paymentError.errorMessage} id="payment-error" />
                        <div className="pull-right text-right py-3 payment-submit-btn">
                            <Button
                                alignment={AlignmentProps.CENTER}
                                text="Continue"
                                size=""
                                buttonStates={ButtonStates.ACTIVE}
                                buttonTypes={ButtonTypes.PRIMARY}
                                customClickEvent={() => window.location.href = navigateTo}
                                data-auomation-id="core-session-timeout-continue-button"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CbCoreSessionTimeout;
