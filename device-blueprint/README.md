# Installation
```
# 1. Clone the repo
git clone https://github.com/eclipse-thingweb/node-wot
# 2. cd to the project's root directory
cd node-wot
# 3. Install dependencies 
npm install
# 4. Build the project
npm run build
```
# Run a Script
```
# 1. Run the producer Thing ("server")
node node-wot/packages/cli/dist/cli device.ts 
# 2. Test the Thing
localhost:8080/smart-coffee-machine
```


# OLD
# How to Run

```
docker build -t wot-device . 
docker run -p 3000:3000 wot-device 
```

## How to test authentification

This includes an authheader admin:adminpw
(Authorization: Basic admin:adminpw)

```
$headers = @{ Authorization = "Basic YWRtaW46YWRtaW5wdw==" }
$uri = "http://localhost:3000/property/temperature"
Invoke-WebRequest -Uri $uri -Headers $headers
```