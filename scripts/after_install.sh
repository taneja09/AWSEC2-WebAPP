
#!/bin/bash

# This script is executed after the source is copied to the instances

cd /home/ubuntu/cddemo
. /etc/environment
printenv
npm install