#!/bin/bash

# This script is used to stop application
# echo "*******Stopped the cloudwatch service*********"
# sudo systemctl stop cloudwatch.service

echo "*******Kill Node Service*********"
killall -s KILL node
