export const checkNodeVersion = () => {
  const currentMajorNodeVersion = parseInt(process.versions.node.split('.')[0], 10);
  const minimumMajorNodeVersion = 18;

  if (currentMajorNodeVersion < minimumMajorNodeVersion) {
    console.error('ERR_UNSUPPORTED_NODE_VERSION');
    process.exit(1);
  }
};
