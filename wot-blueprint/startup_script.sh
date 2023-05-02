# script that extracts the number of devices from scenario.yml and runs a docker container for each device with an increasing id
num_devices=$(cat scenario.yml | shyaml get-length devices)

echo "Devices: $num_devices"
for (( i=0; i<$num_devices; i++ ))
do
  echo "Running docker id $i"
  # docker run --name device-$i -d my-docker-image
done


sleep 10
