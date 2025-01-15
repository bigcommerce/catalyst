'use client';
import React, { useEffect, useRef } from 'react'
import { getReferralIdCookie, createReferralIdCookie } from '../_actions/referral';

export default function ReferralId() {
    useEffect(() => {
        createReferralIdCookie();
        async function fetchMyCookie() {
            let cookieValue = await getReferralIdCookie();
            if (cookieValue?.value) {
                localStorage.setItem('referral_id', cookieValue.value);
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
        <div className="hover:text-primary flex justify-space focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20  text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white">Referral Id : <div id="referralIdDiv" className='ml-[10px]'>#####</div> </div>
    </>
    )
}
