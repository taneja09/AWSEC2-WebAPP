const auth = require('basic-auth');
const compare = require('tsscmp');
const saltRounds = 10;
var models = require('../models');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const util = require('./aws-client-fileUpload');
const AppLogger = require('../app-logs/loggerFactory');
const logger = AppLogger.defaultLogProvider("Bill-controller");
const Billmetrics = require('../app-metrics/metricsFactory');
const timecalculator = require('./timingController');


exports.create = (req, res) => {
    Billmetrics.increment("Bill.POST.addBill");
    var apiStartTime = timecalculator.TimeInMilliseconds();
    var credentials = auth(req);
    if (!credentials) {
        logger.error("No authorization credentials found in request");
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
        res.end('Access denied')
    } else {
        var username = credentials.name;
        var password = credentials.pass;
        models.User.findAll({
                where: {
                    email_address: username
                }
            }).then(function(result) {
                var valid = true;
                valid = bcrypt.compareSync(password, result[0].password) && valid;
                if (valid) {
                    var uuid = uuidv4();
                    var vendor = req.body.vendor;
                    var amount_due = req.body.amount_due;
                    var categories = req.body.categories;
                    var categoriesSet = new Set(categories);
                    var categoriesString = categories.join();
                    var paymentStatus = req.body.paymentStatus;
                    var bill_date = req.body.bill_date;
                    var due_date = req.body.due_date;
                    var owner_id = result[0].id;
                    var datevalts = new Date();
                    datevalts = datevalts.toISOString();
                    var paymentStatusSet = new Set(["paid", "due", "past_due", "no_payment_required"]);
                    var dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
                    var fileAttached = JSON.stringify(req.body.attachment) == "{}" ? null : req.body.attachment;

                    if (!vendor || !bill_date || !due_date || !amount_due || !categoriesString || !paymentStatus) {
                        res.status(400).send({
                            Message: "Please provide all required fields - vendor, bill_date, due_date, amount_due, categories, paymentStatus !"
                        });

                    } else if (isNaN(amount_due) || amount_due < 0.01 ) {
                        res.status(400).send({
                            Message: "Please enter correct amount in double and it should be greater than 0.01 "
                        });
                    }else if(!paymentStatusSet.has(paymentStatus)){
                        res.status(400).send({
                            Message: "Please provide correct payment status from the following - paid, due, past_due, no_payment_required"
                        });
                    }else if(categoriesSet.size != categories.length){
                        res.status(400).send({
                            Message: "Please provide unique categories ! Duplicates are not allowed."
                        });
                    }else if(!(dateRegex.test(bill_date)) || !(dateRegex.test(due_date))){
                        res.status(400).send({
                            Message: "Please provide valid due date and bill date."
                        });
                    } 
                    else {
                        var DBQueryStartTime = timecalculator.TimeInMilliseconds();
                        amount_due = amount_due.toFixed(2);
                        models.Bill.create({
                            id: uuid,
                            created_ts: datevalts,
                            updated_ts: datevalts,
                            owner_id: owner_id,
                            vendor: vendor,
                            bill_date: bill_date,
                            due_date: due_date,
                            amount_due: amount_due,
                            categories: categoriesString,
                            paymentStatus: paymentStatus,
                            attachment: fileAttached
                        }).then(function(Bill) {
                            logger.info("Bill created successfully");
                            var apiEndTime = timecalculator.TimeInMilliseconds();
                            Billmetrics.timing("Bill.POST.DBQueryComplete",apiEndTime-DBQueryStartTime);
                            Billmetrics.timing("Bill.POST.APIComplete",apiEndTime-apiStartTime);
                            res.status(201).send(Bill);
                        }).catch(function(err){
                            logger.error("Couldn't create Bill due to some issue");
                            res.status(400).send("Issue while creating Bill !");
                        });
                    }
                } else {
                    logger.error("User unauthorized");
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                }
            })
            .catch(function(err) {
                logger.error("User doesn't exist in system");
                res.statusCode = 401
                res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                res.end('Access denied')
            });
    }
}

exports.viewAllBills = (req, res) => {
    Billmetrics.increment("Bill.GET.viewAllBills");
    var apiStartTime = timecalculator.TimeInMilliseconds();
    var credentials = auth(req);
    if (!credentials) {
        logger.error("No authorization credentials found in request");
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
        res.end('Access denied')
    } else {
        var username = credentials.name;
        var password = credentials.pass;
        models.User.findAll({
                where: {
                    email_address: username
                }
            }).then(function(result) {
                var valid = true;
                valid = bcrypt.compareSync(password, result[0].password) && valid;
                if (valid) {
                    var DBQueryStartTime = timecalculator.TimeInMilliseconds();
                    models.Bill.findAll({
                        where: {
                            owner_id: result[0].id
                        }
                    }).then(function(UserBills){
                        logger.info("Bills found in system");
                        var apiEndTime = timecalculator.TimeInMilliseconds();
                        Billmetrics.timing("Bill.GETALL.DBQueryComplete",apiEndTime-DBQueryStartTime);
                        Billmetrics.timing("Bill.GETALL.APIComplete",apiEndTime-apiStartTime);
                        res.status(200).send(UserBills);
                    }).catch(function(err){
                        logger.info("Bills coudn't be found due to some issue");
                        console.log(err);
                    });

                }else{
                    logger.error("User unauthorized");
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                }

            }).catch(function(err){
                logger.error("User doesn't exist in system");
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
            });

        }   

    }

    exports.getBill = (req, res) => {
        Billmetrics.increment("Bill.GET.viewBill");
        var apiStartTime = timecalculator.TimeInMilliseconds();
        var credentials = auth(req);
        if (!credentials) {
            logger.error("No authorization credentials found in request");
            res.statusCode = 401
            res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
            res.end('Access denied')
        } else {
            var username = credentials.name;
            var password = credentials.pass;
            var billId = req.url.split("/")[3];
            models.User.findAll({
                where: {
                    email_address: username
                }
            }).then(function(result) {
                var valid = true;
                valid = bcrypt.compareSync(password, result[0].password) && valid;
                if (valid) {
                    var DBQueryStartTime = timecalculator.TimeInMilliseconds();
                    models.Bill.findOne({
                        where: {
                            id: billId,
                            owner_id: result[0].id
                        }
                    }).then(function(UserBill) {
                        if (UserBill){
                            logger.info("Bill details found in system");
                            var apiEndTime = timecalculator.TimeInMilliseconds();
                            Billmetrics.timing("Bill.GET.DBQueryComplete",apiEndTime-DBQueryStartTime);
                            Billmetrics.timing("Bill.GET.APIComplete",apiEndTime-apiStartTime);
                            res.status(200).send(UserBill);
                        }
    
                        else{
                            logger.error("Bill details coudn't be found in system");
                            res.status(404).end();
                        }
    
                    }).catch(function(err) {
                        logger.error("Error occured finding the bill details");
                        console.log(err);
                    });
    
                } else {
                    logger.error("User unauthorized");
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                }
            }).catch(function(err) {
                logger.error("User doesn't exist in system");
                res.statusCode = 401
                res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                res.end('Access denied')
            });
    
        }
    
    }

    exports.updateBill = (req, res) => {
        Billmetrics.increment("Bill.PUT.updateBill");
        var apiStartTime = timecalculator.TimeInMilliseconds();
            var credentials = auth(req);
            if (!credentials) {
                logger.error("No authorization credentials found in request");
                res.statusCode = 401
                res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                res.end('Access denied')
            } else {
                var username = credentials.name;
                var password = credentials.pass;
                var billId = req.url.split("/")[3];
                models.User.findAll({
                        where: {
                            email_address: username
                        }
                    }).then(function(result) {
                        var valid = true;
                        valid = bcrypt.compareSync(password, result[0].password) && valid;
                        if (valid) {
        
                            var vendor = req.body.vendor;
                            var amount_due = req.body.amount_due;
                            var categories = req.body.categories;
                            var categoriesSet = new Set(categories);
                            var categoriesString = categories.join();
                            var paymentStatus = req.body.paymentStatus;
                            var bill_date = req.body.bill_date;
                            var due_date = req.body.due_date;
                            var datevalts = new Date();
                            datevalts = datevalts.toISOString();
                            var paymentStatusSet = new Set(["paid", "due", "past_due", "no_payment_required"]);
                            var dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
                            var id = req.body.id;
                            var created_ts = req.body.created_ts;
                            var updated_ts = req.body.updated_ts;
                            var owner_id = req.body.owner_id;
        
                            if (!vendor || !bill_date || !due_date || !amount_due || !categoriesString || !paymentStatus) {
                                res.status(400).send({
                                    Message: "Please provide all required fields - vendor, bill_date, due_date, amount_due, categories, paymentStatus !"
                                });
        
                            } else if(id || created_ts || updated_ts || owner_id){
                                res.status(400).send({
                                    Message: "Please remove any other field apart from  - vendor, bill_date, due_date, amount_due, categories, paymentStatus !"
                                });
                            }else if (isNaN(amount_due) || amount_due < 0.01 ) {
                                res.status(400).send({
                                    Message: "Please enter correct amount in double and it should be greater than 0.01 "
                                });
                            }else if(!paymentStatusSet.has(paymentStatus)){
                                res.status(400).send({
                                    Message: "Please provide correct payment status from the following - paid, due, past_due, no_payment_required"
                                });
                            }else if(categoriesSet.size != categories.length){
                                res.status(400).send({
                                    Message: "Please provide unique categories ! Duplicates are not allowed."
                                });
                            }else if(!(dateRegex.test(bill_date)) || !(dateRegex.test(due_date))){
                                res.status(400).send({
                                    Message: "Please provide valid due date and bill date."
                                });
                            }  else {
                                amount_due = amount_due.toFixed(2);
                                var DBQueryStartTime = timecalculator.TimeInMilliseconds();
                                models.Bill.update({
                                    updated_ts: datevalts,
                                    vendor: vendor,
                                    bill_date: bill_date,
                                    due_date: due_date,
                                    amount_due: amount_due,
                                    categories: categoriesString,
                                    paymentStatus: paymentStatus
                                }, {
                                    where: {
                                        id: billId,
                                        owner_id: result[0].id
                                    }
                                }).then(function(BillUpdate) {
                                    if (BillUpdate[0] > 0) {
                                        models.Bill.findOne({
                                            where: {
                                                id: billId
                                            }
                                        }).then(function(updatedBill) {
                                            logger.info("Bill details updated in system");
                                            var apiEndTime = timecalculator.TimeInMilliseconds();
                                            Billmetrics.timing("Bill.PUT.DBQueryComplete",apiEndTime-DBQueryStartTime);
                                            Billmetrics.timing("Bill.PUT.APIComplete",apiEndTime-apiStartTime);
                                            res.status(200).send(updatedBill);
                                        }).catch(function(err) {
                                            logger.error("Couldn't update Bill details");
                                            console.log(err);
                                        });
                                    } else {
                                        logger.info("Bill didn't get updated");
                                        res.status(404).end();
                                    }
                                }).catch(function(err) {
                                    logger.error("Error occured while updating Bill");
                                    res.status(400).send("Issue while updating the Bill !");
                                });
                            }
                        } else {
                            logger.error("User unauthorized");
                            res.statusCode = 401
                            res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                            res.end('Access denied')
                        }
                    })
                    .catch(function(err) {
                        //console.log(err);
                        logger.error("User doesn't exist in system");
                        res.statusCode = 401
                        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                        res.end('Access denied')
                    });
            }
        }

        exports.deleteBill = (req, res) => {
            Billmetrics.increment("Bill.DEL.deleteBill");
            var apiStartTime = timecalculator.TimeInMilliseconds();
            var credentials = auth(req);
            if (!credentials) {
                logger.error("No authorization credentials found in request");
                res.statusCode = 401
                res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                res.end('Access denied')
            } else {
                var username = credentials.name;
                var password = credentials.pass;
                var billId = req.url.split("/")[3];
                if(billId.lengh === 0){
                    res.status(400).send("Please provide a valid Bill id to delete !");
                }
                else{
                models.User.findAll({
                    where: {
                        email_address: username
                    }
                }).then(function(result) {
                    var valid = true;
                    valid = bcrypt.compareSync(password, result[0].password) && valid;
                    if (valid) {
                        var DBQueryStartTime = timecalculator.TimeInMilliseconds();
                        models.Bill.findAll({
                            where: {
                                id: billId,
                                owner_id: result[0].id
                            }
                        }).then(function (Bill) {
                            logger.info("Bill tagged for deletion");
                            if (Bill[0].attachment) {
                                    let filePath = Bill[0].attachment.file_name;
                                    util.deleteFromS3(filePath,function(Data) {
                                        logger.info("Associated file deleted for thsi Bill");
                                });
                            }
                            models.Bill.destroy({
                                where: {
                                    id: billId,
                                    owner_id: result[0].id
                                }
                            }).then(function (UserBill) {
                                if (UserBill > 0){
                                    logger.info("Bill deleted Successfully");
                                    var apiEndTime = timecalculator.TimeInMilliseconds();
                                    Billmetrics.timing("Bill.DEL.DBQueryComplete",apiEndTime-DBQueryStartTime);
                                    Billmetrics.timing("Bill.DEL.APIComplete",apiEndTime-apiStartTime);
                                    res.status(204).end();
                                }
                                else{
                                    logger.warn("Couldn't find bill to delete");
                                    res.status(404).end();
                                }

                            }).catch(function (err) {
                                logger.error("Issue while deleting the Bill");
                                console.log(err);
                            });
                        }).catch(function (err) {
                            logger.warn("Couldn't find bill to delete");
                            res.status(404).send("Bill Not Found !!")
                        });
                    }else {
                        logger.error("User unauthorized");
                        res.statusCode = 401
                        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                        res.end('Access denied')
                    }
                }).catch(function(err) {
                    logger.error("User doesn't exist in system");
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                });
        
             }

            }
        
        };