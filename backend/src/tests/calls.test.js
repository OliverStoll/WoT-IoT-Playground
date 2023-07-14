const axios = require('axios')
const fs = require('fs')

const base_url = 'http://localhost:5001/api/'
const pathToConfig = './src/tests/resources/testConfig.json'
const pathToConfigWithExternalDevices = './src/tests/resources/testConfigWithExternalDevices.json'

// get property of local device
test('POST /api/calls property of local device', async ()=> {
    await setup(pathToConfig)
    const requestObject = {
        href: "http://localhost:3000/coffee-machine/properties/temperature",
    }
    const response = await axios.post(base_url, requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// put property of local device

// call action of local device

// get property remote device

// call action remote device

// get property of another device

// call action of another device

// subscribe for event of another device

async function setup(path) {
    const data = fs.readFileSync(path, 'utf-8')
    const response = await axios.post(base_url+'config', JSON.parse(data))
    if(response.status === 200){
        console.log("Config set up !")
    }
}

async function shutdown(){
    const response = await axios.post(base_url + 'config/shutdown')
    if(response.status === 200){
        console.log("Shut down successfully !")
    }
}