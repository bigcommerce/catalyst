'use client';
import React, { useEffect, useRef, useState } from 'react'
import { getReferralIdCookie, createReferralIdCookie } from '../_actions/referral';

export default function ReferralId() {
    const [referrerId, setReferrerId] = useState('');
    useEffect(() => {
        createReferralIdCookie();
        async function fetchMyCookie() {
            let cookieValue = await getReferralIdCookie();
            setReferrerId(cookieValue?.value || '');
            if (cookieValue?.value) {
                localStorage.setItem('referrerId', cookieValue.value);
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
            <div className="hover:text-primary flex justify-space focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20  text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white">Referral Id : <div id="referralIdDiv" className='ml-[10px]'>{referrerId ? referrerId : "#####"}</div> </div>
    </>
    )
}
