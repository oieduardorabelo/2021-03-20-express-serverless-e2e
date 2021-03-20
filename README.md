Serverless Express.js setup with Serverless Framework and End-to-End (E2E) testing with Supertest

- Express.js with serverless-http
- Amazon Cognito
- End-to-End (E2E) testing with Supertest

To deploy:

```bash
# aws credentials/profiles are located at "~/.aws/credentials"
npm install
AWS_PROFILE=<your-profile> npm run sls:deploy
```

Export AWS environment variables to `.env` to be used by your tests:

```bash
AWS_PROFILE=<your-profile> sls:export-env
```

Run End-to-End (E2E) tests:

```bash
AWS_PROFILE=<your-profile> npm test
```

**NOTE:** You don't need to set `AWS_PROFILE` every time. If you have the correct credentials globally in your terminal session, you can ignore/remove it.
