'use strict';
const uuid = require('uuid/v4');
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
    },
    metaData:{
        allowNull: false,
        type: DataTypes.JSON
}
},
    {
        timestamps: false,
        freezeTableName: true,
        modelName: 'singularName'
    });

return File;
}