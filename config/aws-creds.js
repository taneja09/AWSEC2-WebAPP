const AWS = require('aws-sdk');
const REGION = 'us-east-1';

AWS.config.update({
    region: REGION,
});

AWS.config.credentials = new AWS.EC2MetadataCredentials({
    httpOptions: { timeout: 5000 },
    maxRetries: 10,
    retryDelayOptions: { base: 200 }
})

module.exports = AWS;