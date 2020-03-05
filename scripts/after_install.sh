
#!/bin/bash

# This script is executed after the source is copied to the instances
sudo source ./opt/myvariables.sh
cd /home/ubuntu/cddemo
printenv
npm install