const axios = require('axios')
const fs = require('fs')

const base_url = 'http://localhost:5001/api'
const pathToConfig = './src/tests/resources/testConfig.json'
const pathToConfigWithExternalDevices = './src/tests/resources/testConfigWithExternalDevices.json'
const pathToPlaybook = './src/tests/resources/testPlaybook.json'

// get property of local device
test('POST /api/playbook', async ()=> {
    await setup(pathToConfigWithExternalDevices)
    const requestObject = fs.readFileSync(pathToPlaybook, 'utf-8')
    console.log(requestObject)
    const response = await axios.post(base_url+'/script', JSON.parse(requestObject))
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 60000)


async function setup(path) {
    const data = fs.readFileSync(path, 'utf-8')
    const response = await axios.post(base_url+'/config', JSON.parse(data))
    if(response.status === 200){
        console.log("Config set up !")
    }
}

async function shutdown(){
    const response = await axios.post(base_url + '/config/shutdown')
    if(response.status === 200){
        console.log("Shut down successfully !")
    }
}