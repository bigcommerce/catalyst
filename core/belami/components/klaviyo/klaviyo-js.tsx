import Script from 'next/script';

export function KlaviyoJS() {
  const klaviyoPublicKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY;

  if (!klaviyoPublicKey) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Klaviyo] WARNING: NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY is not set, no data will be sent to Klaviyo',
    );

    return null;
  }

  // <Script src={`//static.klaviyo.com/onsite/js/klaviyo.js?company_id=${klaviyoPublicKey}`} />
  return (
    <>
      <Script src={`//static.klaviyo.com/onsite/js/${klaviyoPublicKey}/klaviyo.js`} />
      {/*
      <Script 
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
          // !(async function () {
          !function(){if(!window.klaviyo){window._klOnsite=window._klOnsite||[];try{window.klaviyo=new Proxy({},{get:function(n,i){return"push"===i?function(){var n;(n=window._klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o[w]=arguments[w];var t="function"==typeof o[o.length-1]?o.pop():void 0,e=new Promise((function(n){window._klOnsite.push([i].concat(o,[function(i){t&&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||[],window.klaviyo.push=function(){var n;(n=window._klOnsite).push.apply(n,arguments)}}}}();
          // })();
          `
        }}
      />
      */}
    </>
  );
}