import { input, password } from "@inquirer/prompts";

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

/** @param {{ storeHash: string, accessToken: string }} config */
const logEnv = ({ storeHash, accessToken }) => {
  console.log(`\nBIGCOMMERCE_STORE_HASH=${storeHash}`);
  console.log(`BIGCOMMERCE_ACCESS_TOKEN=${accessToken}`);
};

const setup = async () => {
  const storeHash = await promptStoreHash();
  const accessToken = await promptAccessToken();

  logEnv({ storeHash, accessToken });
};

setup();
