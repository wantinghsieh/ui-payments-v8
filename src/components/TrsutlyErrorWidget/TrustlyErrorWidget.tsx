import React from 'react'
const TrustlyErrorWidget = () => {
    return (
        <div className="trustly-widget-error">
            <h5 className='trustly-error-header'>Add bank account</h5>
            <div className='text-center mt-3'>
                <div>Unable to add a bank account at this time.</div>
                <div>Please<button onClick={() => window.location.reload()} className='widget-try-again'>try again.</button></div>
            </div>
        </div>
    )
}

export default TrustlyErrorWidget;
