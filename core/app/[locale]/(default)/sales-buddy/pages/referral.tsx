'use client';
import React, { useEffect, useRef } from 'react'
import { getReferralIdCookie, createReferralIdCookie } from '../_actions/referral';

export default function ReferralId() {
    useEffect(() => {
        createReferralIdCookie();
        async function fetchMyCookie() {
            let cookieValue = await getReferralIdCookie();
            if (cookieValue?.value) {
                let divReferral = document.getElementById("referralIdDiv");
                if (divReferral && divReferral instanceof HTMLDivElement) {
                    divReferral.innerText = cookieValue?.value;
                }
            }
        }
        fetchMyCookie();
    }, []);
    return (
    <>
        <div className="">Referral Id : <div id="referralIdDiv">#####</div> </div>
    </>
    )
}
