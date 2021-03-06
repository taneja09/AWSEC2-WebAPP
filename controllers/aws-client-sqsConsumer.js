const AWS = require('../config/aws-creds');
const {Consumer} = require('sqs-consumer');
var models = require('../models');
const {Op} = require("sequelize");
const AppLogger = require('../app-logs/loggerFactory');
const logger = AppLogger.defaultLogProvider("sqsConsumer-controller");
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const sns = new AWS.SNS({apiVersion: 'latest'});
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

//Email Address Domain
var EDomain = process.env.SourceEmail;
logger.info("Found source Email "+ EDomain);

var SNSTopicArn = process.env.SNSTopicArn;
var queueUrl = process.env.SQSQueryURL;
var DNS = process.env.DNSName;

logger.info("Found source SQS Url "+ queueUrl);
logger.info("Found source SNS Topic "+ SNSTopicArn);
logger.info("Found source DNS "+ DNS);

const consumeSQS = Consumer.create({
    queueUrl: queueUrl,
    handleMessage: async (message) => {
        //Retrieve content from SQS queue
        var bodyContent = JSON.parse(message.Body);
        var billDueDays = parseInt(bodyContent.BillDaysDue);
        var billOwner = bodyContent.BillOwner;
        var emailAddress = bodyContent.BillOwnerEmail;

        logger.info("SQS Consumer received message from API request");

        var fromDate = new Date(); //Current date
        var BillDueDate = new Date();
        BillDueDate.setDate(BillDueDate.getDate() + billDueDays); //Date till which User need due Bills

        if (checkForTokenExist(billOwner, function(data) { //Check if the same user has already existing token in dynmodb
                logger.info("Token is not present in dynamo db");
                models.Bill.findAll({ //If not find due bills and send to SNS
                    where: {
                        owner_id: billOwner,
                        paymentStatus: 'due',
                        due_date: {
                            [Op.between]: [fromDate, BillDueDate]
                        }
                    }
                }).then(function(UserBills) {
                    jsonObj = [];
                    var obj = {};
                    for (var i = 0; i < UserBills.length; i++) {
                        DueBillUrls = "https://" + DNS+"/v1/bill/"+UserBills[i].dataValues.id;
                        jsonObj.push(DueBillUrls);
                    }
                    //console.log(jsonObj);
                    obj['data'] = jsonObj; // All Bills
                    obj['email'] = emailAddress; //email address to send details
                    obj['ownerId'] = billOwner; //Id for dynamodb
                    obj['domain'] = EDomain; //dev/prod domain

                    //console.log(obj);
                    var params = {
                        Message: JSON.stringify(obj),
                        TopicArn: SNSTopicArn
                    };

                    //publish details to SNS to trigger Lambda Function
                    sns.publish(params, function(err, data) {
                        if (err) {
                            logger.error("Issue : SNS Data published");
                            console.error(err);
                        } else {
                            logger.info("SNS Data published");
                            console.log("SNS Publish Data \n" + data);
                        }
                    });
                }).catch(function(err) {
                    logger.error("Issue : while retriving the bills for user");
                    console.log(err);
                });
            }));
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

function checkForTokenExist(billOwner, callback) { //Check if the token exist in dynamodb
    const param = {
        TableName: "UserBillsDue",
        Key: {
            User_Id: billOwner
        }
    }
    documentClient.get(param, (err, data) => {
        if (err) {
            logger.error("DB access issue to check token");
            console.error(err);
        } else if (!data.Item) {
            logger.info("Token found in dynamo db");
            callback(data);
        }
    });

}

module.exports = consumeSQS;