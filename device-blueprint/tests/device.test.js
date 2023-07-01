const axios = require('axios');

const base_url = 'http://host.docker.internal:3001/test-device-2';
const base_config = {headers: {'Content-Type': 'application/json'}}

// Test GET TD
test('GET TD -> [200]', async () => {
    const response = await axios.get(`${base_url}`);
    expect(response.status).toBe(200);
});

// Test GET properties
test('GET properties -> [200]', async () => {
    const response = await axios.get(`${base_url}/properties`);
    expect(response.status).toBe(200);
});

// Test make request
test('POST make_request -> [200]', async () => {
    let url = `${base_url}/actions/make_request?method=GET&url=http://localhost:3001/test-device-2/properties/temperature`
    const response = await axios.post(url, {}, base_config);
    expect(response.status).toBe(200);
});

// Test PUT temperature
test('PUT temperature -> [204]', async () => {
    const response = await axios.put(`${base_url}/properties/temperature`, 50, base_config);
    expect(response.status).toBe(204);
});

// Test GET temperature
test('GET temperature -> [200]', async () => {
    const response = await axios.get(`${base_url}/properties/temperature`);
    expect(response.status).toBe(200);
});

// Test Action
test('POST Action -> [200]', async () => {
    const response = await axios.post(`${base_url}/actions/setTemperature?temperature=45`, {}, base_config);
    expect(response.status).toBe(200);
});

// Test subscribe Event
test('GET subscribe Event & trigger -> [200]', async () => {
    const requestPromise = axios.get(`${base_url}/events/temperatureSet`);

    // Trigger the event by posting to the action
    await axios.post(`${base_url}/actions/setTemperature?temperature=45`, {}, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Now wait for the event to be triggered and check the response
    const response = await requestPromise;
    expect(response.status).toBe(200);
});

// For the shutdown endpoint, it's commented out, so no need to test it.
