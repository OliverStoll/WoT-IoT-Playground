const axios = require('axios');
// import shell
const shell = require('shelljs');

const base_url = 'http://localhost:3000/coffee-machine';
const base_config = {headers: {'Content-Type': 'application/json'}}

// remove the docker container wot_device_1 before running the test, using a shell command


// Test GET TD
test('GET TD -> [200]', async () => {
    const response = await axios.get(`${base_url}`);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// Test GET properties
test('GET properties -> [200]', async () => {
    const response = await axios.get(`${base_url}/properties`);
    console.log(response.data);
    expect(response.status).toBe(200);
});


test('GET properties -> {temperature: number}', async () => {
    const response = await axios.get(`${base_url}/properties`);

    // check that response.data is a JSON object that contains the property 'temperature'
    expect(response.data).toEqual(expect.objectContaining({temperature: expect.any(Number)}));
});

// Test make request
test('POST make_request -> [200]', async () => {
    let url = `${base_url}/actions/make_request?method=GET&url=${base_url}/properties/temperature`
    const response = await axios.post(url, {}, base_config);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// Test PUT temperature
test('PUT temperature -> [204]', async () => {
    const response = await axios.put(`${base_url}/properties/temperature`, 50, base_config);
    console.log(response.data);
    expect(response.status).toBe(204);
});

// Test GET temperature
test('GET temperature -> [200]', async () => {
    const response = await axios.get(`${base_url}/properties/temperature`);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// Test Action
test('POST Action -> [200]', async () => {
    const response = await axios.post(`${base_url}/actions/brew_coffee`, {}, base_config);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// Test subscribe Event
test('GET subscribe Event & trigger -> [200]', async () => {
    const requestPromise = axios.get(`${base_url}/events/isHot`);

    // Trigger the event by posting to the action
    await axios.post(`${base_url}/actions/brew_coffee`, {}, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Now wait for the event to be triggered and check the response
    const response = await requestPromise;
    console.log(response.data);
    expect(response.status).toBe(200);
});

// For the shutdown endpoint, it's commented out, so no need to test it.

// after 10 seconds, remove the docker container wot_device_1 after running the test, using a shell command
setTimeout(() => {
    shell.exec('docker rm -f wot-device-1');
    },
    1000
)
