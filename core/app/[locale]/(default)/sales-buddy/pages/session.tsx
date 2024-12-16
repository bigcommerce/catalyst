'use client';
import React, { useEffect, useRef } from 'react'
import { getSessionIdCookie, createSessionIdCookie } from '../_actions/session';

export default function SessionId() {
    useEffect(() => {
        createSessionIdCookie();
        async function fetchMyCookie() {
            let cookieValue = await getSessionIdCookie();
            if (cookieValue?.value) { console.log('line no 10');
                let divSession = document.getElementById("sessionIdDiv");
                if (divSession && divSession instanceof HTMLDivElement) {
                    divSession.innerText = cookieValue?.value;
                }
            }
        }
        
        // let sessionIdDiv = document.getElementById("sessionIdDiv");
        // if((sessionIdDiv && sessionIdDiv instanceof HTMLDivElement)){
        //     sessionIdDiv.addEventListener("click", function() {
        //         fetchMyCookie();
        //     });
        // }
        fetchMyCookie();
    }, []);
    return (
    <>
        <div id="sessionIdMainDiv" className=" hover:text-primary flex justify-space focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20  text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white">Session Id : <div id="sessionIdDiv" className='ml-[10px]'>#####</div></div>
    </>
    )
}
