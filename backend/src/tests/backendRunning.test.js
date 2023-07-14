const axios = require('axios')

const backend_url = 'http://localhost:5001'
test('GET /', async ()=> {
    const response = await axios.get(backend_url)
    console.log(response.data)
    expect(response.data).toBe("Success: backend is running")
    expect(response.status).toBe(200)
})