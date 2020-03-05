
#!/bin/bash

# This script is executed after the source is copied to the instances

cd /
cp /myvariables.sh /home/ubuntu/cddemo/scripts/myvariables.sh
cd /home/ubuntu/cddemo
chmod +x /scripts/myvariables.sh
. ./scripts/myvariables.sh
printenv
npm install