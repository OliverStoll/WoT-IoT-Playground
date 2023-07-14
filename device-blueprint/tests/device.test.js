const axios = require('axios');
// import shell
const shell = require('shelljs');

const base_url = 'http://localhost:3010/coffee-machine';
const docker_url = 'http://host.docker.internal:3010/coffee-machine';
const docker_url_2 = 'http://host.docker.internal:3011/smart-fridge';
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


// Test make request
test('POST make_request (property) -> [200]', async () => {
    let url = `${base_url}/actions/make_request?method=GET&url=${docker_url_2}/properties/waterLevel`
    const response = await axios.post(url, {}, base_config);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// Test make request
test('POST make_request (action) -> [200]', async () => {
    let url = `${base_url}/actions/make_request?method=POST&url=${docker_url_2}/actions/makeIce`
    const response = await axios.post(url, {}, base_config);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// TODO make request set-property
test('POST make_request (set-property) -> [204]', async () => {
    let url = `${docker_url_2}/actions/make_request?method=PUT&body=70&url=${docker_url}/properties/temperature`
    const response = await axios.post(url, {}, base_config);
    console.log(response.data);
    expect(response.status).toBe(200);
});

// For the shutdown endpoint, it's commented out, so no need to test it.

// after 10 seconds, remove the docker container wot_device_1 after running the test, using a shell command

let remove_container = process.env.REMOVE_CONTAINER;

if (remove_container === 'true') {
    setTimeout(() => {
            shell.exec('docker rm -f wot-device-1');
            shell.exec('docker rm -f wot-device-2');
        },
        10000
    )
}
