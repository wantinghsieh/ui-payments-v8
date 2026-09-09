import EasyPay from "./pages/EasyPay";
import Makepayment from "./pages/MakePayment";
import PaymentError from "./pages/PaymentError";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppDataContext } from "@cox/core-ui8/dist/AppDataContext";
import PageLoader from "@cox/core-ui8/dist/PageLoader";
import AddPaymentMethod from "./pages/AddPaymentMethod";
import GlobalSideNav from "@cox/core-ui8/dist/GlobalSideNav";
import OneTimePayment from "./pages/OneTimePayment";
import PrepaidRecharge from "./pages/PrepaidRecharge";
import PrepaidAutomaticRecharge from "./pages/PrepaidAutomaticRecharge";
import V8ReleaseInfo from "./pages/V8ReleaseInfo";
import MinimalHeader from "./components/widgets/minimalHeader";
import MinimalFooter from "./components/widgets/minimalFooter";
import OktaEasyPay from "./pages/OktaEasyPay";
import AemRenderer from "@cox/core-ui8/dist/AemRenderer";
import CbPageHero from "./components/CbPageHero";
import { useEffect, useState } from "react";
import { useTheme } from "@cox/ui-theme/provider";
import HeartbeatModal from "./components/HeartbeatModal";
import FuturePayment from "./pages/FuturePayment";
import ExtendPayment from "./pages/ExtendPayment";
import KeepAlive from "./components/KeepAlive/KeepAlive";
import CbPageHeader from "./components/CbPageHeader";
import CbPageFooter from "./components/CbPageFooter";
import BlurCbBackground from "./components/BlurCbBackground/BlurCbBackground";
import CbCoreSessionTimeout from "./pages/CbCoreSessionTimeout";
import ManagePaymentMethod from "./pages/ManagePaymentMethod";

const AppRoutes = () => {
  const { appData } = useAppDataContext();
  const { setTheme } = useTheme();
  const prefix = (appData as any)?.prefix;
  const sections =
    prefix === "/ui/v8"
      ? appData?.page?.sections
      : appData?.page?.template?.sections;
  const appContext = (appData as any)?.appName;
  const displayPageHeader =
    (appData as any)?.page?.template?.displayHeader ||
    (appData as any)?.page?.displayHeader;
  const displayPageFooter =
    (appData as any)?.page?.template?.displayFooter ||
    (appData as any)?.page?.displayFooter;
  const customerType = sections?.payment?.customerType || "residential";
  const [coxAppContentUrl, setCoxAppContentUrl] = useState("");
  const coxAppContentOrigin = window.location.origin.includes("localhost")
    ? "https://www.one.qa.cox.com"
    : window.location.origin;
  const displayCbHeader =
    (appData as any)?.page?.template?.displayCbHeader ||
    (appData as any)?.page?.displayCbHeader;
  const displayCbFooter =
    (appData as any)?.page?.template?.displayCbFooter ||
    (appData as any)?.page?.displayCbFooter;
  // ECARE1-71986 — cox.com.payments.header-spectrum-logo.enabled. Surfaced by the
  // backend through the same channel as displayHeader/displayCbHeader; defaults to
  // false (BAU Cox logo) when absent.
  const spectrumLogoEnabled =
    (appData as any)?.page?.template?.spectrumLogoEnabled ||
    (appData as any)?.page?.spectrumLogoEnabled ||
    false;

  const handleNavigate = (url: string) => {
    window.location.href = `${prefix}${url}`;
  };

  let showSideNav;
  if (sections) {
    showSideNav = (sections as any).displayLeftNav;
  }

  const getCoxAppContentUrl = (url: string) => {
    setCoxAppContentUrl(url);
  };

  const getPendoDataFromCookies = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
      return null;
    };

    const pendoData = getCookie("pendoData");
    let visitorObject = {};
    let accountObject = {};

    if (pendoData) {
      const [visitorId, role, userPermission, siteID, accountId] =
        pendoData.split("|");
      visitorObject = {
        id: visitorId,
        role,
        userHasPermission: userPermission === "true",
        siteID,
      };
      accountObject = {
        id: accountId,
      };
    }

    return { visitor: visitorObject, account: accountObject };
  };

  // Initialize Pendo for CB customers
  useEffect(() => {
    if (
      customerType === "business" &&
      (sections as any)?.payment?.oktaLogin &&
      window["pendo"]
    ) {
      const { visitor, account } = getPendoDataFromCookies();
      window["pendo"]?.initialize({
        visitor,
        account,
      });
    }
  }, [customerType]);

  // ThemeProvider (src/index.tsx) owns the <html> theme class; select it per customerType.
  // Residential → cox-resi, business → cox-busi (both Cox tokens imported in src/index.tsx).
  // ThemeClassSyncer keeps core-ui8's wrappers on the same theme.
  useEffect(() => {
    setTheme(customerType === "business" ? "cox-busi" : "cox-resi");
  }, [customerType, setTheme]);

  if (Object.keys(appData).length > 0) {
    return (
      <>
        {((customerType !== "business" && !displayPageHeader) ||
          (customerType === "business" &&
            !displayPageHeader &&
            !displayCbHeader)) && (
          <MinimalHeader
            customerType={customerType}
            sections={sections}
            spectrumLogoEnabled={spectrumLogoEnabled}
          />
        )}

        {displayCbHeader &&
          !displayPageHeader &&
          customerType === "business" && (
            <CbPageHeader
              sections={sections}
              spectrumLogoEnabled={spectrumLogoEnabled}
            />
          )}

        {customerType === "business" && (
          <BlurCbBackground sections={sections} />
        )}

        {customerType === "business" && (sections as any)?.showCBPageHero && (
          <CbPageHero sections={sections} />
        )}

        {customerType === "business" &&
          (sections as any)?.payment?.oktaLogin && <KeepAlive />}

        <div
          className={`app-content ${customerType === "business" ? "cb-app-content" : ""}`}
        >
          {showSideNav ? (
            <>
              <HeartbeatModal sections={sections} />
              <GlobalSideNav
                handleNavigate={handleNavigate}
                activeSideNavId={
                  (sections as any)?.activeSideNavId || "paymybills-item"
                }
                appContext={appContext}
              >
                <div className="card-theme-white">
                  <Router basename={`${prefix}/${appContext}`}>
                    <OktaFlowRoutes
                      sections={sections}
                      customerType={customerType}
                      getCoxAppContentUrl={getCoxAppContentUrl}
                    />
                  </Router>
                </div>
              </GlobalSideNav>
            </>
          ) : (
            <>
              <Router basename={`${prefix}/${appContext}`}>
                {(sections as any)?.payment?.oktaLogin && (
                  <HeartbeatModal sections={sections} />
                )}
                <CbOktaFlowRoutes
                  sections={sections}
                  customerType={customerType}
                  getCoxAppContentUrl={getCoxAppContentUrl}
                />
              </Router>
              <Router basename={`${prefix}/${appContext}`}>
                <TokenizedFlowRoutes
                  sections={sections}
                  customerType={customerType}
                  getCoxAppContentUrl={getCoxAppContentUrl}
                />
              </Router>
            </>
          )}
        </div>

        {coxAppContentUrl && (
          <div className="cox-content-url-layout">
            <div className="cox-content-url mb-4 pl-0 pr-0">
              <AemRenderer url={coxAppContentOrigin + coxAppContentUrl} />
            </div>
          </div>
        )}

        {((customerType !== "business" && !displayPageFooter) ||
          (customerType === "business" &&
            !displayPageFooter &&
            !displayCbFooter)) && <MinimalFooter customerType={customerType} spectrumLogoEnabled={spectrumLogoEnabled} />}
        {displayCbFooter &&
          !displayPageFooter &&
          customerType === "business" && <CbPageFooter sections={sections} spectrumLogoEnabled={spectrumLogoEnabled} />}
      </>
    );
  }
  return <PageLoader />;
};

const OktaFlowRoutes = ({
  sections,
  customerType,
  getCoxAppContentUrl,
}: any) => {
  return (
    <Routes>
      <Route
        path="/make-payment.html"
        element={
          <OneTimePayment
            sections={sections}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/prepaid-recharge.html"
        element={
          <PrepaidRecharge
            sections={sections}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/prepaid-automatic-recharge.html"
        element={
          <PrepaidAutomaticRecharge
            sections={sections}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/automatic-payments.html"
        element={
          <OktaEasyPay
            sections={sections}
            customerType={customerType}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/future-payment.html"
        element={
          <FuturePayment
            sections={sections}
            customerType={customerType}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/payment-extension.html"
        element={
          <ExtendPayment
            sections={sections}
            customerType={customerType}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/manage-payment-method.html"
        element={<ManagePaymentMethod sections={sections} />}
      />
    </Routes>
  );
};

const TokenizedFlowRoutes = ({
  sections,
  customerType,
  getCoxAppContentUrl,
}: any) => {
  return (
    <Routes>
      <Route path="/" element={<Makepayment sections={sections} />} />
      <Route
        path="/pay-now.html"
        element={<Makepayment sections={sections} />}
      />
      <Route
        path="/auto-pay.html"
        element={
          <EasyPay
            sections={sections}
            customerType={customerType}
            setCoxAppContentUrl={getCoxAppContentUrl}
          />
        }
      />
      <Route
        path="/pay-now-error.html"
        element={<PaymentError sections={sections} />}
      />
      <Route
        path="/auto-pay-error.html"
        element={<PaymentError sections={sections} />}
      />
      <Route
        path="/add-payment-method-error.html"
        element={<PaymentError sections={sections} />}
      />
      <Route
        path="/add-payment-method.html"
        element={<AddPaymentMethod sections={sections} />}
      />
      <Route
        path="/release-info.html"
        element={
          <div className="container">
            <div
              className="col-12 col-lg-8 col-xl-9 mx-auto"
              style={{ height: "60vh" }}
            >
              <div
                className="card-theme-white"
                style={{ alignItems: "flex-start" }}
              >
                <V8ReleaseInfo />
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

const CbOktaFlowRoutes = ({ sections, customerType }: any) => {
  return (
    <Routes>
      <Route
        path="business/make-payment.html"
        element={
          <OneTimePayment sections={sections} customerType={customerType} />
        }
      />

      <Route
        path="business/automatic-payments.html"
        element={
          <OktaEasyPay sections={sections} customerType={customerType} />
        }
      />
      <Route
        path="business/future-payment.html"
        element={
          <FuturePayment sections={sections} customerType={customerType} />
        }
      />
      <Route
        path="business/coreSessionTimeout.html"
        element={<CbCoreSessionTimeout sections={sections} />}
      />
      <Route
        path="business/multi-acct-make-payment.html"
        element={
          <OneTimePayment sections={sections} customerType={customerType} />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
