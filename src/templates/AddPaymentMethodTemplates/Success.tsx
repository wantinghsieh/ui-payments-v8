import React from 'react'
import SuccessAlert from '../../components/Alerts/SuccessAlert';
import WarningAlert from '../../components/Alerts/WarningAlert';
import CardMop from '../../components/CardMop/CardMop';

const Success = ({ payment }: any = {}) => {
    const { savedMop = [] } = payment;
    const paymentMethodDetails = savedMop[0];
    const successMessage = payment?.messages?.successMessages?.[0];
    const warningMessage = payment?.messages?.warningMessages?.[0];

    return (
        <div id="add-payment-method-success-container">
            <SuccessAlert message={successMessage} id="add-payment-method" />
            {warningMessage && (
                <WarningAlert message={warningMessage} id="add-payment-method" />
            )}
            <div className='saved-mop'>
                <CardMop
                    mopDetails={paymentMethodDetails?.name}
                    type={paymentMethodDetails?.type}
                    classType={paymentMethodDetails?.classType}
                    paymentProviderId={paymentMethodDetails?.paymentProviderId}
                    automationId={paymentMethodDetails?.type === "bank" ? "success-bank-account-number" : "success-card-number"}
                />
            </div>
        </div>
    )
}

export default Success