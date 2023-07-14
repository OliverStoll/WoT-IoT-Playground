const axios = require('axios')
const fs = require('fs')

const base_url = 'http://localhost:5001/api/'
const pathToConfig = './src/tests/resources/testConfig.json'
const pathToConfigWithExternalDevices = './src/tests/resources/testConfigWithExternalDevices.json'

// get logs after creating

test('GET /api/logs without config', async () => {
    const response = await axios.get(base_url+'logs')
    console.log(response.data)
    expect(response.data).toEqual('No logs available yet')
    expect(response.status).toBe(200)
})
test('Get /api/logs after creating', async ()=> {
    await setup(pathToConfig)
    const response = await axios.get(base_url+'logs')
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)


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