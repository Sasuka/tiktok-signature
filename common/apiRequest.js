const axios = require('axios')
const path = require("path")
require('dotenv').config({ path: path.join(__dirname + `./../.env`) })
let apiKey=process.env.SAPI_KEY || "1ac57dff0e7c120eb967bd6bcec0fd9a"
const urlApi =process.env.SAPI_URL || "http://api.seeding.live/"

const headersConfig = {
    common: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
    },
}

async function getRequest(path, data) {
    const request = await axios.create({
        baseURL: urlApi,
        timeout: 5000,
        headers: headersConfig
    })

    const response = await request.get(`${path}`, {params: data});
    return response.data;
}

module.exports = getRequest
