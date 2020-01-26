const auth = require('basic-auth');
const compare = require('tsscmp');
const saltRounds = 10;
var models = require('../models');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');


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
                    categories = categories.join();
                    var paymentStatus = req.body.paymentStatus;
                    var bill_date = req.body.bill_date;
                    var due_date = req.body.due_date;
                    var owner_id = result[0].id;
                    var datevalts = new Date();
                    datevalts = datevalts.toISOString();

                    if (!vendor || !bill_date || !due_date || !amount_due || !categories || !paymentStatus) {
                        res.status(400).send({
                            Message: "Please provide all required fields - vendor, bill_date, due_date, amount_due, categories, paymentStatus !"
                        });
                    } else if (isNaN(amount_due) || amount_due < 0.01) {
                        res.status(400).send({
                            Message: "Please enter correct amount and it should be greater than 0.01 "
                        });
                    } else {
                        models.Bill.create({
                            id: uuid,
                            created_ts: datevalts,
                            updated_ts: datevalts,
                            owner_id: owner_id,
                            vendor: vendor,
                            bill_date: bill_date,
                            due_date: due_date,
                            amount_due: amount_due,
                            categories: categories,
                            paymentStatus: paymentStatus
                        }).then(function(Bill) {
                            res.status(201).send(Bill);
                        }).catch(function(err) {
                            console.log(err);
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
                    models.Bill.findAll({
                        where: {
                            id: billId
                        }
                    }).then(function(UserBill) {
                        if (UserBill.length > 0)
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
                            categories = categories.join();
                            var paymentStatus = req.body.paymentStatus;
                            var bill_date = req.body.bill_date;
                            var due_date = req.body.due_date;
                            var datevalts = new Date();
                            datevalts = datevalts.toISOString();
        
                            if (!vendor || !bill_date || !due_date || !amount_due || !categories || !paymentStatus) {
                                res.status(400).send({
                                    Message: "Please provide all required fields - vendor, bill_date, due_date, amount_due, categories, paymentStatus !"
                                });
                            } else if (isNaN(amount_due) || amount_due < 0.01) {
                                res.status(400).send({
                                    Message: "Please enter correct amount and it should be greater than 0.01 "
                                });
                            } else {
                                models.Bill.update({
                                    updated_ts: datevalts,
                                    vendor: vendor,
                                    bill_date: bill_date,
                                    due_date: due_date,
                                    amount_due: amount_due,
                                    categories: categories,
                                    paymentStatus: paymentStatus
                                }, {
                                    where: {
                                        id: billId
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
                        models.Bill.destroy({
                            where: {
                                id: billId
                            }
                        }).then(function(UserBill) {
                            if (UserBill > 0)
                                res.status(204).end();
        
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