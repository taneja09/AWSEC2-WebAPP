
#!/bin/bash

# This script is executed after the source is copied to the instances
. ./etc/myvariables.sh
cd /home/ubuntu/cddemo
printenv
npm install