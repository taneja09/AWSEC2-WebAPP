const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const compare = require('tsscmp');
const saltRounds = 10;

exports.create = (req, res) => {
	var id = uuidv4();
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
	if (len < 8 || len > 64) {
		res.status(400).send({
			Message: "Length of Password should be greater than 8 and it should contain only characters !"
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
				console.log("Password can't be hashed !");
			} else {
				var sql = "Insert into `User`(`id`,`first_name`,`last_name`,`password`,`email_address`,`account_created`, `account_updated`)" +
					"VALUES ('" + id + "','" + first_name + "','" + last_name + "','" + hash + "','" + email_address + "','" + dateval + "', '" + dateval + "')";
				var query = db.query(sql, function(err, result) {
					if (err) {
						res.status(400).send("User with this email already exist !");
					} else {
						var sqlQuery = "Select id,first_name,last_name, email_address, account_created, " +
							" account_updated from user where email_address = " + `email_address`;
						db.query(sqlQuery, function(err, result) {
							if (err) {
								console.log("internal err" + err);
								res.send({
									message: "User not created!"
								});
							} else {
								const UserFound = {
									id: result[0].id,
									first_name: result[0].first_name,
									last_name: result[0].last_name,
									email_address: result[0].email_address,
									account_created: result[0].account_created,
									account_updated: result[0].account_updated
								}
								res.status(201).send(UserFound);
							}
						});
					}
				});
			}
		});
	}
}

exports.view = (req, res) => {
	var credentials = auth(req);
	if (!credentials) {
		res.statusCode = 401
		res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
		res.end('Access denied')
	} else {
		var username = credentials.name;
		var password = credentials.pass;
		var sqlQuery = "Select id,first_name,last_name, email_address, password, account_created, " +
			"account_updated from user where email_address = '" + username + "'";

		db.query(sqlQuery, function(err, result) {
			if (err) {
				throw err;
			} else if (result.length > 0) {
				var valid = true;
				var UserFound;

				valid = compare(username, result[0].email_address) && valid;
				valid = bcrypt.compareSync(password, result[0].password) && valid;

				if (valid) {
					UserFound = {
						id: result[0].id,
						first_name: result[0].first_name,
						last_name: result[0].last_name,
						email_address: result[0].email_address,
						account_created: result[0].account_created,
						account_updated: result[0].account_updated
					}
					res.statusCode = 200
					res.send(UserFound);
				} else {
					res.statusCode = 401
					res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
					res.end('Access denied')
				}
			}
		});
	}
}

exports.update = (req, res) => {
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
		var sqlQuery = "Select id,first_name,last_name, password, email_address, account_created, " +
			" account_updated from user where email_address = '" + username + "'";

		db.query(sqlQuery, function(err, result) {
			if (err) {
				throw err;
			} else if (result.length > 0) {
				var valid = true;
				valid = bcrypt.compareSync(password, result[0].password) && valid;
				valid = compare(username, email_address) && valid;
				if (valid) {
					console.log("validated");

					bcrypt.hash(password1, saltRounds, function(err, hash) {
						var sql = "Update user set first_name = '" + first_name + "', last_name = '" + last_name + "'" +
							", password = '" + hash + "', account_updated = '" + dateval + "' where email_address = '" + email_address + "'";
						var query = db.query(sql, function(err, result) {
							if (err) {
								console.log(err);
								res.status(400).end();
							} else {
								res.status(204).end();
							}

						})

					})

				} else {
					res.statusCode = 401
					res.setHeader('WWW-Authenticate', 'Basic realm="user Authentication"')
					res.end('Access denied')
				}

			}

		})

	}

}