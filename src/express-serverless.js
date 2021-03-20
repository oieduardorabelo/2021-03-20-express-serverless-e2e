let serverless = require("serverless-http");

let { server } = require("./server");

let handler = serverless(server);

module.exports = { handler };
