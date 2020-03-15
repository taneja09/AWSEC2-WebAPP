
#!/bin/bash

# This script is executed after the source is copied to the instances
echo "check the old environment variables"
printenv  
cd /home/ubuntu/cddemo
. /etc/environment
echo "check the new environment variables"
printenv
npm install

cp /home/ubuntu/cddemo/amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/