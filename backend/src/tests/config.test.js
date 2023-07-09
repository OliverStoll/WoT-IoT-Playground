const axios = require('axios')
const fs = require('fs')

const base_url = 'http://localhost:5001/api/config'
const pathToConfig = './resources/testConfig.json'
const pathToConfigWithExternalDevices = './resources/testConfigWithExternalDevices.json'

test('GET /api/config', async ()=> {
    const response = await axios.get(base_url)
    console.log(response.data)
    expect(response.status).toBe(200)
})

test('POST /api/config without external devices', async () => {
    const data = fs.readFileSync(pathToConfig, 'utf-8')
    const response = await axios.post(base_url, JSON.parse(data))
    console.log(response.data)
    expect(response.status).toBe(200)
})

test('POST /api/config with external devices', async () => {
    //reset current config
    await axios.post(base_url + '/shutdown')
    const data = fs.readFileSync(pathToConfigWithExternalDevices, 'utf-8')
    const response = await axios.post(base_url, JSON.parse(data))
    console.log(response.data)
    expect(response.status).toBe(200)
})