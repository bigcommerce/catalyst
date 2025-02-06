'use client';
import React, { useEffect, useRef, useState } from 'react';
import { getSessionIdCookie, createSessionIdCookie } from '../_actions/session';
import { getEnhancedSystemInfo } from '../common-components/common-functions';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { usePathname, useSearchParams } from 'next/navigation';

export default function SessionId() {
    const [storeSessionID, setStoreSessionId] = useState('');
    const { context_session_id, setContext_Session_id } = useCompareDrawerContext();

    const path = usePathname();
      const searchParams = useSearchParams();
      const queryString = searchParams.toString(); 
      let fullUrl = '';

    useEffect(() => {
      if (typeof window !== "undefined") {
        const iFrame = window.self !== window.top;
        if(iFrame) return;
      }
      fullUrl = queryString ? `${window.location.protocol}//${window.location.host}${path}?${queryString}` : `${window.location.protocol}//${window.location.host}${path}`
        const onloadFetchSessionId = async () => {
            const sessionId = await getSessionIdCookie()
            if (sessionId?.value) {
                setContext_Session_id(sessionId?.value);
            }
        }
        
        onloadFetchSessionId();
    }, [])

    const fetchSystemInfo = async () => {
        const info = await getEnhancedSystemInfo();
        console.log('System Info:', info);
        
        let data = {
            browser: info?.browser?.userAgent,
            connection: typeof info?.connection === 'object' ? info.connection.effectiveType : undefined,
            latitude: info?.geolocation?.latitude,
            longitude: info?.geolocation?.longitude,
            deviceType: info?.hardware?.deviceType,
            platform: info?.hardware?.platform,
            ip: info?.network?.ip,
            country: info?.network?.location?.country,
            region: info?.network?.location?.region,
            city: info?.network?.location?.city,
            zip: info?.network?.location?.zip,
            screenHeight: info?.screen?.height,
            screenWidth: info?.screen?.width,
            screenOrientation: info?.screen?.orientation,
            timezone: info?.timezone?.timezone,
            refferalId: localStorage.getItem('referrerId')
        };
        return data;
    };
    const initializeSessionId = async () => {
        if (!context_session_id) {
            const localMachineInformation = await fetchSystemInfo();
            const sessionId = await createSessionIdCookie(localMachineInformation, fullUrl);
            setContext_Session_id(sessionId?.output);
            setStoreSessionId(sessionId?.output)
            localStorage.setItem('session_id', sessionId?.output)
            fetchMyCookie();
        }

    };
    const fetchMyCookie = async () => {
        let cookieValue = await getSessionIdCookie();
        if (cookieValue?.value) {
            let divSession = document.getElementById("sessionIdDiv");
            if (divSession && divSession instanceof HTMLDivElement) {
                divSession.innerText = cookieValue.value;
            }
        }
    };



    return (
        <>
            <div
                id="sessionIdMainDiv"
                className="hover:text-primary flex justify-space focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white cursor-pointer"
                onClick={() => initializeSessionId()} // Fetch cookie on click
            >
                <span>Session Id:</span>
                <div id="sessionIdDiv" className='ml-[10px]'>
                    {context_session_id ? context_session_id : "######"}

                </div>
            </div>
        </>
    );
}