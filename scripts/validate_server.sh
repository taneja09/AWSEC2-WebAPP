#!/bin/bash

# This script is used to validate application 
ipaddr=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)
listencount=$(netstat -an | grep 3000 | grep LISTEN | wc -l)
if [ "$listencount" -lt 1 ]; then
    exit 1
else
    cd /home/ubuntu/cddemo
    node node_modules/statsd/stats.js app-metrics/statsd-config.json
    echo "***************Reloading the cloudwatch service**************"

    sudo systemctl reload-or-restart cloudwatch.service
    echo "***************Reloading the cloudwatch service**************"



    exit 0
fi