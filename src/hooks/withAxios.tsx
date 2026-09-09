import { useAxios } from "@cox/core-ui8";

const withAxios = (
  WrappedComponent: any,
  apiUrl: any,
  sampleData: any,
): any => {
  return (props: any) => {
    console.log(
      Object.keys(sampleData).length +
        ":withAxios.sampleData:" +
        JSON.stringify(sampleData),
    );
    if (Object.keys(sampleData).length < 1) {
      console.log(" Invoking URL: " + apiUrl);
      const { response = {} } = useAxios(apiUrl); // default response to empty json
      console.log("Axios Response: " + JSON.stringify(response));
      return <WrappedComponent {...response} />;
    }
    return <WrappedComponent {...sampleData} />;
  };
};

export default withAxios;
