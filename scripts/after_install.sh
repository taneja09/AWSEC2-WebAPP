#!/bin/bash

# This script is executed after the source is copied to the instances

cd /home/ubuntu/cddemo
source ./etc/profile.d/myvariables.sh
printenv
npm install