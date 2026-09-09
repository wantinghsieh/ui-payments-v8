import * as React from 'react';
import { useEffect } from 'react';
import { useAxios } from '@cox/core-ui8/dist/useAxios';
import { OKTA_CB_KEEP_ALIVE_URL } from '../../hooks/constants';

const KeepAlive = () => {

  const { axiosAPI: axiosAPIForKeepAlive } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      console.log("onAjaxSuccess", data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    }
  });

  useEffect(() => {
    postPaymentsAppData();
    const intervalId = setInterval(postPaymentsAppData, (Number(15) || 1) * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);


  async function postPaymentsAppData() {
    try {
      const host = window.location.origin;
      await axiosAPIForKeepAlive({
        url: `${host}${OKTA_CB_KEEP_ALIVE_URL}`,
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

  return (
    <div>

    </div>
  );
}

export default KeepAlive;