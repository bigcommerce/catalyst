'use client';

import { useEffect } from 'react';

export function LiveChat() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.id = 'Microsoft_Omnichannel_LCWidget';
      script.src = 'https://oc-cdn-ocprod.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js';
      //script.setAttribute('data-app-id', '254f47ce-9b81-4f88-ab92-44c6b00d0314');
      script.setAttribute('data-app-id', 'c55cc9a8-7b64-413d-bca1-6462811ef38f');
      script.setAttribute('data-lcw-version', 'prod');
      //script.setAttribute('data-org-id', 'f5512199-fada-47e9-bdc9-3311d44076b4');
      script.setAttribute('data-org-id', '291a1cc9-32e9-ef11-933b-00224808c42e');
      //script.setAttribute('data-org-url', 'https://m-f5512199-fada-47e9-bdc9-3311d44076b4.us.omnichannelengagementhub.com');
      script.setAttribute('data-org-url', 'https://m-291a1cc9-32e9-ef11-933b-00224808c42e.us.omnichannelengagementhub.com');
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      }
    }
  }, []);

  return <></>;
}
