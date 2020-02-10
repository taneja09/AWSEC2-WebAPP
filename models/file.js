'use strict';
const uuid = require('uuid/v4');
const Bill = require('./bill');
module.exports = (sequelize, DataTypes) => {
var File = sequelize.define('File', {
    id: {
        allowNull: false,
        primaryKey: true,
        unique:true,
        type: DataTypes.UUID
    },
    file_name:{
        allowNull: false,
        type: DataTypes.STRING
    },
    url:{
        allowNull: false,
        type: DataTypes.STRING
    },
    upload_date:{
        allowNull: false,
        type: DataTypes.STRING
    }
},
    {
        timestamps: false,
        freezeTableName: true,
        modelName: 'singularName'
    });

        File.associate = function(models) {
        models.File.belongsTo(models.Bill,{foreignKey:{
            name: 'bill_id',
            allowNull: false,
        }, sourceKey:'id'});
      };

      Bill.associate = function(models) {
        models.Bill.hasOne(models.File,{foreignKey:{
            name: 'bill_id',
            allowNull: false,
        }, sourceKey:'id'});
      };

return File;
}