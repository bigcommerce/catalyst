'use client';
import React, { useEffect, useRef } from 'react'
import { getReferrerIdCookie } from '../_actions/referrer';

export default function ReferrId() {
    useEffect(() => {
        async function fetchMyCookie() {
            let cookieValue = await getReferrerIdCookie();
            if (cookieValue?.value) {
            let divReferrer = document.getElementById("referrerIdDiv");
                if (divReferrer && divReferrer instanceof HTMLDivElement) {
                    divReferrer.innerText = cookieValue?.value;
                }
            }
        }
        fetchMyCookie();
    }, []);
    return (
    <>
        <div className="">Referrer Id : <div id="referrerIdDiv">#####</div> </div>
    </>
    )
}
