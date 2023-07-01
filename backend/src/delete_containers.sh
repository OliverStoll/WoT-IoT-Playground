#!/bin/bash
# Script to stop and remove all Docker containers with the image 'wot-device'
# Stop all containers with the image 'wot-device'
docker stop $(docker ps -aq --filter "ancestor=wot-device") >/dev/null 2>&1
# Remove all containers with the image 'wot-device'
docker rm $(docker ps -aq --filter "ancestor=wot-device") >/dev/null 2>&1
# Delete the Docker image 'wot-device'
docker rmi wot-device >/dev/null 2>&1

echo "All containers with the image 'wot-device' have been stopped and removed."