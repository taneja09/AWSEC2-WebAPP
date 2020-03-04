#!/bin/bash
# sudo chmod 755 /var/www/server.js # optional
# this will restart app/server on instance reboot
crontab -l | { cat; echo "@reboot pm2 start /temp/webapp/index.js -i 0 --name \"webapp\""; } | crontab -
sudo pm2 stop webapp
# actually start the server
sudo pm2 start /var/www/index.js -i 0 --name "webapp"