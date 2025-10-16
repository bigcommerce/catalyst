import Script from 'next/script';

export function LazySizesScript() {
  return (
    <Script
      id="lazysizes-modern"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `/**
 * Modern LazyLoad - Modernized lazysizes for modern browsers
 * Uses IntersectionObserver, WeakSet, and modern JS features
 */
(function(){"use strict";const c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",errorClass:"lazyerror",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",rootMargin:"200px",threshold:.01,...window.lazySizesConfig},o={rootMargin:c.rootMargin,threshold:c.threshold},i=new WeakSet,d=new WeakSet,l=e=>{if(d.has(e))return;i.add(e),e.classList.remove(c.lazyClass),e.classList.add(c.loadingClass);const t=e.getAttribute(c.srcsetAttr),a=e.getAttribute(c.srcAttr),r=e.getAttribute(c.sizesAttr);e.parentElement?.tagName==="PICTURE"&&e.parentElement.querySelectorAll("source").forEach(e=>{const t=e.getAttribute(c.srcsetAttr);t&&e.setAttribute("srcset",t)}),r&&r!=="auto"&&e.setAttribute("sizes",r),t&&e.setAttribute("srcset",t),a&&(e.src=a);const s=()=>{d.add(e),i.delete(e),e.classList.remove(c.loadingClass),e.classList.add(c.loadedClass),e.removeEventListener("load",s),e.removeEventListener("error",n),e.dispatchEvent(new CustomEvent("lazyloaded",{bubbles:!0,detail:{element:e}}))},n=()=>{i.delete(e),e.classList.remove(c.loadingClass),e.classList.add(c.errorClass),e.removeEventListener("load",s),e.removeEventListener("error",n)};e.addEventListener("load",s),e.addEventListener("error",n),e.complete&&e.naturalWidth&&s()},u=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(t.unobserve(e.target),l(e.target))})},o),m=()=>{document.querySelectorAll(\`.\${c.lazyClass}\`).forEach(e=>{d.has(e)||i.has(e)||u.observe(e)})};new MutationObserver(e=>{const t=()=>{e.forEach(e=>{e.addedNodes.forEach(e=>{if(e.nodeType===1){if(e.classList?.contains(c.lazyClass)&&u.observe(e),e.querySelectorAll){const t=e.querySelectorAll(\`.\${c.lazyClass}\`);t.forEach(e=>u.observe(e))}}})})};"requestIdleCallback"in window?requestIdleCallback(t):setTimeout(t,0)}).observe(document.documentElement,{childList:!0,subtree:!0}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m(),window.addEventListener("pageshow",e=>{e.persisted&&m()}),window.lazySizes={cfg:c,observer:u,unveil:l,init:m}})();`,
      }}
    />
  );
}
