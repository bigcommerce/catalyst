import { get_cart_price_adjuster_data, get_product_by_entity_id } from '../_actions/get-product-by-entityid';
import { updateProductQuantity } from '../_actions/update-quantity';

let overAllProductData: never[] = [];
export const PdpProduct = overAllProductData;
export const validateInput = (type: string, value: string | any[], action: string | undefined) => {
  switch (type) {
    case 'phone': {
      // Phone number validation: not empty, length between 7 and 25, only digits
      let min_length = action == 'find' ? 0 : 7
      let max_length = 25
      const phoneRegex = new RegExp(`^\\d{${min_length},${max_length}}$`);
      if (!value && action != 'find') return 'Phone number cannot be empty.';
      return phoneRegex.test(value)
        ? ''
        : 'Phone number must be between 7 and 25 digits and contain only numbers.';
    }

    case 'firstname': {
      // First name validation: not empty, length between 1 and 25, only letters
      //   const firstNameRegex = /^[A-Za-zÀ-ÿ '-]{3,255}$/;
      let min_length = action == 'find' ? 0 : 3; // Minimum length for first name
      let max_length = 255; // Maximum length for first name
      const firstNameRegex = new RegExp(`^[A-Za-zÀ-ÿ '-]{${min_length},${max_length}}$`);
      if (!value && action != 'find') return 'First name cannot be empty.';
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
      if (!value && action != 'find') return 'Email cannot be empty.';

      return value == '' && action == 'find' ? " " : emailRegex.test(value) ? '' : 'Enter a valid email address.';
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


// -------- onclick session id get all available data of user and machine-----------------

export interface SystemInfo {
  network: {
    ip: string;
    location: {
      country?: string;
      region?: string;
      city?: string;
      zip?: string;
      isp?: string;
      org?: string;
    };
  };
  geolocation: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  browser: {
    userAgent: string;
    appName: string;
    appVersion: string;
    platform: string;
    vendor: string;
    language: string;
    cookieEnabled: boolean;
    onLine: boolean;
    doNotTrack: string;
    maxTouchPoints: number;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    orientation: string;
  };
  timezone: {
    timezone: string;
    timezoneOffset: number;
  };
  hardware: {
    deviceMemory: number | undefined;
    hardwareConcurrency: number | undefined;
    platform: string;
    deviceType: 'Mobile' | 'Desktop';
  };
  connection: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } | 'Network Information API not supported';
}

export async function getEnhancedSystemInfo(): Promise<SystemInfo> {
  const systemInfo: SystemInfo = {
    network: {
      ip: 'Loading...',
      location: {}
    },
    geolocation: {
      latitude: null,
      longitude: null,
      accuracy: null
    },
    browser: {
      userAgent: navigator.userAgent,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      doNotTrack: navigator.doNotTrack || '',
      maxTouchPoints: navigator.maxTouchPoints,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      orientation: screen.orientation ? screen.orientation.type : 'unknown'
    },
    timezone: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset()
    },
    hardware: {
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      platform: navigator.platform,
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    },
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
      saveData: (navigator as any).connection.saveData
    } : 'Network Information API not supported'
  };

  const getIpURL = process.env.NEXT_PUBLIC_SALES_BUDDY_API_IP;
  const getIpURLLocation = process.env.NEXT_PUBLIC_SALES_BUDDY_API_IP_LOCATION;

  if (!getIpURL || !getIpURLLocation) {
    throw new Error('Environment variables for IP URLs are not defined');
  }

  // Get IP and Location data
  try {
    const ipResponse = await fetch(getIpURL);
    const ipData = await ipResponse.json();
    systemInfo.network.ip = ipData.ip;

    // Get detailed location data using ip-api.com (free tier)
    const locationResponse = await fetch(`${getIpURLLocation}${ipData.ip}`);
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
    systemInfo.network.location = {};
  }

  // Get precise geolocation if user allows
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      systemInfo.geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed
      };
    } catch (error) {
      systemInfo.geolocation = {
        latitude: null,
        longitude: null,
        accuracy: null
      };
    }
  }

  return systemInfo;
}

export const updateCustomProductQuantity = async (cartId: any, productQuantity: any, sku: any) => {
  const status = await updateProductQuantity(cartId, productQuantity, sku)

  console.log(status.output?.data?.line_items?.custom_items);
  let result = status?.output?.data?.line_items?.custom_items;
  let updatedCustomQuantity = result?.find((data: { sku: any; quantity: any; }) => {
    if (data?.sku == sku) {
      return data?.quantity
    }
  })

  return updatedCustomQuantity
}