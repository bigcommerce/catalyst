'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function ReferrerId({sid, referrerId = null, ip, ua, referrer = ''} : {sid: number, referrerId: string | null, ip: string, ua: string, referrer: string}) {

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sessId = searchParams.get('sessid') || 0;
  const refId = referrerId || searchParams.get('rid') || 0;
  const logRef = searchParams.get('log') || 1;

  const source = searchParams.get('utm_source') || '';
  const keywords = searchParams.get('keywords') || searchParams.get('kw') || '';
  const clickId = searchParams.get('glcid') || searchParams.get('clickid') || '';

  const log: number = Number(logRef) === 0 ? 0 : 1;

  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined' && 
        log === 1 && 
        !referrer.includes(window.location.hostname) && 
        (Number(refId) === 0 || (Number(refId) > 0 && (source.length > 0 || keywords.length > 0 || clickId.length > 0)))
      ) {
        try {
          const response = await fetch('/api/referrer-id', {
            method: "POST",
            credentials: "same-origin",
            headers: {
              // TODO: Add some security hash here....
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              'sid': sid,
              'rid': refId,
              'ip': ip,
              'ua': ua,
              'referrer': referrer,
              'sessid': sessId,
              'source': source,
              'keywords': keywords,
              'cid': clickId,
              'page': pathname
            }),
            cache: 'no-store',
          });
          const data = await response.json();
          localStorage.setItem('referrerId', data.data);
        } catch (error) {
          console.error('Error generating referrer id: ', error);
        }
      }
    })();
  }, []);

  return <></>;
}