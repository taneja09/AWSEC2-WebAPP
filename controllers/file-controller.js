const auth = require('basic-auth');
var models = require('../models');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
var shortid = require('shortid');
const fs = require('fs');
const util = require('./aws-client-fileUpload');
const AppLogger = require('../app-logs/loggerFactory');
const logger = AppLogger.defaultLogProvider("File-controller");

exports.create = (req, res) => {
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

        if (!billId) {
            logger.error("No Bill Id found in request");
            res.status(400).send({
                Message: "Please provide corrcet Bill Id !!"
            });
        }
        models.User.findAll({
            where: {
                email_address: username
            }
        }).then(function(User) {
            var valid = true;
            valid = bcrypt.compareSync(password, User[0].password) && valid;
            if (valid) {
                models.Bill.findAll({
                    where: {
                        id: billId,
                        owner_id: User[0].id
                    }
                }).then(function(Bill) {
                    if (Bill[0].attachment) {
                        logger.error("Bill already has a file attached, can't duplicate entry");
                        res.status(400).send("Bill already has a file attached, please delete that before uploading a new File !");
                    } else {
                        var uuid = uuidv4();
                        var nameUUID = shortid.generate();
                        var file = req.files.file;
                        var file_name = nameUUID+"_"+file.name;
                        var upload_date = new Date().toISOString().split('T')[0];
                        var billId = Bill[0].id;
                        var metaDataObj = {
                            size: file.size,
                            encoding: file.encoding,
                            mimetype: file.mimetype,
                            md5: file.md5
                        }
                        
                        util.uploadToS3(file,file_name, function(Data) {
                            logger.info("File successfully uploaded to S3 Bucket");
                            models.File.create({
                                id: uuid,
                                file_name: file_name,
                                url: Data.Location,
                                upload_date: upload_date,
                                bill_id: billId,
                                metaData: metaDataObj

                            }).then(function(File) {
                                logger.info("Successful added file record");
                                File.bill_id = undefined;
                                File.metaData = undefined;
                                models.Bill.update({
                                    attachment: File
                                }, {
                                    where: {
                                        id: billId,
                                        owner_id: User[0].id
                                    }
                                }).then(function(BillUpdate) {
                                    logger.info("Successful updated bill with attached file details");
                                    res.status(201).send(File);
                                }).catch(function(err) {
                                    logger.error("Couldn't updated Bill for file details");
                                    res.status(400).send("Issue while updating the Bill !");
                                });
                            }).catch(function(err) {
                                logger.error("Issue while adding file for provided Bill");
                                res.status(400).send("Issue while uploading File !");
                            });
                        });
                    }
                }).catch(function(err) {
                    logger.error("Bill doesn't exist in system");
                    res.status(404).send("Bill is not found !");
                });

            }
        }).catch(function(err) {
            logger.error("User doesn't exist in system");
            res.statusCode = 401
            res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
            res.end('Access denied')
        });

    }

}

exports.getFile = (req, res) => {
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
        var fileId = req.url.split("/")[5];

        if (!billId || !fileId) {
            logger.error("Bill Id or File Id Not found in request");
            res.status(404).send({
                Message: "Please provide corrcet Bill Id and File Id !!"
            });
        }
        models.User.findAll({
            where: {
                email_address: username
            }
        }).then(function(User) {
            var valid = true;
            valid = bcrypt.compareSync(password, User[0].password) && valid;
            if (valid) {
                models.Bill.findOne({
                    where: {
                        id: billId,
                        owner_id: User[0].id
                    }
                }).then(function(UserBill) {
                    if (UserBill) {
                        models.File.findOne({
                            where: {
                                id: fileId,
                                bill_id: billId
                            }
                        }).then(function(File) {
                            File.bill_id = undefined;
                            File.metaData = undefined;
                            logger.info("Found file details");
                            res.status(200).send(File);
                        }).catch(function(err) {
                            logger.error("File details not found");
                            res.status(404).send("Bill is not found !");
                        });
                    } else{
                        logger.warn("Bill details not found");
                        res.status(404).end();
                    }

                }).catch(function(err) {
                    logger.error("Issue while finding Bill");
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


exports.deleteFile = (req, res) => {
    var credentials = auth(req);
    if (!credentials) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
        res.end('Access denied')
    } else {
        var username = credentials.name;
        var password = credentials.pass;
        var billId = req.url.split("/")[3];
        var fileId = req.url.split("/")[5];

        if (!billId || !fileId) {
            logger.error("Bill Id or File Id Not found in request");
            res.status(404).send({
                Message: "Please provide corrcet Bill Id and File Id !!"
            });
        } else {
            models.User.findAll({
                where: {
                    email_address: username
                }
            }).then(function(User) {
                var valid = true;
                valid = bcrypt.compareSync(password, User[0].password) && valid;
                if (valid) {
                    models.Bill.findOne({
                        where: {
                            id: billId,
                            owner_id: User[0].id
                        }
                    }).then(function(UserBill) {
                        if (UserBill) {
                            models.File.findOne({
                                where: {
                                    id: fileId,
                                    bill_id: billId
                                }
                            }).then(function(FileRet) {
                                var filePath = FileRet.file_name;
                                util.deleteFromS3(filePath,function(Data) {
                                    logger.info("Deleted File from S3 Bucket");
                                        models.File.destroy({
                                            where: {
                                                id: fileId,
                                                bill_id: billId
                                            }
                                        }).then(function(DelFile) {
                                            if (DelFile > 0) {
                                                logger.info("Deleted File record from system");
                                                models.Bill.update({
                                                    attachment: null
                                                }, {
                                                    where: {
                                                        id: billId,
                                                        owner_id: User[0].id
                                                    }
                                                }).then(function(BillUpdate) {
                                                    logger.info("Updated Bill record after file deletion");
                                                    res.status(204).end();
                                                }).catch(function(err) {
                                                    console.log(err);
                                                    logger.error("Couldn't Update Bill record after file deletion");
                                                    res.status(400).send("Issue while updating the Bill after file deletion !");
                                                });
                                            } else{
                                                logger.war("File record is not found");
                                                res.status(404).end();
                                            }
                                        }).catch(function(err) {
                                            logger.error("Issue while deleting the file record");
                                            res.status(400).send("Issue while destroying file record. !");
                                        });
                                    })
                            }).catch(function(err) {
                                logger.error("File not found");
                                res.status(404).send("file record doesn't exist !!")
                            });
                        } else {
                            logger.error("Bill not found");
                            res.status(404).end();
                        }

                    }).catch(function(err) {
                        logger.error("Issue while finding Bill");
                        res.status(404).send("Bill record doesn't exist !!")
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

}