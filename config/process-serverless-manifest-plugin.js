let fs = require("fs");
let path = require("path");

module.exports = async function processManifest(manifestData) {
  let stageName = Object.keys(manifestData);
  let { outputs } = manifestData[stageName];
  function getOutput(targetKey) {
    let match = outputs.find((item) => item.OutputKey === targetKey);
    if (match) {
      return match.OutputValue;
    } else {
      throw new Error(`Key [${targetKey}] doesn't exists.`);
    }
  }

  let toEnv = {
    API_GATEWAY_REST_API: getOutput("ServiceEndpoint"),
  };

  Object.keys(toEnv).forEach((key) => {
    let value = `\n${key}=${toEnv[key]}`;
    let envPath = path.join(__dirname, "..", ".env");
    fs.appendFileSync(envPath, value);
  });
};
