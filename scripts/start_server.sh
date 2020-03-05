
#!/bin/bash

# This script is used to start the application
cd /home/ubuntu/cddemo
sudo source ./etc/profile.d/myvariables.sh
printenv
node index.js