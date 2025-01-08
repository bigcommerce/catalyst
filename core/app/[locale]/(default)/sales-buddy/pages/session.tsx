'use client';
import React, { useEffect, useRef } from 'react';
import { getSessionIdCookie, createSessionIdCookie } from '../_actions/session';
import { getEnhancedSystemInfo } from '../common-components/common-functions';

export default function SessionId() {
    useEffect(() => {
        initializeSessionId()
    }, [])

    const fetchSystemInfo = async () => {
        const info = await getEnhancedSystemInfo();
        let data = {
            browser: info?.browser?.userAgent,
            connection: info?.connection?.effectiveType,
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
        };
        return data;
    };

    const initializeSessionId = async () => {
        const localMachineInformation = await fetchSystemInfo();
        const sessionId = await createSessionIdCookie(localMachineInformation);
        localStorage.setItem('session_id', sessionId.output)
        fetchMyCookie(); // Fetch the cookie after creating it
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
            // onClick={() => initializeSessionId()} // Fetch cookie on click
            >
                <span>Session Id:</span>
                <div id="sessionIdDiv" className='ml-[10px]'>#####</div>
            </div>
        </>
    );
}