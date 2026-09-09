export { };
declare module "react-helmet";
declare global {
  interface Window {
    // Below just informs IDE and/or TS-compiler (it's set in `.js` file).
    RequestJson: {
      page: {
        template: {
          udo: {};
          page: {};
        };
        reserved: {
          csrfToken: string
        };
      };
    };
    adobe: {
      target: {
        triggerView: (key: string, { page: boolean }) => void;
      };
    };
    utag: {
      link: (params: { [key: string]: any }) => void;
      view: (params: { [key: string]: any }) => void;
    };
    utag_data: {
      serviceableCodes: string;
    };
    ValidatePANChecksum: (pan: string) => boolean;
    ProtectPANandCVV: (
      pan: string,
      cvv: string,
      isAccountNumber: boolean,
    ) => string[] | null;
    pendo: any;
  }

  const ANSWERS: {
    init: (config: {
      apiKey: string;
      experienceKey: string;
      experienceVersion: string;
      businessId: string;
      onReady: () => void;
    }) => void;

    addComponent: (
      name: string,
      config: {
        container: string;
        redirectUrl: string;
        promptHeader: string;
        searchText: string;
        placeholderText: string;
      }
    ) => void;
  };
}
