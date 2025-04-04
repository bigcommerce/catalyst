import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
const REGION = "us-east-1"
export async function generateEnvConfig() {

  const client = new SecretsManagerClient({ region: REGION });

  const res = await client.send(
    new GetSecretValueCommand({
      SecretId: "<SECRET_NAME>",
    }),
  );
  if (!res.SecretString) {
    throw new Error("❌ SecretString is empty or undefined");
  }

  const parsed = JSON.parse(res.SecretString);
  // console.log("✅ Parsed secrets:", parsed);

  return parsed;
}
