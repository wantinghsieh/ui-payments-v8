import { useRef } from "react";
interface TabProps {
    activeTab: string;
    setActiveTab: any;
    showExistingPaymentMethodsTab?: boolean;
    paymentRestrictions?: any;
    isSPMAccount?: boolean;
    multiAccount?: boolean;
    savedMop?: any[];
}

const Tab = ({ activeTab, setActiveTab, showExistingPaymentMethodsTab, paymentRestrictions, isSPMAccount, multiAccount, savedMop }: TabProps) => {
    const hasExistingMop = multiAccount && savedMop && savedMop.length > 0;
    const scrollRef = useRef<HTMLUListElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -150 : 150,
                behavior: "smooth",
            });
        }
    };

    return (
        <>
            <div className="tabs-container">
                <button className="scroll-btn" onClick={() => scroll("left")}>
                    {"<"}
                </button>

                <ul className="nav justify-content-left add-payment-tabs" ref={scrollRef}>
                    {showExistingPaymentMethodsTab && (
                        <li className="nav-item">
                            <button
                                className={`nav-link px-0 mr-3 ${activeTab === "existingPaymentMethods" ? "active" : ""
                                    }`}
                                onClick={() => setActiveTab("existingPaymentMethods")}
                            >
                                {multiAccount ? "Selected Payment" : "Existing payment methods"}
                            </button>
                        </li>
                    )}
                    {!paymentRestrictions?.restrictBankPayment && (
                        <li className="nav-item">
                            <button
                                className={`nav-link px-0 mr-3 ${activeTab === "bankAccount" ? "active" : ""} ${hasExistingMop ? "tab-restricted" : ""}`}
                                onClick={() => !hasExistingMop && setActiveTab("bankAccount")}
                            >
                                Add bank account
                            </button>
                        </li>
                    )}
                    {(!paymentRestrictions?.restrictCardPayment && !(isSPMAccount ?? false)) && (
                        <li className="nav-item">
                            <button
                                className={`nav-link px-0 mr-3 ${activeTab === "creditCard" ? "active" : ""} ${hasExistingMop ? "tab-restricted" : ""}`}
                                onClick={() => !hasExistingMop && setActiveTab("creditCard")}
                            >
                                Add card
                            </button>
                        </li>
                    )}
                </ul>

                <button className="scroll-btn" onClick={() => scroll("right")}>
                    {">"}
                </button>
            </div>
            <div className="line"></div>
        </>
    );
};

export default Tab;