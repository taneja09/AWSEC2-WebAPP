'use strict';
const uuid = require('uuid/v4');
var File = require('./file');
module.exports = (sequelize, DataTypes) => {
var Bill = sequelize.define('Bill', {
    id: {
        allowNull: false,
        primaryKey: true,
        unique:true,
        type: DataTypes.UUID
    },
    created_ts:{
        allowNull: false,
        type: DataTypes.STRING
    },
    updated_ts:{
        allowNull: false,
        type: DataTypes.STRING
    },
    vendor:{
        allowNull: false,
        type: DataTypes.STRING
    },
    bill_date:{
        allowNull: false,
        type: DataTypes.STRING
    },
    due_date:{
        allowNull: false,
        type: DataTypes.STRING
    },
    amount_due:{
        allowNull: false,
        type: DataTypes.DOUBLE,
        min: 0.01
    },
    categories: {
        allowNull: false,
        type: DataTypes.STRING
    },
    paymentStatus:{
        allowNull: false,
        type: DataTypes.ENUM('paid', 'due', 'past_due', 'no_payment_required')
    },
    attachment:{
            type: DataTypes.JSON
    }
},
    {
        timestamps: false,
        freezeTableName: true,
        modelName: 'singularName'
    });

    Bill.associate = function(models) {
        models.Bill.hasOne(models.File,{foreignKey:{
            name: 'bill_id',
            allowNull: false,
            unique: true
        }, sourceKey:'id'});
      };

return Bill;
}