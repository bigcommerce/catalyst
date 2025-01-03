import { get_cart_price_adjuster_data, get_product_by_entity_id } from '../_actions/get-product-by-entityid';

let overAllProductData: never[] = [];
export const PdpProduct = overAllProductData;
export const validateInput = (type: string, value: string | any[], action: string | undefined) => {
  switch (type) {
    case 'phone': {
      // Phone number validation: not empty, length between 7 and 25, only digits
      let min_length=action=='find' ? 0 : 7
      let  max_length= 25
      const phoneRegex = new RegExp(`^\\d{${min_length},${max_length}}$`);
      if (!value && action != 'find') return 'Phone number cannot be empty.';
      return phoneRegex.test(value)
        ? ''
        : 'Phone number must be between 7 and 25 digits and contain only numbers.';
    }

    case 'firstname': {
      // First name validation: not empty, length between 1 and 25, only letters
    //   const firstNameRegex = /^[A-Za-zÀ-ÿ '-]{3,255}$/;
        let min_length = action=='find' ?0 : 3 ; // Minimum length for first name
        let max_length = 255; // Maximum length for first name
        const firstNameRegex = new RegExp(`^[A-Za-zÀ-ÿ '-]{${min_length},${max_length}}$`);
        if (!value && action != 'find' ) return 'First name cannot be empty.';
        return firstNameRegex.test(value)
            ? ''
            : 'First name must be between 3 and 255 characters and contain only letters.';
    }
    case 'lastname': {
      // Last name validation: not empty, length between 1 and 50, only letters
      const lastNameRegex = /^[A-Za-zÀ-ÿ '-]{3,255}$/;
      if (!value) return 'Last name cannot be empty.';
      return lastNameRegex.test(value)
        ? ''
        : 'Last name must be between 3 and 255 characters and contain only letters.';
    }

    case 'email': {
      // Email validation: basic format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return 'Email cannot be empty.';
      return emailRegex.test(value) ? '' : 'Enter a valid email address.';
    }

    case 'company': {
      // Company name validation: not empty, length between 1 and 50
      if (!value) return 'Company name cannot be empty.';
      return value.length <= 50 ? '' : 'Company name must be 50 characters or less.';
    }

    default:
      return '';
  }
};

export function store_pdp_product_in_localstorage(product: any) {
  overAllProductData = product;
  const productData = {
    productId: product.entityId,
    brand: product.brand?.name || null,
    sku: product.sku,
    name: product.name,
    mpn: product.mpn,
  };

  localStorage.setItem('productInfo', JSON.stringify(productData));
}

export const get_product_data = async (entityId: any) => {
  const result = await get_product_by_entity_id(entityId);
  if (result.status === 200) {
    return result;
  } else {
    return [{ error: 'Failed to retrive data' }];
  }
};

// -----------cart Page localstorage functions-------

export function addItemToArray(key, item) {
  const array = getArrayFromLocalStorage(key);
  array.push(item); // Add the new item
  saveArrayToLocalStorage(key, array); // Save the updated array
}

export function getArrayFromLocalStorage(key) {
  const storedArray = localStorage.getItem(key);
  return storedArray ? JSON.parse(storedArray) : [];
}

// Function to save the array to localStorage
export function saveArrayToLocalStorage(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}



// -------- onclick session id get all available data of user and machine-----------------

export function getBrowserInfo() {
    const browserInfo = {
        userAgent: navigator.userAgent,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        platform: navigator.platform,
        language: navigator.language,
    };
    console.log(browserInfo);
}
export async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log('IP Address:', data.ip);
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}
export function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationInfo = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                console.log('Location:', locationInfo);
            },
            (error) => {
                console.error('Error getting location:', error);
            }
        );
    } else {
        console.log('Geolocation is not supported by this browser.');
    }
}

export async function getEnhancedSystemInfo() {
    const systemInfo = {
        // IP and Location information (from external API)
        network: {
            ip: 'Loading...',
            location: 'Loading...'
        },
        
        // Geolocation (if user permits)
        geolocation: {
            latitude: null,
            longitude: null,
            accuracy: null
        },
        
        // Browser information
        browser: {
            userAgent: navigator.userAgent,
            appName: navigator.appName,
            appVersion: navigator.appVersion,
            platform: navigator.platform,
            vendor: navigator.vendor,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            doNotTrack: navigator.doNotTrack,
            maxTouchPoints: navigator.maxTouchPoints,
        },
        
        // Screen information
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
            orientation: screen.orientation.type
        },
        
        // System time and timezone
        timezone: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset()
        },
        
        // Hardware information
        hardware: {
            deviceMemory: navigator.deviceMemory,
            hardwareConcurrency: navigator.hardwareConcurrency,
            platform: navigator.platform,
            deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        },
        
        // Connection information
        // connection: navigator.connection ? {
        //     effectiveType: navigator.connection.effectiveType,
        //     downlink: navigator.connection.downlink,
        //     rtt: navigator.connection.rtt,
        //     saveData: navigator.connection.saveData
        // } : 'Network Information API not supported'
    };

    // Get IP and Location data
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        systemInfo.network.ip = ipData.ip;

        // Get detailed location data using ip-api.com (free tier)
        const locationResponse = await fetch(`http://ip-api.com/json/${ipData.ip}`);
        const locationData = await locationResponse.json();
        
        systemInfo.network.location = {
            country: locationData.country,
            region: locationData.regionName,
            city: locationData.city,
            zip: locationData.zip,
            isp: locationData.isp,
            org: locationData.org
        };
    } catch (error) {
        systemInfo.network.ip = 'Failed to fetch IP';
        systemInfo.network.location = 'Failed to fetch location';
    }

    // Get precise geolocation if user allows
    // if (navigator.geolocation) {
    //     try {
    //         const position = await new Promise((resolve, reject) => {
    //             navigator.geolocation.getCurrentPosition(resolve, reject);
    //         });
            
    //         systemInfo.geolocation = {
    //             latitude: position.coords.latitude,
    //             longitude: position.coords.longitude,
    //             accuracy: position.coords.accuracy,
    //             altitude: position.coords.altitude,
    //             heading: position.coords.heading,
    //             speed: position.coords.speed
    //         };
    //     } catch (error) {
    //         systemInfo.geolocation = 'Geolocation permission denied or unavailable';
    //     }
    // }

    return systemInfo;
}

// Example usage with button click event
// document.getElementById('getSystemInfo').addEventListener('click', () => {
//     const info = getSystemInfo();
//     console.log('System Information:', info);
    
//     // To display in the page (optional)
//     const display = document.getElementById('systemInfoDisplay');
//     if (display) {
//         display.innerHTML = '<pre>' + JSON.stringify(info, null, 2) + '</pre>';
//     }
// });