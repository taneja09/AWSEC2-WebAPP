const auth = require('basic-auth');
const compare = require('tsscmp');
const saltRounds = 10;
var models = require('../models');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const util = require('./aws-client-fileUpload');


exports.create = (req, res) => {
    var credentials = auth(req);
    if (!credentials) {
        console.log("hello");
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
                            res.status(201).send(Bill);
                        }).catch(function(err){
                            res.status(400).send("Issue while creating Bill !");
                        });
                    }
                } else {
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                }
            })
            .catch(function(err) {
                console.log(err);
                res.statusCode = 401
                res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                res.end('Access denied')
            });
    }
}

exports.viewAllBills = (req, res) => {
    var credentials = auth(req);
    if (!credentials) {
        console.log("hello");
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
                    models.Bill.findAll({
                        where: {
                            owner_id: result[0].id
                        }
                    }).then(function(UserBills){
                        res.status(200).send(UserBills);
                    }).catch(function(err){
                        console.log(err);
                    });

                }else{
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                }

            }).catch(function(err){
                res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
            });

        }   

    }

    exports.getBill = (req, res) => {
        var credentials = auth(req);
        if (!credentials) {
            console.log("hello");
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
                    models.Bill.findOne({
                        where: {
                            id: billId,
                            owner_id: result[0].id
                        }
                    }).then(function(UserBill) {
                        if (UserBill)
                            res.status(200).send(UserBill);
    
                        else
                            res.status(404).end();
    
                    }).catch(function(err) {
                        console.log(err);
                    });
    
                } else {
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                }
            }).catch(function(err) {
                res.statusCode = 401
                res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                res.end('Access denied')
            });
    
        }
    
    }

    exports.updateBill = (req, res) => {
            var credentials = auth(req);
            if (!credentials) {
                console.log("hello");
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
                                            res.status(200).send(updatedBill);
                                        }).catch(function(err) {
                                            console.log(err);
                                        });
                                    } else {
                                        res.status(404).end();
                                    }
                                }).catch(function(err) {
                                    console.log(err);
                                    res.status(400).send("Issue while updating the Bill !");
                                });
        
                            }
                        } else {
                            res.statusCode = 401
                            res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                            res.end('Access denied')
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                        res.statusCode = 401
                        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                        res.end('Access denied')
                    });
            }
        }

        exports.deleteBill = (req, res) => {
            var credentials = auth(req);
            if (!credentials) {
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
                        models.Bill.findAll({
                            where: {
                                id: billId,
                                owner_id: result[0].id
                            }
                        }).then(function (Bill) {
                            if (Bill[0].attachment) {
                                    let filePath = Bill[0].attachment.file_name;
                                    util.deleteFromS3(filePath,function(Data) {
                                });
                            }
                            models.Bill.destroy({
                                where: {
                                    id: billId,
                                    owner_id: result[0].id
                                }
                            }).then(function (UserBill) {
                                if (UserBill > 0)
                                    res.status(204).end();
                                else
                                    res.status(404).end();

                            }).catch(function (err) {
                                console.log(err);
                            });
                        }).catch(function (err) {
                            res.status(404).send("Bill Not Found !!")
                        });
                    }else {
                        res.statusCode = 401
                        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                        res.end('Access denied')
                    }
                }).catch(function(err) {
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
                    res.end('Access denied')
                });
        
             }

            }
        
        };