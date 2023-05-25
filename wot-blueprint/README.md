# How to Run

```
docker build -t wot-device . 
docker run -p 3000:3000 wot-device 
```

## How to test authentification

This includes an authheader admin:adminpw

```
$headers = @{ Authorization = "Basic YWRtaW46YWRtaW5wdw==" }
$uri = "http://localhost:3000/property/temperature"
Invoke-WebRequest -Uri $uri -Headers $headers
```