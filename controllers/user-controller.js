const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const compare = require('tsscmp');
const saltRounds = 10;
var models  = require('../models');
const uuidv4 = require('uuid/v4');
const AppLogger = require('../app-logs/loggerFactory');
const logger = AppLogger.defaultLogProvider("User-controller");
const Usermetrics = require('../app-metrics/metricsFactory');
const timecalculator = require('./timingController');

exports.create = (req, res) => {
	Usermetrics.increment("User.POST.adduser");
	var apiStartTime = timecalculator.TimeInMilliseconds();
	var uuid = uuidv4();
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var password = req.body.password;
	var email_address = req.body.email_address;
	var dateval = new Date();
	dateval = dateval.toISOString();

	var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	var charRegex = /^[A-Za-z.-]+(\s*[A-Za-z.-]+)*$/;
	var len = password.length;
	var validemail = emailRegex.test(email_address);
	var validfname = charRegex.test(first_name);
	var validlname = charRegex.test(last_name);

	if (!first_name || !last_name || !password || !email_address) {
		res.status(400).send({
			Message: "Please provide all required fields - first_name, last_name, password, email_address!"
		});
	}
	else if (len < 8 || len > 64) {
		res.status(400).send({
			Message: "Length of Password should be greater than 8 !"
		});
	} else if (!validemail) {
		res.status(400).send({
			Message: "Please enter a valid email address!"
		});
	} else if (!validfname) {
		res.status(400).send({
			Message: "Please enter a valid first_name with characters!"
		});
	} else if (!validlname) {
		res.status(400).send({
			Message: "Please enter a valid last_name with characters!"
		});
	} else {
		bcrypt.hash(password, saltRounds, function(err, hash) {
			if (err) {
				//console.log("Password can't be hashed !");
				logger.error("Couldn't store the Password !");
				
			} else {
                var User = models.User.build({
					id:uuid,
                    first_name : first_name,
	                last_name : last_name,
	                password : hash,
	                email_address : email_address,
                    account_created :dateval,
                    account_updated : dateval
				})
				var DBQueryStartTime = timecalculator.TimeInMilliseconds(); 
                User.save().then(function(err){
					console.log(User);
					logger.info("User created successfully");
					User.password = undefined;
					var apiEndTime = timecalculator.TimeInMilliseconds();
					Usermetrics.timing("User.POST.DBQueryComplete",apiEndTime-DBQueryStartTime);
					Usermetrics.timing("User.POST.APIComplete",apiEndTime-apiStartTime);
                    res.status(201).send(User);
                }).catch(function(err){
					logger.error("User already exist");
                    res.status(400).send("User with this email already exist");
                });
				
			}
        });
    }
}

exports.view = (req, res) => {
	Usermetrics.increment("User.GET.viewUser");
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
		var DBQueryStartTime = timecalculator.TimeInMilliseconds();      
        models.User.findAll({
            where: {
                email_address: username
              }
              }).then(function(result){
				var DBQueryEndTime = timecalculator.TimeInMilliseconds();  
                var valid = true;
                var UserFound;
                valid = compare(username, result[0].email_address) && valid;
                valid = bcrypt.compareSync(password, result[0].password) && valid;
                if (valid) {
					logger.info("User details found in system");
					UserFound = {
						id: result[0].id,
						first_name: result[0].first_name,
						last_name: result[0].last_name,
						email_address: result[0].email_address,
						account_created: result[0].account_created,
						account_updated: result[0].account_updated
					}
					res.statusCode = 200
					var apiEndTime = timecalculator.TimeInMilliseconds();
					Usermetrics.timing("User.GET.DBQueryComplete",DBQueryEndTime-DBQueryStartTime);
					Usermetrics.timing("User.GET.APIComplete",apiEndTime-apiStartTime);
					console.log(Usermetrics);
					res.send(UserFound);
				}else {
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

exports.update = (req, res) => {
	Usermetrics.increment("User.PUT.updateUser");
	var apiStartTime = timecalculator.TimeInMilliseconds();
	var credentials = auth(req);
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var password1 = req.body.password;
	var email_address = req.body.email_address;
	var account_created = req.body.account_created;
	var account_updated = req.body.account_updated;
	var id = req.body.id;
	var dateval = new Date();
	dateval = dateval.toISOString();

	if (!credentials) {
		logger.error("No authorization credentials found in request");
		res.statusCode = 401
		res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
		res.end('Access denied')
	} else if (!first_name || !last_name || !password1 || !email_address) {
		res.status(400).send({
			Message: "Please provide all required fields - first_name, last_name, password, email_address!"
		});
	} else if (account_created || account_updated || id) {
		res.status(400).send({
			Message: "Fields apart from 'first_name, last_name, password, email_address' should not be in request body !"
		});
	} else {
		var username = credentials.name;
		var password = credentials.pass;

		models.User.findAll({
            where: {
                email_address: username
              }
              }).then(function(result){
				  console.log(result);
				var valid = true;
				valid = bcrypt.compareSync(password, result[0].password) && valid;
				valid = compare(username, email_address) && valid;
				if (valid) {
					console.log("validated");
					bcrypt.hash(password1, saltRounds, function(err, hash) {
						if(err){
							console.log(err);
						}
						else{
						var DBQueryStartTime = timecalculator.TimeInMilliseconds();
						models.User.update({
							first_name : first_name,
							last_name: last_name,
							password: hash,
							account_updated: dateval
						}, {where: {
							email_address: username
						}
						}).then(function(){
							logger.info("User details updated successfully");
							var apiEndTime = timecalculator.TimeInMilliseconds();
							Usermetrics.timing("User.PUT.DBQueryComplete",apiEndTime-DBQueryStartTime);
							Usermetrics.timing("User.PUT.APIComplete",apiEndTime-apiStartTime);
							res.status(204).end();
						}).catch(function(err){
							console.log(err);
							res.status(400).end();
						})
					}
				});
				}else{
					logger.error("User unauthorized");
					res.statusCode = 401
					res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
					res.end('Access denied')
				}
			  }).catch(function(err){
				logger.error("User doesn't exist in system");
				console.log(err);
              });
	}

}