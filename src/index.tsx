import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// ── BRAND TOKENS. Residential loads the Cox set (.cox-resi); business keeps the Cox set
// (.cox-busi). ThemeProvider initialTheme is cox-resi and AppRoutes sets cox-resi/cox-busi
// per customerType.
import '@cox/ui-tokens/tokens/residential'; /* primitives → .cox-resi scope */
import '@cox/ui-tokens/tokens/business';    /* primitives → .cox-busi scope */
import "bootstrap/dist/css/bootstrap.min.css";
import '@cox/core-ui8/dist/index.css'; /* after bootstrap so core-ui8's design tokens win the cascade */
import './styles/gaps.scss';     /* @font-face + true gaps — must precede font-family usage */
import './styles/app-tokens.scss'; /* gap tokens + body-level mirrors */
import './styles/globals.scss'; /* consolidated component styles */

import { ThemeProvider } from '@cox/ui-theme/provider';
import { ThemeClassSyncer } from './utils/ThemeClassSyncer';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

// ThemeProvider owns the <html> theme class. initialTheme is cox-resi; AppRoutes sets
// cox-resi/cox-busi per customerType. ThemeClassSyncer keeps core-ui8's wrappers on the
// active theme.
root.render(
  <ThemeProvider initialTheme="cox-resi">
    <ThemeClassSyncer />
    <App />
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
