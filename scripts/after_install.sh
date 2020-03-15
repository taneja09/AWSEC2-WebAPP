
#!/bin/bash

# This script is executed after the source is copied to the instances
echo "check the old environment variables"
printenv  
cd /home/ubuntu/cddemo
. /etc/environment
echo "check the new environment variables"
printenv
npm install

sudo cp /home/ubuntu/cddemo/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/
echo "copied cloud config to provided path!"