import { input } from "@inquirer/prompts";

/** @returns {Promise<string>} */
const promptStoreHash = async () =>
  input({ message: "Please enter your store hash" });

/** @param {{ storeHash: string }} config */
const logEnv = ({ storeHash }) => {
  console.log(`\nBIGCOMMERCE_STORE_HASH=${storeHash}`);
};

const setup = async () => {
  const storeHash = await promptStoreHash();

  logEnv({ storeHash });
};

setup();
