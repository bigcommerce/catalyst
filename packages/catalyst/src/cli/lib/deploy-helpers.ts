export const parseEnvironmentVariables = (secretOption?: string[]) => {
  return secretOption?.map((envVar) => {
    const [key, value] = envVar.split('=');

    if (!key || !value) {
      throw new Error(`Invalid secret format: ${envVar}. Expected format: KEY=VALUE`);
    }

    return {
      type: 'secret' as const,
      key: key.trim(),
      value: value.trim(),
    };
  });
};
