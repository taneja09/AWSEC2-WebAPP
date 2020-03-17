
#!/bin/bash

# This script is executed after the source is copied to the instances
 
cd /home/ubuntu/cddemo
. /etc/environment
npm install

sudo cp /home/ubuntu/cddemo/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/
echo "**********copied cloud config to provided path!*************"

sleep 3

sudo systemctl start cloudwatch.service
echo "***************Reloading the cloudwatch service**************"