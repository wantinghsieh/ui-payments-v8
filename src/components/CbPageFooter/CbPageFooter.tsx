import React, { useEffect, useState } from 'react';
import resourceBundle from './defaultFooter.json';
import { useAxios } from '@cox/core-ui8';
import { GET_CB_HEADER_URL } from '../../hooks/constants';
import { Overlay, Popover } from 'react-bootstrap';
import ArrowDownIcon from '../../assets/business/images/arrow-down-small-black.svg';
import ArrowUpIcon from '../../assets/business/images/arrow-up-small-black.svg';
import PhoneSolutionsICon from '../../assets/business/images/icon-phone-solutions-contact-white.png';
import SupportIcon from '../../assets/business/images/icon-support-white.png'; 

interface PopoverItem {
    linkName: string;
    linkUrl?: string;
    tab?: string;
    ringcentralUrl?: string;
}

interface CommonPopoverItem {
    id: string;
    name: string;
    displayName: string;
    openInNewWindow: boolean;
    enabled: boolean;
    url: string;
}

interface CbPageFooterProps {
    sections?: any;
    // cox.com.payments.spectrum-logo.enabled. When true, the footer transition bar uses
    // the Spectrum brand gradient (see globals.scss .defaultFooter-gradientline.spectrum),
    // matching the CB header.
    spectrumLogoEnabled?: boolean;
}

const CbPageFooter: React.FC<CbPageFooterProps> = ({ sections, spectrumLogoEnabled }) => {
    const { payment = {} } = sections;
    const [openPopover, setOpenPopover] = React.useState<string | null>(null);
    const [menuItems, setMenuItems] = React.useState<any>(null);
    const [isMobile] = useState<boolean>(window.innerWidth <= 767);
    const isMyAdmin = payment?.navigateTo?.includes('myadmin');
    const [popoverList, setPopoverList] = useState<PopoverItem[]>([]);
    const [commonPopoverList, setCommonPopoverList] = useState<CommonPopoverItem[]>([]);
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);

    const { axiosAPI: axiosAPIForCbFooter } = useAxios({
        autoFetch: false,
        onCompleted: (data: any) => {
            setMenuItems(data);
        },
        onError: (error) => {
            console.log("onAjaxError", error);
        },
    });

    useEffect(() => {
        getCbFooterOptions();
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    });

    const handleClickOutside = (event: any) => {
        if (popoverTarget && !popoverTarget.contains(event.target)) {
            setOpenPopover(null);
        }
    };

    async function getCbFooterOptions() {
        try {
            const host = window.location.origin;
            await axiosAPIForCbFooter({
                url: `${host}${GET_CB_HEADER_URL}`,
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const navigateOnClick = (
        linkUrl?: string,
        tab?: string,
        linkName?: string,
        ringcentralUrl?: string
    ) => {
        if (!linkUrl) return;
        window.open(linkUrl, tab === '_blank' ? '_blank' : '_self');
    };

    const onClickofCommonTasksUrl = (
        url: string,
        name: string,
        openInNewWindow?: boolean
    ) => {
        window.open(url, openInNewWindow ? '_blank' : '_self');
    };

    const togglePopover = (key: string, e: any) => {
        setPopoverTarget(e.currentTarget);
        const isClosing = openPopover === key;
        setOpenPopover(isClosing ? null : key);
        setPopoverList([]);
        setCommonPopoverList([]);
        if (!isClosing) {
            switch (key) {
                case 'CommonTasks': {
                    setCommonPopoverList(menuItems?.footerOptions);
                    break;
                }
                case 'Help': {
                    setPopoverList(resourceBundle?.Help);
                    break;
                }
                case 'AboutUs': {
                    setPopoverList(resourceBundle?.AboutUs);
                    break;
                }
                case 'Social': {
                    setPopoverList(resourceBundle?.Social);
                    break;
                }
                case 'Legal': {
                    setPopoverList(resourceBundle.Legal);
                    break;
                }
                case 'Companies': {
                    setPopoverList(resourceBundle.Companies);
                    break;
                }
                case 'Partners': {
                    setPopoverList(resourceBundle.Partners);
                    break;
                }
            }
        }
    }

    const renderArrow = (key: string) => (
        <img
            src={
                openPopover === key
                    ? ArrowDownIcon
                    : ArrowUpIcon
            }
            className="mb-1"
            alt={openPopover === key ? 'down arrow' : 'up arrow'}
            role="presentation"
        />
    );



    return (
        <footer id="cbDefaultFooter">
            {/* Top Footer */}
            <div className="top-footer">
                <div
                    className={`col-12 top-footer-content px-4 pt-4 ${isMobile ? 'pb-4' : ''
                        }`}
                >
                    <a href="https://www.cox.com/business/contact-us.html" className="mr-5">
                        <div className="display-flex">
                            <div className="mr-2 footer-item">
                                <img
                                    src={PhoneSolutionsICon}
                                    alt="Call support"
                                    role="presentation"
                                />
                            </div>
                            <div>
                                <div className="margin-bottom-15px">
                                    {resourceBundle?.contactCustomerService}
                                </div>
                                <span className="footer-number">{resourceBundle?.contactCustomerNumber}</span>
                            </div>
                        </div>
                    </a>

                    <a href="https://www.cox.com/business/contact-us.html" className="mr-5">
                        <div className="display-flex">
                            <div className="mr-2 footer-item">
                                <img
                                    src={SupportIcon}
                                    alt="Chat now"
                                    role="presentation"
                                />
                            </div>
                            <div>
                                <div className="margin-bottom-15px">
                                    {resourceBundle?.contactUs}
                                </div>
                                <span className="footer-number">
                                    {resourceBundle?.chatNow}
                                </span>
                            </div>
                        </div>
                    </a>

                    <a href="https://www.cox.com/business/contact-us.html">
                        <div className="display-flex">
                            <div className="mr-2 footer-item">
                                <img
                                    src={PhoneSolutionsICon}
                                    alt="Call sales"
                                    role="presentation"
                                />
                            </div>
                            <div>
                                <div className="margin-bottom-15px">
                                    {resourceBundle?.contactSales}
                                </div>
                                <span className="footer-number">{resourceBundle?.contactSalesNumber}</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>

            <div className={`defaultFooter-gradientline position-relative${spectrumLogoEnabled ? " spectrum" : ""}`} />

            {/* Bottom Footer */}
            <div
                className={`bottom-footer position-relative ${!isMyAdmin ? 'myaccount-footer' : ''
                    }`}
            >
                <div className="col-12 bottom-footer-content p-0">
                    <div className="footer-links">
                        <ul className="m-0 p-0" role="list">
                            {[
                                'CommonTasks',
                                'Help',
                                'AboutUs',
                                'Social',
                                'Legal',
                                'Companies',
                                'Partners'
                            ].map(key => (
                                <li key={key} role="listitem">
                                    <button
                                        type="button"
                                        className="footer-sublinks"
                                        aria-haspopup="menu"
                                        aria-expanded={openPopover === key}
                                        onClick={(e) => togglePopover(key, e)}
                                    >
                                        <span>
                                            {(resourceBundle as any)?.[
                                                `${key.charAt(0).toLowerCase()}${key.slice(1)}Title`
                                            ]}
                                        </span>
                                        {renderArrow(key)}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="javascript:void(0)"
                                    className="footer-sublinks"
                                    onClick={() =>
                                        navigateOnClick(
                                            resourceBundle?.privacy?.linkUrl,
                                            resourceBundle?.privacy?.tab
                                        )
                                    }
                                >
                                    {resourceBundle?.privacy?.linkName}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="copyright-details">
                        © 1998 - {resourceBundle?.currentYear} Cox Communications
                    </div>
                </div>
                <Overlay
                    show={!!openPopover}
                    target={popoverTarget}
                    placement="top"
                    container={() => document.getElementById('cbDefaultFooter')}
                    rootClose>
                    <Popover role="presentation" className="defaultFooterPopover popover fade show bs-popover-top">
                        <Popover.Body className="popover-body">
                            <ul role="menu" className="messageList ul-style p-0 mb-2">
                                {commonPopoverList?.length > 0 && popoverList?.length === 0 && (
                                    commonPopoverList?.map((item: any, index: number) => (
                                        <li key={index} role="menuitem" tabIndex={0} className="popover-list onFocusOutline" onClick={() => onClickofCommonTasksUrl(item?.url, item?.name, item?.openInNewWindow)}>
                                            <span>{item.displayName}</span>
                                        </li>
                                    ))
                                )}
                                {popoverList?.length > 0 && commonPopoverList?.length === 0 && (
                                    popoverList?.map((item: any, index: number) => (
                                        <li key={index} role="menuitem" tabIndex={0} className="popover-list onFocusOutline" onClick={() => navigateOnClick(item?.linkUrl, item?.tab, item?.linkName, item?.ringcentralUrl)}>
                                            <span>{item.linkName}</span>
                                        </li>
                                    )
                                    ))}
                            </ul>
                        </Popover.Body>
                    </Popover>
                </Overlay>
            </div>
        </footer>
    );
};

export default CbPageFooter;
