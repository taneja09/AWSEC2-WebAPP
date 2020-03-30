
const AWS = require('../config/aws-creds');
const envParams = require('../config/aws-config');

// const REGION = envParams.REGION;
const BUCKET = envParams.BUCKET;

// AWS.config.update({
//     region: REGION,
// });

// AWS.config.credentials = new AWS.EC2MetadataCredentials({
//     httpOptions: { timeout: 5000 },
//     maxRetries: 10,
//     retryDelayOptions: { base: 200 }
// })

function uploadToS3(file,file_name, callback) {
    let s3bucket = new AWS.S3({
      Bucket: BUCKET
    });

    const params = {
        Bucket: BUCKET,
        Key:file_name,
        Body:file.data
    }

     s3bucket.upload(params, function (err, data) {
        if (err) {
            console.log('error in callback');
            callback(err);
        }
        else{
            console.log('success');
            callback(data);
        }
    });

  }

  function deleteFromS3(file, callback) {
    let s3bucket = new AWS.S3({
      Bucket: BUCKET
    });

    const params = {
        Bucket: BUCKET,
        Key:file
    }

     s3bucket.deleteObject(params, function (err, data) {
        if (err) {
            console.log('error in callback');
            callback(err);
        }
        else{
            console.log('success');
            callback(data);
        }
    });

  }

  module.exports =  {uploadToS3,deleteFromS3}