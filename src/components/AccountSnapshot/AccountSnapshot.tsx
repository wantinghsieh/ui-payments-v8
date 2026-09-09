import { useEffect, useRef, useState } from 'react';
function AccountSnapshot({ payment }: any) {
    const { populateMiniSnapshot } = payment;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentUrl = window.location.href;
    const origin = window.location.origin;

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    const handleClickOutside = (event: any) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="row back-navigation">
            <div className="col-lg-8 col-md-6 navigation-link">
                <a href={currentUrl.includes("/ui/v8")
                    ? "https://media.one.qa.cox.com/ui/mybill/tsw_7/html/MyBill-Home.html"
                    : `${origin}${populateMiniSnapshot?.billingOverview}`
                }
                >&lt; Billing overview</a>
            </div>
            <div className="col-lg-2 col-md-6 account-dropdown" ref={dropdownRef}>
                <button
                    className="row dropdown-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                    onClick={toggleDropdown}
                    tabIndex={0}
                    aria-expanded={isOpen}
                >
                    <div className="account-info">My account# {populateMiniSnapshot?.accountInfo}</div>
                </button>

                {isOpen && (
                    <div className="account-dropdown-menu dropdown-menu show">
                        <div className="dropdown-menu-content">
                            {populateMiniSnapshot?.serviceAddress?.addressLine3 ? (
                                <>
                                    <span>{populateMiniSnapshot?.serviceAddress?.addressLine2} </span><br />
                                    <span>{populateMiniSnapshot?.serviceAddress?.addressLine1} </span><br />
                                    <span>{populateMiniSnapshot?.serviceAddress?.city}, {populateMiniSnapshot?.serviceAddress?.state} {populateMiniSnapshot?.serviceAddress?.zipCode5}</span>
                                </>
                            ) : (
                                <>
                                    <span>{populateMiniSnapshot?.serviceAddress?.addressLine1} </span><br />
                                    <span>{populateMiniSnapshot?.serviceAddress?.city}, {populateMiniSnapshot?.serviceAddress?.state} {populateMiniSnapshot?.serviceAddress?.zipCode5}</span>
                                </>
                            )}
                        </div>
                        <a href={currentUrl.includes("/ui/v8")
                            ? "https://www.one.qa.cox.com/residential/move.html?campcode=account_dropdown_02202023"
                            : `${origin}${populateMiniSnapshot?.moveMyService}`}>
                            Move my service
                        </a>
                        <h5 className="mt-2 mb-0 services-header-style">My Services:</h5>
                        <a href={currentUrl.includes("/ui/v8")
                            ? "#"
                            : `${origin}${populateMiniSnapshot?.services}`}>
                            {populateMiniSnapshot?.subscribedServicesAsString}
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AccountSnapshot;
