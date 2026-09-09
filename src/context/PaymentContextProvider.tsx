import React, { useState } from "react";
import PaymentContext from "./PaymentContext";

const PaymentContextProvider = (props: any) => {
    const [paymentData, setPaymentData] = useState({});
    return (
        <PaymentContext.Provider value={{ paymentData, setPaymentData }}>
            {props.children}
        </PaymentContext.Provider>
    );
}

export default PaymentContextProvider;
