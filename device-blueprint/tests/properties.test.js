// write an async test to check if the properties are initialized properly
test("Test properties", async () => {
    let response = await makeRequest("GET", "http://localhost:8080/test-device/properties")
    expect(response.status).toBe(200);
})

// write an async test to check if property is 0
test("Test temperature put", async () => {
    let response = await makeRequest("PUT", "http://localhost:8080/test-device/properties/temperature", 120)
    expect(response.status).toBe(204);

    let response2 = await makeRequest("GET", "http://localhost:8080/test-device/properties/temperature")
    expect(response2.status).toBe(200);
    expect(response2.body).toEqual(120);
})


// funtion to call fetch and get body
async function makeRequest(method = "GET", url, body = undefined) {
    let response = await fetch(url, {method: method, body: body, headers: {"Content-Type": "application/json"}})
    let response_body = undefined;
    if (response.ok && response.status !== 204) {
        response_body = await response.json();
    }
    return {"status": response.status, "body": response_body};
}