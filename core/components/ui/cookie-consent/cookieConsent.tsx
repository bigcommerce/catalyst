'use client';

import useCookieScript from "use-cookiescript-hook";

const CookieConsent = ({ url }: { url: string }) => {

  useCookieScript(url, {
    position: "head-bottom",
  });

  return(<></>);
};

export default CookieConsent;