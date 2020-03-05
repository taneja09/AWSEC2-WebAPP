
#!/bin/bash

# This script is executed after the source is copied to the instances
cd /
. ./etc/myvariables.sh
printenv
cd /home/ubuntu/cddemo
printenv
npm install