#!/bin/bash
# script that extracts the number of devices from scenario and runs a docker container for each device with an increasing id

# get the num devices from config.json with jq
json_file="../../wot-blueprint/config.json"
num_devices=$(jq '.devices | length' $json_file)
echo "Devices: $num_devices"

# Check if the wot-device image is locally available
if ! docker image inspect wot-device &>/dev/null; then
  echo "wot-device image not found locally. Building the image..."
  cd ../../wot-blueprint
  docker build -t wot-device . &>/dev/null;
  cd -
fi

for (( i=0; i<$num_devices; i++ ))
do
  echo "Running docker id $i"
  # execute docker run command detached with port mapping and environment variable
  docker run -d -p 300$i:300$i -e PORT=300$i -e DEVICE_IDX=$i wot-device
done

sleep 10