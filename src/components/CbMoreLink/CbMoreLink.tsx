import { OverlayTrigger, Popover } from "react-bootstrap";
import { useAxios } from "@cox/core-ui8";
import { OKTA_CB_MORE_MENU_URL } from "../../hooks/constants";
import { useEffect, useState } from "react";
import homeIcon from "../../assets/business/images/tab_home.svg";
import internetIcon from "../../assets/business/images/home_Internet.svg";
import billingIcon from "../../assets/business/images/payment-method.svg";
import supportIcon from "../../assets/business/images/chat.svg";
import mangerUserIcon from "../../assets/business/images/manage-users.svg";
import arrowBack from "../../assets/business/images/arrow-right-black.svg";
import voiceIcon from "../../assets/business/images/services_phone.svg";
import tvIcon from "../../assets/business/images/tv.svg";
import networkingIcon from "../../assets/business/images/networking.svg";
import securityIcon from "../../assets/business/images/security.svg";
import appsIcon from "../../assets/business/images/messaging-center.svg";

interface CbMoreLinkProps {
    sections?: any;
}

const CbMoreLink: React.FC<CbMoreLinkProps> = ({ sections }) => {
    const { payment = {} } = sections;
    const [featureList, setFeatureList] = useState<any>([]);
    const isMobileDevice = window.innerWidth <= 767;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Click event handler to close the sidebar and overlay on mobile devices.
     */
    const handleClick = (event: any) => {
        if (isMobileDevice && !document.getElementById('sidebar')?.contains(event.target) &&
            !document.getElementById('morelinkmobile')?.contains(event.target)) {
            document.getElementById('wrapperMobile')?.classList.remove('show');
            document.getElementsByClassName('overlay-more')[0]?.classList.add('hide');
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        }
    }, []);

    /**
     * This hook makes an API call to get the More Menu details.
     */
    const { axiosAPI: axiosAPIToGetMoreMenu } = useAxios({
        autoFetch: false, // autoFetch will make a call on load
        onCompleted: (data: any) => {
            setFeatureList(data);
            const featureIconMap: any = {
                "Home": homeIcon,
                "Internet": internetIcon,
                "Billing": billingIcon,
                "Support": supportIcon,
                "Users And Accounts": mangerUserIcon,
                "Users, Accounts and Call Settings": mangerUserIcon,
                "Users, Accounts and Phone Numbers": mangerUserIcon,
                "Voice": voiceIcon,
                "Networking": networkingIcon,
                "TV": tvIcon,
                "Security": securityIcon,
                "Apps": appsIcon
            };
            data?.featureDescription.forEach((featureName: any, index: any) => {
                featureName.iconName = featureIconMap[featureName?.featureName] || null;
            });
            setShowMobileMenu(isMobileDevice ? true : false);
            if (isMobileDevice) {
                const wrapperMobile = document.getElementById('wrapperMobile');
                if (wrapperMobile) {
                    wrapperMobile.classList.add('show');
                }
                document.getElementsByClassName('overlay-more')[0].classList.remove('hide');
            }
        },
        onError: (error) => {
            console.log("onAjaxErrorInGetRemoveModalMop", error);
        },
    });

    /**
     * Handle the click event on the link.
     */
    function onLinkClick(link: any) {
        const featureNameLink = link.featureName.replace(/\s+/g, '');
        if (featureNameLink === 'Support') {
            window.open(link.url, link.target);
        } else {
            window.location.replace(link.url);
        }
    }

    /**
     * Generate the popover for the more menu.
     */
    const popover = (
        <Popover id="popover-basic">
            <Popover.Body>
                <div className="quick-links-more-section">
                    <div className=" col-md-12 col-sm-12 col-xs-12">
                        <div className=" quick-link-ul">
                            <ul className="ul-style mb-0 p-0 cards-grid">
                                {featureList?.featureDescription && featureList?.featureDescription.map((featureName: any, index: any) => (
                                    <li key={index}>
                                        <div className={`${featureList?.featureDescription.length % 2 !== 0 ? 'col-md-12 col-sm-12 col-xs-12 pl-1 pr-1' : 'more-container col-md-6 col-sm-6 col-xs-6 pl-0'}`}>
                                            <a href="javascript:void(0)" aria-label={featureName.featureName} tabIndex={0} onClick={() => onLinkClick(featureName)}>
                                                <span id="{{featureName.featureName}}" className={`${featureList?.featureDescription.length % 2 !== 0 ? 'more-tile-home' : 'more-tile width-230'}`}>
                                                    <img alt="{{featureName.featureName}}" src={featureName.iconName} role="presentation"
                                                        className="img-desc" />
                                                    <figcaption>{featureName.featureName}</figcaption>
                                                </span>
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Popover.Body>
        </Popover>
    )

    /**
     * Fetches the more menu from the server.
     */
    async function fetchMoreMenu() {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
        try {
            const host = window.location.origin;
            await axiosAPIToGetMoreMenu({
                url: `${host}${OKTA_CB_MORE_MENU_URL}`,
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

    /**
     * Render the MoreMenuIcon
     */
    const MoreMenuIcon = (
        <><svg width="32px" height="32px" viewBox="0 0 18 4" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <title aria-hidden="true">More Icon</title>
            <defs>
                <path
                    d="M9,4 C7.8954305,4 7,3.1045695 7,2 C7,0.8954305 7.8954305,0 9,0 C10.1045695,0 11,0.8954305 11,2 C11,3.1045695 10.1045695,4 9,4 Z M2,4 C0.8954305,4 0,3.1045695 0,2 C0,0.8954305 0.8954305,0 2,0 C3.1045695,0 4,0.8954305 4,2 C4,3.1045695 3.1045695,4 2,4 Z M16,4 C14.8954305,4 14,3.1045695 14,2 C14,0.8954305 14.8954305,0 16,0 C17.1045695,0 18,0.8954305 18,2 C18,3.1045695 17.1045695,4 16,4 Z"
                    id="path-1"></path>
                <linearGradient x1="22.892761%" y1="16.8467829%" x2="81.7701602%" y2="82.0326194%" id="linearGradient-3">
                    <stop stop-color="#00AAF4" offset="0%"></stop>
                    <stop stop-color="#022F87" offset="100%"></stop>
                </linearGradient>
            </defs>
            <g id="Page-1-moreIcon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="My-Account-Landing-Page-moreIcon" transform="translate(-183.000000, -499.000000)">
                    <g id="more" transform="translate(180.000000, 489.000000)">
                        <g id="Colors/202020" transform="translate(3.000000, 10.000000)">
                            <mask id="mask-2" fill="white">
                                <use xlinkHref="#path-1"></use>
                            </mask>
                            <use id="Mask-moreIcon" fill="#000000" xlinkHref="#path-1"></use>
                            <g mask="url(#mask-2)" fill="url(#linearGradient-3)" id="Rectangle-4-Copy">
                                <g transform="translate(-3.000000, -10.000000)">
                                    <rect x="0" y="0" width="24" height="24"></rect>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg><figcaption aria-hidden="true" className="pl-0 mt-n2 menu-link">Menu</figcaption></>
    )

    /**
     * Close the sidebar on click of close button
     */
    function closeSideBar() {
        const wrapperMobile = document.getElementById('wrapperMobile');
        if (wrapperMobile) {
            wrapperMobile.classList.remove('show');
        }
        document.getElementsByClassName('overlay-more')[0].classList.add('hide');
    }

    return (
        !isMobileDevice ? (
            <OverlayTrigger
                trigger={['click']}
                placement={"bottom"}
                rootClose
                overlay={popover}
                onExited={() => setIsOpen(false)}
            >
                <div className="moreLink mt-n1" tabIndex={0} onClick={fetchMoreMenu} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        fetchMoreMenu();
                    }
                }}>
                    {MoreMenuIcon}
                </div>
            </OverlayTrigger>
        ) : (
            <><div className="moreLink mt-n1" onClick={fetchMoreMenu}>
                {MoreMenuIcon}
            </div>

                <div className="wrapper" id="wrapperMobile">
                    {showMobileMenu && (
                        <><nav id="sidebar">
                            <a href="javascript:void(0)" title="Close" role="button" className="cb-modal-close-btn float-right mr-2" onClick={closeSideBar}></a>
                            <ul className="mt-4 pt-3 ul-style pl-0">
                                {featureList?.featureDescription.map((featureName: any, index: any) => (
                                    <li key={index} className="onFocusOutline" onClick={() => onLinkClick(featureName)} tabIndex={0}>
                                        <div className={`d-flex div-center-align`}>
                                            <img src={featureName.iconName} width={24} height={24} alt={featureName.featureName} className="ml-3 mr-3 mb-2 mt-2" role="presentation" />
                                            <span className={`text-bold-600`}>
                                                {featureName.featureName.includes('Users') ? 'Manage' : featureName.featureName}
                                            </span>
                                            <img src={arrowBack} width={24} height={24} alt="Next Icon" role="presentation" className="float-right" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </nav></>
                    )}
                    <div className="overlay-more hide"></div>
                </div>

            </>
        )
    )
};

export default CbMoreLink;
