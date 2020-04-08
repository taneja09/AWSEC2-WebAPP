# webapp

******* Billing & Invoicing System *******

API Impementation with `Node.js`
Programming language : `Javascript`

External Libraries used:
1. UUID - for generating id fields
2. Bcrypt - for hashing out the passwords
3. basic-auth - Authentication module 
4. tsscmp - comparing the values
5. Sequelize - ORM for Javascript
6. dotenv - to process the environment variables
7. mysql - dialect for sequelize 
8. mocha - for integration testing in java
9. fs - for file saving and removing file from server
10. express-fileupload - for file upload purpose

__Build & Deployment__
The application runs on AWS Cloud EC2 instance and is deployed via CircleCI pipe-line.
As sson as there is a merge take place to the webapp repository, the build gets triggered and deployment takes place in AWS account.

*Environemnt variables need to be configured in CircleCI pipeline are*

1. AWS_SECRET_KEY 
2. AWS_ACCESS_KEY
3. CODE_DEPLOY_BUCKET
4. AWS_REGION

**Command to import the SSL certificate for LoadBalancers**
`aws acm import-certificate --certificate fileb://prod_divyataneja_me.crt --private-key fileb://mykey.key --certificate-chain fileb://prod_divyataneja_me.ca-bundle`

**Run the appication locally**
=========================================

*Steps*
1. Clone the repos locally 
2. Install node modules - npm install
3. Local database variable need to be provided in config.js file
4. Provide the NODE_ENV=development to run appication with local database
5. Run following command  `node index.js NODE_ENV=development`

**Run the unit test cases**
`npm test`



