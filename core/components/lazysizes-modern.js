/**
 * Modern LazyLoad Implementation
 * Simplified and modernized version of lazysizes for modern browsers
 * Targets: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
 */

(function() {
  'use strict';

  // Configuration with modern defaults
  const config = {
    lazyClass: 'lazyload',
    loadedClass: 'lazyloaded',
    loadingClass: 'lazyloading',
    errorClass: 'lazyerror',
    srcAttr: 'data-src',
    srcsetAttr: 'data-srcset',
    sizesAttr: 'data-sizes',
    rootMargin: '200px', // IntersectionObserver margin
    threshold: 0.01,
    ...window.lazySizesConfig
  };

  // Use modern IntersectionObserver for visibility detection
  const observerConfig = {
    rootMargin: config.rootMargin,
    threshold: config.threshold
  };

  // Track loading state
  const loadingElements = new WeakSet();
  const loadedElements = new WeakSet();

  // Unveil an element (load the image)
  const unveilElement = (element) => {
    if (loadedElements.has(element)) return;

    loadingElements.add(element);
    element.classList.remove(config.lazyClass);
    element.classList.add(config.loadingClass);

    const srcset = element.getAttribute(config.srcsetAttr);
    const src = element.getAttribute(config.srcAttr);
    const sizes = element.getAttribute(config.sizesAttr);

    // Handle picture element sources
    if (element.parentElement?.tagName === 'PICTURE') {
      element.parentElement.querySelectorAll('source').forEach(source => {
        const sourceSrcset = source.getAttribute(config.srcsetAttr);
        if (sourceSrcset) {
          source.setAttribute('srcset', sourceSrcset);
        }
      });
    }

    // Set attributes
    if (sizes && sizes !== 'auto') {
      element.setAttribute('sizes', sizes);
    }

    if (srcset) {
      element.setAttribute('srcset', srcset);
    }

    if (src) {
      if (element.tagName === 'IFRAME') {
        element.src = src;
      } else {
        element.src = src;
      }
    }

    // Handle load/error events
    const onLoad = () => {
      loadedElements.add(element);
      loadingElements.delete(element);
      element.classList.remove(config.loadingClass);
      element.classList.add(config.loadedClass);
      element.removeEventListener('load', onLoad);
      element.removeEventListener('error', onError);

      // Dispatch custom event
      element.dispatchEvent(new CustomEvent('lazyloaded', {
        bubbles: true,
        detail: { element }
      }));
    };

    const onError = () => {
      loadingElements.delete(element);
      element.classList.remove(config.loadingClass);
      element.classList.add(config.errorClass);
      element.removeEventListener('load', onLoad);
      element.removeEventListener('error', onError);
    };

    element.addEventListener('load', onLoad);
    element.addEventListener('error', onError);

    // For images that are cached/already loaded
    if (element.complete && element.naturalWidth) {
      onLoad();
    }
  };

  // IntersectionObserver callback
  const onIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        observer.unobserve(element);
        unveilElement(element);
      }
    });
  };

  // Create the observer
  const observer = new IntersectionObserver(onIntersection, observerConfig);

  // Initialize lazy loading on elements
  const initLazyLoad = () => {
    // Find all lazy elements
    const lazyElements = document.querySelectorAll(`.${config.lazyClass}`);

    lazyElements.forEach(element => {
      if (!loadedElements.has(element) && !loadingElements.has(element)) {
        observer.observe(element);
      }
    });
  };

  // Watch for DOM changes using MutationObserver
  const mutationObserver = new MutationObserver(mutations => {
    // Use requestIdleCallback if available, otherwise use timeout
    const callback = () => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.classList?.contains(config.lazyClass)) {
              observer.observe(node);
            }
            // Check children
            node.querySelectorAll?.(`.${config.lazyClass}`).forEach(el => {
              observer.observe(el);
            });
          }
        });
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  });

  // Start observing DOM changes
  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }

  // Re-check on page show (back/forward cache)
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      initLazyLoad();
    }
  });

  // Expose API
  window.lazySizes = {
    cfg: config,
    observer,
    unveil: unveilElement,
    init: initLazyLoad
  };
})();
