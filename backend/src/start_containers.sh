#!/bin/bash
# script that extracts the number of devices from scenario and runs a docker container for each device with an increasing id

# print multiple lines
printf "\n\n\#######   STARTING CONTAINER   #######\n\n\n"

# check if pwd ends with backend/src
if [[ $PWD == *"backend/src" ]]; then
  echo "TEST_SHELL is set to true. Changing directory to backend/"
  cd ..
fi


# get the num devices from config_backup.json with jq
json_file="../device-blueprint/config_backup.json"

# check if the file does not exists
if not [ -f "$json_file" ]; then
    echo "Scenario File does not exist."
    sleep 5
    exit 1
fi

echo "Scenario File exists."
# load the config file as one string

# remove all newlines from the config string
config=$(jq -c . < $json_file)
echo "Config: $config"

echo "$(pwd)"
num_devices=$(jq '.devices | length' $json_file)
echo "Devices: $num_devices"
sleep 1

# Check if the wot-device image is locally available
echo "Building the image..."
sleep 1
cd ../device-blueprint || exit
docker build -t wot-device .
cd - || exit

for (( i=0; i<num_devices; i++ ))
do
  device_title=$(jq --raw-output ".devices[$i].title" $json_file)
  device_name=$(echo "$device_title" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')

  # check if container with device name already exists and remove it
  if [ "$(docker ps -q -f name=${device_name} -f status=exited -f status=running)" ]; then
    # cleanup
    echo "Container already running. Stopping and removing..."
    docker rm -f "${device_name}"
  fi

  port=$((3000 + i))
  # execute docker run command detached with port mapping and environment variable
  docker run -d -p $port:$port --name "$device_name" -e PORT=$port -e DEVICE_IDX=$i -e SCENARIO="$config" --network="web-of-things-playground_default" wot-device
  echo "Running docker for device: $device_name"
done
sleep 10
