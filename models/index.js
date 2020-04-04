'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV||"development";
const config = require(__dirname + '/../config/config.js')[env];
const db = {};
const rdsCa = fs.readFileSync(__dirname + '/../certificates/rds-combined-ca-bundle.pem');

let sequelize;
console.log(config);
// if (config.env == "test") {
//   sequelize = new Sequelize(process.env[config.env], config);
// } else {
  sequelize = new Sequelize(config.database, config.username, config.password, config,{
    dialectOptions: {
      ssl: 'Amazon RDS'
    }
  });
//}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
