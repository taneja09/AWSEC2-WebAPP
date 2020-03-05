#!/bin/bash
#install node modules
cd /var/webapp/
npm i
# install pm2 to restart node app
npm i -g pm2@2.4.3