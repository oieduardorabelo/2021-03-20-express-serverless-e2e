let aws = require("aws-sdk");
let express = require("express");

let { ITEMS_TABLE, REGION, COGNITO_USER_POOL_ID } = process.env;

let dynamodb = new aws.DynamoDB.DocumentClient({ region: REGION });
let cognito = new aws.CognitoIdentityServiceProvider({ region: REGION });

let server = express();

server.use(express.json());

server.get("/", (_req, res) => {
  res.status(200).json({ ok: true, payload: { uptime: process.uptime() } });
});

server.get("/users", (req, res) => {
  let { limit = 16 } = req.query;

  if (limit > 16) {
    return res
      .status(400)
      .send({ ok: false, payload: null, error: "Max limit is 16" });
  }

  let params = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Limit: limit,
  };
  cognito
    .listUsers(params)
    .promise()
    .then((data) => {
      res.status(200).send({ ok: true, payload: { users: data.Users } });
    })
    .catch((err) => {
      res.status(500).send({ ok: false, payload: null, error: err });
    });
});

server.post("/items", (req, res) => {
  let item = { ...req.body };
  item.id = `${Date.now()}${Math.random().toString(16).slice(2)}`;
  let params = {
    TableName: ITEMS_TABLE,
    Item: item,
  };
  dynamodb
    .put(params)
    .promise()
    .then(() => {
      res.send({ ok: true, payload: item });
    })
    .catch((err) => {
      res.send({ ok: false, payload: null, error: err });
    });
});

server.get("/items/:id", (req, res) => {
  let params = {
    TableName: ITEMS_TABLE,
    Key: {
      id: req.params.id,
    },
  };
  dynamodb
    .get(params)
    .promise()
    .then((data) => {
      res.send({ ok: true, payload: data.Item });
    })
    .catch((err) => {
      console.log(err, params);
      res.send({ ok: false, payload: null, error: err });
    });
});

server.delete("/items/:id", (req, res) => {
  let params = {
    TableName: ITEMS_TABLE,
    Key: {
      id: req.params.id,
    },
    ReturnValues: "ALL_OLD",
  };
  dynamodb
    .delete(params)
    .promise()
    .then((data) => {
      res.send({ ok: true, payload: data.Attributes });
    })
    .catch((err) => {
      console.log(err, params);
      res.send({ ok: false, payload: null, error: err });
    });
});

module.exports = { server };
