#!/bin/bash

# This script is executed after the source is copied to the instances

cp /myvariables.sh /home/ubuntu/cddemo/scripts/
cd /home/ubuntu/cddemo
source ./myvariables.sh
printenv
npm install