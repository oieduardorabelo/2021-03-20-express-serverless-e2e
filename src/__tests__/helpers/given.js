let aws = require("aws-sdk");
let chance = require("chance").Chance();

let {
  ITEMS_TABLE,
  REGION,
  COGNITO_USER_POOL_ID,
  COGNITO_WEB_CLIENT_ID,
} = process.env;

let cognito = new aws.CognitoIdentityServiceProvider({
  region: REGION,
});
let dynamodb = new aws.DynamoDB.DocumentClient({ region: REGION });

async function anUserPoolWithUsers({ count }) {
  let users = [];

  let createUsers = Array.from({ length: count }, async () => {
    let username = chance.email();
    let user = await cognito
      .signUp({
        ClientId: COGNITO_WEB_CLIENT_ID,
        Password: username,
        Username: username,
      })
      .promise();
    users.push({ id: user.UserSub, Username: username, Password: username });
    await cognito
      .adminConfirmSignUp({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
      })
      .promise();
  });
  await Promise.all(createUsers);

  return {
    teardown: async () => {
      let tearUsers = users.map(async (user) => {
        let params = {
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: user.id,
        };
        await cognito.adminDeleteUser(params).promise();
      });
      await Promise.all(tearUsers);
    },
  };
}

async function anItemsTableWith({ count }) {
  let items = [];

  let putItems = Array.from({ length: count }, async () => {
    let item = {
      id: chance.guid(),
      text: chance.sentence(),
    };
    let params = {
      TableName: ITEMS_TABLE,
      Item: item,
    };
    items.push(item);
    await dynamodb.put(params).promise();
  });
  await Promise.all(putItems);

  return {
    data: items,
    teardown: async () => {
      let tearItems = items.map(async (item) => {
        let params = {
          TableName: ITEMS_TABLE,
          Key: {
            id: item.id,
          },
          ReturnValues: "ALL_OLD",
        };
        await dynamodb.delete(params).promise();
      });
      await Promise.all(tearItems);
    },
  };
}

module.exports = { anUserPoolWithUsers, anItemsTableWith };
