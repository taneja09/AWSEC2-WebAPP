#!/bin/bash

# This script is used to stop application
killall -s KILL node
sudo systemctl stop cloudwatch.service
echo "Stooped the cloudwatch service"