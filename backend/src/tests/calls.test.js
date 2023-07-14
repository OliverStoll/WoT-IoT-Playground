const axios = require('axios')
const fs = require('fs')

const base_url = 'http://localhost:5001/api'
const pathToConfig = './src/tests/resources/testConfig.json'
const pathToConfigWithExternalDevices = './src/tests/resources/testConfigWithExternalDevices.json'

// get property of local device
test('POST /api/calls property of local device', async ()=> {
    await setup(pathToConfig)
    const requestObject = {
        href:"http://localhost:3000/coffee-machine/properties/temperature",
        contentType:"application/json",
        op:["readproperty","writeproperty"],
        sender:"controller"
    }
    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// put property of local device
test('PUT /api/calls property of local device', async ()=> {
    await setup(pathToConfig)
    const requestObject = {
        "href":"http://localhost:3000/coffee-machine/properties/temperature",
        "contentType":"application/json",
        "op":["readproperty","writeproperty"],
        "value":33,
        "sender":"controller",
        "htv:methodName":"PUT"}
    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// call action of local device
test('POST /api/calls action of local device', async ()=> {
    await setup(pathToConfig)
    const requestObject = {
        "href":"http://localhost:3000/coffee-machine/actions/brew_coffee","contentType":"application/json","op":["invokeaction"],"htv:methodName":"POST","sender":"controller"}
    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// get property remote device
test('POST /api/calls property of remote device', async ()=> {
    await setup(pathToConfigWithExternalDevices)
    const requestObject = {"href":"http://plugfest.thingweb.io:8083/smart-coffee-machine/properties/possibleDrinks","contentType":"application/json","op":["readproperty"],"htv:methodName":"GET","sender":"controller"}

    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// call action remote device
test('POST /api/calls property of remote device', async ()=> {
    await setup(pathToConfigWithExternalDevices)
    const requestObject = {"href":"http://plugfest.thingweb.io:8083/smart-coffee-machine/actions/makeDrink?drinkId=espresso&size=s&quantity=3","contentType":"application/json","op":["invokeaction"],"htv:methodName":"POST","sender":"controller"}

    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// get property of another device
test('POST /api/calls property of another device', async ()=> {
    await setup(pathToConfigWithExternalDevices)
    const requestObject = {"href":"http://localhost:3000/coffee-machine/actions/make_request?method=GET&url=http://localhost:3001/smart-fridge/properties/milkBottles","contentType":"application/json","op":["readproperty","writeproperty"],"htv:methodName":"POST","sender":"urn:uuid:b1b27144-21b9-4e45-8523-2af1b8d6b932"}
    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)


// call action of another device
test('POST /api/calls action of another device', async ()=> {
    await setup(pathToConfigWithExternalDevices)
    const requestObject = {"href":"http://localhost:3000/coffee-machine/actions/make_request?method=POST&url=http://localhost:3001/smart-fridge/actions/makeIce","contentType":"application/json","op":["invokeaction"],"htv:methodName":"POST","sender":"urn:uuid:b1b27144-21b9-4e45-8523-2af1b8d6b932"}
    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)

// subscribe for event of another device
test('POST /api/calls event of another device', async ()=> {
    await setup(pathToConfigWithExternalDevices)
    const requestObject = {"href":"http://localhost:3000/coffee-machine/actions/make_request?method=POST&url=http://localhost:3001/smart-fridge/events/waterLevelLow","contentType":"application/json","subprotocol":"longpoll","op":["subscribeevent","unsubscribeevent"],"sender":"urn:uuid:b1b27144-21b9-4e45-8523-2af1b8d6b932"}
    const response = await axios.post(base_url+'/call', requestObject)
    console.log(response.data)
    expect(response.status).toBe(200)
    await shutdown()
}, 30000)


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