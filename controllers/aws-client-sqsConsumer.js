const AWS = require('aws-sdk');
const envParams = require('../config/aws-config');
const queueUrl = "https://sqs.us-east-1.amazonaws.com/358073346779/BillQueue";
const {Consumer} = require('sqs-consumer');
var models = require('../models');
const {Op} = require("sequelize");

AWS.config.update({
    region: envParams.REGION,
    accessKeyId: envParams.accessKeyId,
    secretAccessKey: envParams.secretAccessKey
});

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
});
const sns = new AWS.SNS({
    apiVersion: 'latest'
});
//const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1"
});

const consumeSQS = Consumer.create({
            queueUrl: queueUrl,
            handleMessage: async (message) => {
                //Retrieve content from SQS queue
                var bodyContent = JSON.parse(message.Body);
                var billDueDays = parseInt(bodyContent.BillDaysDue);
                var billOwner = bodyContent.BillOwner;
                var emailAddress = bodyContent.BillOwnerEmail;

                var fromDate = new Date();   //Current date
                var BillDueDate = new Date();
                BillDueDate.setDate(BillDueDate.getDate() + billDueDays); //Date till which User need due Bills

                if (checkForTokenExist(billOwner, function(data) {  //Check if the same user has already existing token in dynmodb
                        models.Bill.findAll({                      //If not find due bills and send to SNS
                            where: {
                                owner_id: billOwner,
                                paymentStatus: 'due',
                                due_date: {
                                    [Op.between]: [fromDate, BillDueDate]
                                },
                            }
                        }).then(function(UserBills) {
                            jsonObj = [];
                            var obj = {};
                            for (var i = 0; i < UserBills.length; i++) {
                                jsonObj.push(UserBills[i].dataValues);
                            }
                            //console.log(jsonObj);
                            obj['data']=jsonObj;  // All Bills
                            obj['email'] = emailAddress; //email address to send details
                            obj['ownerId'] = billOwner;  //Id for dynamodb

                            //console.log(obj);
                            var params = {
                                Message: JSON.stringify(obj),
                                TopicArn: 'arn:aws:sns:us-east-1:358073346779:BillRequest'
                            };

                             //publish details to SNS to trigger Lambda Function
                            sns.publish(params, function(err, data) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.log("SNS Publish Data \n" + data);
                                }
                            });
                        }).catch(function(err) {
                            console.log(err);
                        });
                    })
                 );
                },
                //to configure sqs object with credentials
                sqs: sqs  
            }); 
            
            
        consumeSQS.on('error', (err) => {
            console.error(err.message);
        });

        consumeSQS.on('processing_error', (err) => {
            console.error(err.message);
        });

        consumeSQS.on('timeout_error', (err) => {
            console.error(err.message);
        });

        function checkForTokenExist(billOwner, callback) {  //Check if the token exist in dynamodb
            const param = {
                TableName: "UserBillsDue",
                Key: {
                    User_Id: billOwner
                }
            }
            documentClient.get(param, (err, data) => {
                if (err) {
                    console.error(err);
                } else if(!data.Item) {
                    callback(data);
                }
            });

        }

module.exports = consumeSQS;