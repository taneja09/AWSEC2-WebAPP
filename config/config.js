require('dotenv').config();
module.exports = {
  "development": {
    "username": "root",
    "password": "divinity",
    "database": "Clouddb",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  },
  "test": {
    "username": process.env.MYSQL_USERNAME,
    "password": process.env.MYSQL_ROOT_PASSWORD,
    "database": process.env.MYSQL_DATABASE,
    "host": process.env.MYSQL_HOST,
    "dialect": process.env.MYSQL_DIALECT,
    "logging": false,
    "port": process.env.MYSQL_PORT
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"

  }
}
