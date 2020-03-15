#!/bin/bash

# This script is used to stop application
killall -s KILL node
sudo systemctl reload-or-restart cloudwatch.service