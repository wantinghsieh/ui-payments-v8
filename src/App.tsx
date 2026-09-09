import Layout from "@cox/core-ui8/dist/Layout"
import AppRoutes from "./AppRoutes";
import PaymentContextProvider from "./context/PaymentContextProvider";

const App = () => {
  return (
    <Layout appName="payments">
      <PaymentContextProvider>
        <AppRoutes />
      </PaymentContextProvider>
    </Layout>
  );
};

export default App;
