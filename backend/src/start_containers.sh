#!/bin/bash
# script that extracts the number of devices from scenario and runs a docker container for each device with an increasing id

# get the num devices from config_backup.json with jq
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

for (( i=0; i< num_devices; i++ ))
do
  echo "Running docker id $i"
  port=$((3000 + i))
  # execute docker run command detached with port mapping and environment variable
  docker run -d -p $port:$port --name wot-device-$i -e PORT=$port -e DEVICE_IDX=$i wot-device
done
sleep 10
