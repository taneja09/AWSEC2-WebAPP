#!/bin/bash
# sudo chmod 755 /var/www/server.js # optional
# this will restart app/server on instance reboot
forever stopall
# actually start the server
forever start /home/ubuntu/nodejs/index.js