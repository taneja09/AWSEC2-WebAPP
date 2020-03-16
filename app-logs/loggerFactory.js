'use strict';

const log4js = require('log4js');
let loggerProvider = getDefaultLogProvider();

function getDefaultLogProvider() {
    let level;
    if (process.env.NODE_ENV === 'production') {
        level = log4js.levels.ERROR.levelStr;
    } else if (process.env.NODE_ENV === 'test') {
        level = log4js.levels.INFO.levelStr;
    } else {
        level = log4js.levels.DEBUG.levelStr;
    }

    log4js.configure({
        appenders: { 'file': { type: 'file', filename: 'csye6225.log' } },
        categories: { default: { appenders: ['file'], level } }
      });

    return log4js.getLogger;
} 

module.exports.defaultLogProvider = loggerProvider;