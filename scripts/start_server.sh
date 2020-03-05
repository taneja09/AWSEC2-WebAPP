
#!/bin/bash

# This script is used to start the application
cd /home/ubuntu/cddemo
./etc/profile.d/myvariables.sh
printenv
node index.js