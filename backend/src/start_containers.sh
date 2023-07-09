#!/bin/bash
# script that extracts the number of devices from scenario and runs a docker container for each device
# get the num devices from scenario.json with jq
json_file="../device-blueprint/mount_volume/scenario.json"
# echo if the file exists
if [ -f "$json_file" ]; then
    echo "Scenario File exists."
else
    echo "Scenario File does not exist."
    exit 1
fi
echo "$(pwd)"
num_devices=$(jq '.devices | length' $json_file)
echo "Devices: $num_devices"
# Check if the wot-device image is locally available
echo "Building the image..."
cd ../device-blueprint || exit
docker build -t wot-device .
cd - || exit
for (( i=0; i< $num_devices; i++ ))
do
  device_title=$(jq --raw-output ".devices[$i].title" $json_file)
  device_name=$(echo "$device_title" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
  port=$((3000 + i))
  # execute docker run command detached with port mapping and environment variable
  docker run -d -p $port:$port --name "$device_name" -e PORT=$port -e DEVICE_IDX=$i --network="web-of-things-playground_default" wot-device
  echo "Running docker for device: $device_name"
done
sleep 10
