const AWS = require('aws-sdk');
const envParams = require('../config/aws-config');
const REGION = envParams.REGION;

AWS.config.update({
    region: REGION,
});

AWS.config.credentials = new AWS.EC2MetadataCredentials({
    httpOptions: { timeout: 5000 },
    maxRetries: 10,
    retryDelayOptions: { base: 200 }
})

module.exports = AWS;