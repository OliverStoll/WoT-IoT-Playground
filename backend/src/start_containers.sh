#!/bin/bash

# script that extracts the number of devices from scenario and runs a docker container for each device with an increasing id

# get the num devices from config.yml with shyaml
# num_devices=$(cat config.yml | shyaml get-length devices)

# get the num devices from config.json with jq
json_file="config.json"
num_devices=$(jq '.devices | length' $json_file)
echo "Devices: $num_devices"

for (( i=0; i<$num_devices; i++ ))
do
  echo "Running docker id $i"
  # execute docker run command detached with port mapping and environment variable
  docker run -d -p 300$i:300$i -e PORT=300$i wot-device
done


sleep 10

