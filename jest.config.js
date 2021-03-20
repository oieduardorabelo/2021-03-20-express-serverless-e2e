module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/cases/**/*"],
  setupFilesAfterEnv: [
    "<rootDir>/src/__tests__/config/setup-files-after-env.js",
  ],
};
