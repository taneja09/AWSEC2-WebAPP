const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'divinity@1202',
    database : 'Cloud_Schema'
  });

module.exports = connection;
