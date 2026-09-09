import React from 'react'
import NoSavedPaymentMethod from '../../assets/icons/NoSavedPaymentMethod.svg';
import Button, { ButtonStates, ButtonTypes } from '@cox/core-ui8/dist/Button';

const NoPaymentMethodSaved = () => {

    const handleBtnClick = () => {
        const currentUrl = window.location.href;
        if (currentUrl.includes("/ui/v8")) {
            window.location.href = "/ui/v8/payments/make-payment.html"
        } else {
            window.location.href = "/payments/make-payment.html"
        }
    }

  return (
    <div className='payment-setup'>
        <div className="payment-method-header-wrapper" data-testid="paymentMethod-content">
            <h4 data-testid="paymentMethod-header" data-automation-id="paymentMethod-header">
                Payment methods
            </h4>
        </div>
        <div className='no-payment-method-card'>
            <div className='no-payment-method-description'>
                <div>No payment methods have been saved. </div>
                <div>Make a payment to add a payment method. </div>
            </div>
            <div className='no-payment-method-image'>
                <img src={NoSavedPaymentMethod} alt="NoSavedPaymentMethod" className="mt-n1" />
            </div>
            <Button
                buttonStates={ButtonStates.ACTIVE}
                buttonTypes={ButtonTypes.SECONDARY}
                disabledIcon="https://test.cox.com/content/dam/cox/common/icons/ui_components/chevron-right-grey.svg"
                hoverIcon="https://test.cox.com/content/dam/cox/common/icons/ui_components/chevron-right-dark-blue.svg"
                text="Make a payment"
                customClickEvent={handleBtnClick}
            />
        </div>
    </div>
  )
}

export default NoPaymentMethodSaved