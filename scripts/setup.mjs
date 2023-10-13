import { confirm, input, password, select } from "@inquirer/prompts";

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<Response>}
 */
const fetchChannels = async ({ storeHash, accessToken }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels?type:in=storefront&platform:in=bigcommerce,next&available=true`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-auth-token": accessToken,
      },
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelId: string }} config
 * @returns {Promise<Response>}
 */
const fetchChannel = async ({ storeHash, accessToken, channelId }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels/${channelId}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-auth-token": accessToken,
      },
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelName: string }} config
 * @returns {Promise<Response>}
 */
const createChannel = async ({ storeHash, accessToken, channelName }) =>
  fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/channels`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-auth-token": accessToken,
    },
    body: JSON.stringify({
      name: channelName,
      type: "storefront",
      platform: "next",
      status: "prelaunch",
      is_listable_from_ui: true,
    }),
  });

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number }} config
 * @returns {Promise<Response>}
 */
const fetchChannelSite = async ({ storeHash, accessToken, channelId }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels/${channelId}/site`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-token": accessToken,
      },
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number, channelUrl: string }} config
 * @returns {Promise<Response>}
 */
const createChannelSite = ({ storeHash, accessToken, channelId, channelUrl }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels/${channelId}/site`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-token": accessToken,
      },
      body: JSON.stringify({
        url: channelUrl,
        channel_id: channelId,
      }),
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number, newUrl: string }} config
 * @returns {Promise<Response>}
 */
const updateChannelSite = ({ storeHash, accessToken, channelId, newUrl }) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/channels/${channelId}/site`,
    {
      method: "PUT",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-token": accessToken,
      },
      body: JSON.stringify({ url: newUrl }),
    }
  );

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number, expirySeconds: number }} config
 * @returns {Promise<Response>}
 */
const createCustomerImpersonationToken = ({
  storeHash,
  accessToken,
  channelId,
  expirySeconds,
}) =>
  fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/storefront/api-token-customer-impersonation`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-token": accessToken,
      },
      body: JSON.stringify({
        channel_id: channelId,
        expires_at: expirySeconds,
      }),
    }
  );

/** @returns {Promise<string>} */
const promptStoreHash = async () =>
  input({ message: "Please enter your store hash" });

/** @returns {Promise<string>} */
const promptAccessToken = async () => {
  console.log("Please create an access token with the following scopes:");
  console.log("- Carts: read-only");
  console.log("- Sites & routes: modify");
  console.log("- Channel settings: modify");
  console.log("- Storefront API customer impersonation tokens: manage");
  console.log(
    "http://login.bigcommerce.com/deep-links/settings/api-accounts/create"
  );

  return password({
    message: "Please enter your store's access token",
  });
};

/** @returns {Promise<boolean>} */
const promptUseExistingChannel = async () =>
  confirm({
    message: "Would you like to connect to an existing channel?",
    default: false,
  });

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number>}
 */
const promptNewChannelId = async ({ storeHash, accessToken }) => {
  const channelName = await input({
    message: "Please enter a unique name for your new channel",
  });

  const res = await createChannel({
    storeHash,
    accessToken,
    channelName,
  });

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 404:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your store hash was entered correctly.`
        );
      case 409:
        console.log("Channel name already exists");
        return promptNewChannelId({ storeHash, accessToken });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.id;
};

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number | null>}
 */
const promptExistingChannelId = async ({ storeHash, accessToken }) => {
  const res = await fetchChannels({ storeHash, accessToken });

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 404:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your store hash was entered correctly.`
        );
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  const choices = data
    .filter(({ id }) => id !== 1)
    .map(({ id, name }) => ({
      name: `Channel ID: ${id} Channel Name: ${name}`,
      value: id,
    }))
    .concat({ name: "Enter custom ID", value: null });

  return select({
    message: "Choose an existing Channel ID below",
    choices,
  });
};

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number>}
 */
const promptCustomChannelId = async ({ storeHash, accessToken }) => {
  const channelId = await input({
    message: "Enter an existing Channel ID",
  });

  const res = await fetchChannel({
    storeHash,
    accessToken,
    channelId,
  });

  if (!res.ok) {
    switch (res.status) {
      case 404:
        console.log(
          "Channel ID not found. Ensure that channel ID exists in your store."
        );
        return promptCustomChannelId({ storeHash, accessToken });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.id;
};

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number }} config
 * @returns {Promise<string>}
 */
const promptNewChannelSite = async ({ storeHash, accessToken, channelId }) => {
  const channelUrl = await input({
    message:
      "Please enter a unique URL for your new channel (this can be changed later)",
  });

  const res = await createChannelSite({
    storeHash,
    accessToken,
    channelId,
    channelUrl,
  });

  if (!res.ok) {
    switch (res.status) {
      // 401 might already be accounted for in channel name prompts
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 422:
        console.log("Channel Site URL already exists");
        return promptNewChannelSite({ storeHash, accessToken, channelId });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.url;
};

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number, existingUrl: string }} config
 * @returns {Promise<string>}
 */
const promptUpdateChannelSite = async ({
  storeHash,
  accessToken,
  channelId,
  existingUrl,
}) => {
  const newUrl = await input({
    message: `Channel ${channelId} has existing site: ${existingUrl} — Press enter to keep, otherwise enter a new URL to replace it`,
  });

  if (!newUrl) {
    return existingUrl;
  }

  const res = await updateChannelSite({
    storeHash,
    accessToken,
    channelId,
    newUrl,
  });

  if (!res.ok) {
    switch (res.status) {
      // 401 might already be accounted for in channel name prompts
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 422:
        console.log("Channel Site URL already exists");
        return promptUpdateChannelSite({
          storeHash,
          accessToken,
          channelId,
          existingUrl,
        });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.url;
};

/**
 * @param {{ storeHash: string, accessToken: string }} config
 * @returns {Promise<number>}
 */
const getChannelId = async ({ storeHash, accessToken }) => {
  const shouldUseExistingChannel = await promptUseExistingChannel();

  if (shouldUseExistingChannel) {
    const selectedChannelId = await promptExistingChannelId({
      storeHash,
      accessToken,
    });

    if (!selectedChannelId) {
      return promptCustomChannelId({ storeHash, accessToken });
    }

    return selectedChannelId;
  }

  return promptNewChannelId({ storeHash, accessToken });
};

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number }} config
 * @returns {Promise<string>}
 */
const assignChannelSite = async ({ storeHash, accessToken, channelId }) => {
  const res = await fetchChannelSite({ storeHash, accessToken, channelId });

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      case 404:
        return promptNewChannelSite({ storeHash, accessToken, channelId });
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return promptUpdateChannelSite({
    storeHash,
    accessToken,
    channelId,
    existingUrl: data.url,
  });
};

const EXPIRY_OPTS = {
  /** @type {"DAY"} */
  DAY: "DAY",
  /** @type {"WEEK"} */
  WEEK: "WEEK",
  /** @type {"MONTH"} */
  MONTH: "MONTH",
  /** @type {"YEAR"} */
  YEAR: "YEAR",
};

/**
 * @param {keyof typeof EXPIRY_OPTS} expirySelection
 * @returns {number}
 */
const getTokenExpiry = (expirySelection) => {
  const expiry = new Date();

  switch (expirySelection) {
    case EXPIRY_OPTS.DAY:
      expiry.setDate(expiry.getDate() + 1);
      break;
    case EXPIRY_OPTS.WEEK:
      expiry.setDate(expiry.getDate() + 7);
      break;
    case EXPIRY_OPTS.MONTH:
      expiry.setMonth(expiry.getMonth() + 1);
      break;
    case EXPIRY_OPTS.YEAR:
      expiry.setFullYear(expiry.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid token expiry value");
  }

  return parseInt((expiry.getTime() / 1000).toFixed(0));
};

/**
 * @param {{ storeHash: string, accessToken: string, channelId: number }} config
 * @returns {Promise<string>}
 */
const promptCustomerImpersonationToken = async ({
  storeHash,
  accessToken,
  channelId,
}) => {
  const expirySeconds = await select({
    message: "When would you like your customer impersonation token to expire?",
    choices: [
      {
        name: "1 day",
        value: getTokenExpiry(EXPIRY_OPTS.DAY),
      },
      {
        name: "1 week",
        value: getTokenExpiry(EXPIRY_OPTS.WEEK),
      },
      {
        name: "1 month",
        value: getTokenExpiry(EXPIRY_OPTS.MONTH),
      },
      {
        name: "1 year",
        value: getTokenExpiry(EXPIRY_OPTS.YEAR),
      },
    ],
  });

  const res = await createCustomerImpersonationToken({
    storeHash,
    accessToken,
    channelId,
    expirySeconds,
  });

  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was entered correctly.`
        );
      case 403:
        throw new Error(
          `${res.status} ${res.statusText}: Ensure your access token was created with the correct scopes.`
        );
      default:
        throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  const { data } = await res.json();

  return data.token;
};

/** @param {{ storeHash: string, accessToken: string, channelId: number, customerImpersonationToken: string }} env */
const logEnv = ({
  storeHash,
  accessToken,
  channelId,
  customerImpersonationToken,
}) => {
  console.log(`\nBIGCOMMERCE_STORE_HASH=${storeHash}`);
  console.log(`BIGCOMMERCE_ACCESS_TOKEN=${accessToken}`);
  console.log(`BIGCOMMERCE_CHANNEL_ID=${channelId}`);
  console.log(
    `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN=${customerImpersonationToken}`
  );
};

const setup = async () => {
  const storeHash = await promptStoreHash();
  const accessToken = await promptAccessToken();

  const channelId = await getChannelId({ storeHash, accessToken });

  await assignChannelSite({ storeHash, accessToken, channelId });

  const customerImpersonationToken = await promptCustomerImpersonationToken({
    storeHash,
    accessToken,
    channelId,
  });

  logEnv({ storeHash, accessToken, channelId, customerImpersonationToken });
};

setup();
