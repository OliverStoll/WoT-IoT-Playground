#!/bin/bash
# script that extracts the number of devices from scenario and runs a docker container for each device with an increasing id

# get the num devices from config_backup.json with jq
json_file="../../device-blueprint/mount_volume/scenario.json"

echo "$(pwd)"
num_devices=$(jq '.devices | length' $json_file)
echo "Devices: $num_devices"

# Check if the wot-device image is locally available
if ! docker image inspect wot-device &>/dev/null; then
  echo "wot-device image not found locally. Building the image..."
  cd ../device-blueprint || exit
  docker build -t wot-device . &>/dev/null;
  cd - || exit
fi

for (( i=0; i<$num_devices; i++ ))
do
  echo "Running docker id $i"
  port=$((3000 + $i))

  # execute docker run command detached with port mapping and environment variable
  docker run -d -p $port:$port -e PORT=$port -e DEVICE_IDX=$i wot-device
done

sleep 10
