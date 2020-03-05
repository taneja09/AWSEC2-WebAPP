#!/bin/bash

# This script is executed before copying the source
npm install -g pm2
pm2 update

export app_root=/home/ubuntu/cddemo
if [ -d "$app_root" ];then
    rm -rf /home/ubuntu/cddemo
    mkdir -p /home/ubuntu/cddemo
else
    mkdir -p /home/ubuntu/cddemo
fi