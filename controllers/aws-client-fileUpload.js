
const AWS = require('aws-sdk');
const envParams = require('../config/aws-config');

const ACCESS_KEY = envParams.AWS_ACCESS_KEY;
const ACCESS_KEY_SECRET = envParams.AWS_SECRET_ACCESS_KEY;
const REGION = envParams.REGION;
const BUCKET = envParams.BUCKET;

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: ACCESS_KEY_SECRET,
    region: REGION,
});

function uploadToS3(file, callback) {
    let s3bucket = new AWS.S3({
      accessKeyId: ACCESS_KEY,
      secretAccessKey: ACCESS_KEY_SECRET,
      Bucket: BUCKET
    });

    const params = {
        Bucket: BUCKET,
        Key:file.name,
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
      accessKeyId: ACCESS_KEY,
      secretAccessKey: ACCESS_KEY_SECRET,
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