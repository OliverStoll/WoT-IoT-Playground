#!/bin/bash
# Script to stop and remove all Docker containers with the image 'wot-device'
# Stop and remove all containers with the image 'wot-device'
docker ps -aqf "ancestor=wot-device" | xargs -r docker stop >/dev/null 2>&1
docker ps -aqf "ancestor=wot-device" | xargs -r docker rm >/dev/null 2>&1
# Delete the Docker image 'wot-device'
docker image rm wot-device >/dev/null 2>&1
echo "All containers with the image 'wot-device' have been stopped and removed."