import { useAxios } from "@cox/core-ui8";
import { GET_CB_HEADER_URL } from "../../hooks/constants";
import { useEffect } from "react";
import MegaMenu from "./MegaMenu";
import React from "react";
import Support from "./Support";
import HamburgerIcon from "../../assets/business/images/hamburger_menu.svg";
import HamburgerCloseIcon from "../../assets/business/images/hamburger_close.svg";
import ArrowBackIcon from "../../assets/business/images/double_arrow_back.svg";
import ArrowDownIcon from "../../assets/business/images/arrow_down.svg";
import ProfileIcon from "../../assets/business/images/profile.svg";
import Notifications from "./Notifications";
import ArrowNextIcon from "../../assets/business/images/arrow_next_blue.svg";
import CBLogo from "../../assets/business/images/CoxBusiness_logo.svg";
import CbSearch from "./CbSearch/CbSearch";

// Centrally-managed CB Spectrum logo (flag ON). Updated in AEM without a Payments UI release.
const AEM_CB_SPECTRUM_LOGO =
  "https://webcdn.cox.com/content/dam/cox/residential/dynamic-media/spectrum/cox-spectrum-logo-lockup/CoxSpectrum_Transition_Horizontal_FullColor.svg";

interface CbPageHeaderProps {
  sections?: any;
  // cox.com.payments.spectrum-logo.enabled, surfaced by the backend through the same
  // channel as displayCbHeader. Defaults to false (BAU Cox Business logo) when absent.
  spectrumLogoEnabled?: boolean;
}

interface RequestParams {
  [key: string]: string | undefined;
}

export enum HeaderLinks {
  ACCOUNT_DROPDOWN = "AccountDropDown",
  MENU_LINKS = "MenuLinks",
  ALERT_LINKS = "AlertLinks",
  SUPPORT_LINKS = "SupportLinks",
}

const CbPageHeader: React.FC<CbPageHeaderProps> = ({ sections, spectrumLogoEnabled }) => {
  const { payment = {} } = sections;
  const [menuItems, setMenuItems] = React.useState<any>(null);
  const isMobileDevice = window.innerWidth <= 767;
  const isPageZoomed = window.innerWidth < 300 ? true : false;
  const [hamburgerTemplate, setHamburgerTemplate] = React.useState<any>(null);
  const [hamburgerHeader, setHamburgerHeader] = React.useState<any>(null);
  const [headerActiveButton, setHeaderActiveButton] = React.useState<any>(null);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  const { axiosAPI: axiosAPIForCbHeader } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      setMenuItems(data);
      // CB: Initialize Pendo with visitor and account details from header API
      if (
        (payment as any)?.oktaLogin &&
        window["pendo"] &&
        data?.pendoDetails
      ) {
        window["pendo"]?.initialize({
          visitor: data.pendoDetails?.visitor ?? {},
          account: data.pendoDetails?.account ?? {},
        });
      }
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  useEffect(() => {
    getCbHeaderOptions();
  }, []);

  async function getCbHeaderOptions() {
    try {
      const host = window.location.origin;
      await axiosAPIForCbHeader({
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

  function goToBusinessLink() {
    window.open("https://www.two.qa.cox.com/business/home.html", "_blank");
  }

  // Shared CB header logo. Flag OFF keeps the bundled Cox Business logo (BAU).
  // Flag ON renders the AEM Spectrum logo (see .cb-spectrum-logo). Rendered
  // inside the existing clickable <a onClick={goToBusinessLink}> wrapper, so click/
  // keyboard navigation is preserved on desktop and mobile.
  const renderHeaderLogo = () => {
    if (!spectrumLogoEnabled) {
      return (
        <img
          id="header-logo"
          className="height-45 margin-top-10px margin-bottom-10"
          src={CBLogo}
          alt=""
        />
      );
    }
    return (
      <img
        id="header-logo"
        className="cb-spectrum-logo"
        src={AEM_CB_SPECTRUM_LOGO}
        alt="Cox Business is now Spectrum"
      />
    );
  };

  function closeSideBar() {
    document.getElementById("header")?.classList?.remove("show");
    document.getElementById(headerActiveButton)?.focus();
  }

  function toggleHeaderLinks(link: any): void {
    document.getElementById("header")?.classList?.add("show");
    document.getElementById("headerLinksClose")?.focus();
    setHamburgerTemplate(link);

    switch (link) {
      case HeaderLinks.ACCOUNT_DROPDOWN:
        setHamburgerHeader("");
        setHeaderActiveButton("main-menu");
        break;
      case HeaderLinks.MENU_LINKS:
        setHamburgerHeader(`Hi, ${menuItems?.firstName}!`);
        setHeaderActiveButton("hamburger-menu");
        break;
      case HeaderLinks.ALERT_LINKS:
      case HeaderLinks.SUPPORT_LINKS:
        setHamburgerHeader("Back to Main Menu");
        document.getElementById("hamburgerBackHeader")?.focus();
        break;
    }
  }

  return !isMobileDevice ? (
    <section>
      <nav className="cox-header white-bg position-relative">
        <div id="cbDefaultHeader" className="container-fluid p-0">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 p-0">
            <div className="top-header">
              <div className="margin-left-20 margin-right-20px">
                <div>
                  <span className="pr-2">
                    <a
                      href="https://www.cox.com/residential/home.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Residential
                    </a>
                  </span>{" "}
                  |<span className="pl-2 font-weight-700">Business</span>
                  <span className="pull-right">
                    <a
                      href="https://www.cox.com/business/contact-us.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contact Us
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="cbHeaderMenuContainer d-flex">
            <div className="col-lg-2 col-md-2 col-2 p-0 coxLogo">
              <a
                onClick={goToBusinessLink}
                tabIndex={0}
                className="display-inline-block"
              >
                {renderHeaderLogo()}
              </a>
            </div>
            <div className="col-md-10 col-sm-10 display-flex p-0 justify-content-flexEnd">
              <div className="display-flex justify-content-center">
                <div>{menuItems && <CbSearch />}</div>
                <div>
                  {menuItems && menuItems?.supportOptions && (
                    <Support menuItems={menuItems} />
                  )}
                </div>
                <div>
                  {menuItems && menuItems?.notificationOption && (
                    <Notifications menuItems={menuItems} />
                  )}
                </div>
                <div className="gray-border margin-top-10px mb-2"></div>
                <div
                  className={`accountAvatar mt-2 pt-0 pl-0 pr-0 ${collapsed ? "gray-bg" : ""}`}
                >
                  {menuItems && (
                    <MegaMenu
                      menuItems={menuItems}
                      onCollapseChange={setCollapsed}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={`cb-header-gradientline mt-0${spectrumLogoEnabled ? " spectrum" : ""}`}></div>
        </div>
      </nav>
    </section>
  ) : (
    <div className="cbHeaderParentMobile">
      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 p-0">
        <div className="top-header">
          <div className="margin-left-20 margin-right-20px">
            <div>
              <span className="pr-2">
                <a
                  href="https://www.cox.com/residential/home.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Residential
                </a>
              </span>{" "}
              |<span className="pl-2 font-weight-700">Business</span>
              <span className="pull-right">
                <a
                  href="https://www.cox.com/business/contact-us.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Us
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex div-center-align cbHeaderMenuContainer">
        <div className="col-4 p-0">
          <a
            role="button"
            tabIndex={0}
            onClick={() => toggleHeaderLinks(HeaderLinks.MENU_LINKS)}
            onKeyDown={(e) =>
              e.key === "Enter" && toggleHeaderLinks(HeaderLinks.MENU_LINKS)
            }
          >
            <img
              id="hamburger-menu"
              className="margin-top-10px margin-bottom-10"
              src={HamburgerIcon}
              alt="Hamburger menu Logo"
            />
          </a>
        </div>
        <div className="col-4 p-0 text-center">
          <a
            role="button"
            tabIndex={0}
            onClick={goToBusinessLink}
            onKeyDown={(e) => e.key === "Enter" && goToBusinessLink()}
          >
            {renderHeaderLogo()}
          </a>
        </div>
        <div className="col-2">{menuItems && <CbSearch />}</div>
        <div className="pull-right mr-4 ml-auto col-2">
          <a
            id="main-menu"
            role="button"
            tabIndex={0}
            onClick={() => toggleHeaderLinks(HeaderLinks.ACCOUNT_DROPDOWN)}
            className="p-0 mobile-menu"
          >
            <img
              id="header-logo"
              className="avatar mx-10"
              src={ProfileIcon}
              alt="Profile Logo"
            />
            <img src={ArrowDownIcon} alt="profile icon" role="presentation" />
          </a>
        </div>
      </div>

      <div
        className={`headerContent ${isPageZoomed ? "header-zoom-scroll" : ""}`}
        id="header"
      >
        <div
          className={`header-title ${hamburgerHeader === "Back to Main Menu" ? "" : "pl-4"}`}
          tabIndex={0}
          role="button"
        >
          <p
            className={`display-inline-block ${hamburgerHeader === "Back to Main Menu" ? "mouse-link" : ""}`}
            id="hamburgerBackHeader"
            onClick={() => toggleHeaderLinks(HeaderLinks.MENU_LINKS)}
            onKeyDown={(e) =>
              e.key === "Enter" && toggleHeaderLinks(HeaderLinks.MENU_LINKS)
            }
          >
            {hamburgerHeader === "Back to Main Menu" ? (
              <img
                src={ArrowBackIcon}
                alt="back arrow"
                role="presentation"
                className="mb-2 mouse-link"
              />
            ) : null}
            {hamburgerHeader}
          </p>
          <img
            id="headerLinksClose"
            className="header-close-img pull-right"
            src={HamburgerCloseIcon}
            role="button"
            onClick={closeSideBar}
            onKeyDown={(e) => e.key === "Enter" && closeSideBar}
            tabIndex={0}
            alt="close"
          />
        </div>

        {hamburgerTemplate === HeaderLinks.ACCOUNT_DROPDOWN && (
          <div className="col-lg-12 col-md-12 col-xs-12 mt-2 pl-0 pr-0">
            <MegaMenu menuItems={menuItems} />
          </div>
        )}
        {hamburgerTemplate === HeaderLinks.MENU_LINKS && (
          <div className="col-lg-12 col-md-12 col-xs-12 mt-3 header-links">
            <ul className="ul-style p-0">
              <li
                onClick={() => toggleHeaderLinks(HeaderLinks.SUPPORT_LINKS)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  toggleHeaderLinks(HeaderLinks.SUPPORT_LINKS)
                }
                tabIndex={0}
                role="button"
              >
                <span>Support</span>
                <img
                  src={ArrowNextIcon}
                  alt="arrow next icon"
                  height="12"
                  width="7"
                  className="pull-right mt-2 margin-left-10-px mb-1"
                  role="presentation"
                />
              </li>
              <li
                onClick={() => toggleHeaderLinks(HeaderLinks.ALERT_LINKS)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  toggleHeaderLinks(HeaderLinks.ALERT_LINKS)
                }
                tabIndex={0}
                role="button"
              >
                <span>Alerts</span>
                <img
                  src={ArrowNextIcon}
                  alt="arrow next icon"
                  height="12"
                  width="7"
                  className="pull-right mt-2 margin-left-10-px mb-1"
                  role="presentation"
                />
              </li>
            </ul>
          </div>
        )}
        {hamburgerTemplate === HeaderLinks.SUPPORT_LINKS && (
          <Support menuItems={menuItems} />
        )}
        {hamburgerTemplate === HeaderLinks.ALERT_LINKS && (
          <Notifications menuItems={menuItems} />
        )}
      </div>

      <div className={`cb-header-gradientline mt-0${spectrumLogoEnabled ? " spectrum" : ""}`}></div>
    </div>
  );
};

export default CbPageHeader;
