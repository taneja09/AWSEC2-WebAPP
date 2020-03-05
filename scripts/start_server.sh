
#!/bin/bash

# This script is used to start the application
cd /home/ubuntu/cddemo
pm2 start index.js -i 0 --name "webapp"