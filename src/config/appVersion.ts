export const getAppVersion = (): string => {
  return process.env.APP_VERSION || process.env.npm_package_version || '1.0.0';
};
