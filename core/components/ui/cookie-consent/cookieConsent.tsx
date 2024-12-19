'use client';

import useCookieScript from "use-cookiescript-hook";

const CookieConsent = ({ url }: { url: any }) => {

  useCookieScript(url, {
    position: "head-bottom",
  });

  return(<></>);
};

export default CookieConsent;