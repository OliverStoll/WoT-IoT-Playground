const axios = require('axios')
const fs = require('fs')

const base_url = 'http://localhost:5001/api/config'
const pathToConfig = './src/tests/resources/testConfig.json'
const pathToConfigWithExternalDevices = './src/tests/resources/testConfigWithExternalDevices.json'

test('GET /api/config', async ()=> {
    const response = await axios.get(base_url)
    console.log(response.data)
    expect(response.status).toBe(200)
})

test('POST /api/config without external devices', async () => {
    const data = fs.readFileSync(pathToConfig, 'utf-8')
    const response = await axios.post(base_url, JSON.parse(data))
    expect(response.data).toEqual('Config was processed!')
    console.log(response.data)
    expect(response.status).toBe(200)
    // remove images after test
    await axios.post(base_url + '/shutdown')
}, 30000)

test('POST /api/config with external devices', async () => {
    const data = fs.readFileSync(pathToConfigWithExternalDevices, 'utf-8')
    const response = await axios.post(base_url, JSON.parse(data))
    console.log(response.data)
    expect(response.status).toBe(200)
    await axios.post(base_url + '/shutdown')
}, 30000)

test('POST /api/config with invalid config', async ()=>{
    let dataWrong = "{'wrongConfig'= true}"
    let response
    try {
        response = await axios.post(base_url, JSON.parse(dataWrong))
    } catch (error) {
        console.log(error)
    }
    expect(response.status).toBe(400)
})