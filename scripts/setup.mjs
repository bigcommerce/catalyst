import { input } from "@inquirer/prompts";

/** @returns {Promise<string>} */
const promptName = async () => input({ message: "What is your name?" });

const connect = async () => {
  const name = await promptName();

  console.log(`Hello, ${name}!`);
};

connect();
