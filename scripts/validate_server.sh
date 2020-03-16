#!/bin/bash

# This script is used to validate application 
ipaddr=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)
listencount=$(netstat -an | grep 3000 | grep LISTEN | wc -l)
if [ "$listencount" -lt 1 ]; then
    exit 1
else
    sudo systemctl reload-or-restart cloudwatch.service
    echo "***************Reloading the cloudwatch service**************"

    cd /home/ubuntu/cddemo
    node node_modules/statsd/stats.js app-metrics/statsd-config.json > /dev/null 2> /dev/null < /dev/null &
    echo "***************Reloading the cloudwatch service**************"

    exit 0
fi