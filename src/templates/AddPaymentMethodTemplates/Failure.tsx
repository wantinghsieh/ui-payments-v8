import { AlignmentProps, Button, ButtonStates, ButtonTypes } from '@cox/core-ui8'
import React from 'react'
import ErrorAlert from '../../components/Alerts/ErrorAlert'

const Failure = ({ payment }: any = {}) => {
    const message = payment?.messages?.errorMessages?.[0];
    return (
        <div id="add-payment-method-failure-container">
            <div className="col-12">
                <ErrorAlert message={message} id="add-payment-method" />
            <br />
            <div className="form-group submit-button">
                <div className={`payment-submit-btn`}>
                    <Button
                        isFormSubmit={true}
                        openInNewTab={false}
                        alignment={AlignmentProps.LEFT}
                        text="Try Again"
                        size=""
                        buttonStates={ButtonStates.ACTIVE}
                        buttonTypes={ButtonTypes.PRIMARY}
                        customClickEvent={() => window.location.reload()}
                    />
                </div>
            </div>
        </div>
        </div >
    )
}

export default Failure