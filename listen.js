const http = require("http")
const getRequest = require("./common/apiRequest")
const TikTokSign = require("./index")
const PORT = process.env.PORT || 8083

async function generateSignature(profileId, url) {
    const response = await getRequest('/api/my-profile/detail', {"profile_id": profileId})

    if (response.error === 1) {
        console.log('error');
        throw new Error(response.error_description)
    }

    let data = await response.data

    try {
        let tiktokSign = new TikTokSign(data, url)

        const server = http
            .createServer()
            .listen(PORT)
            .on("listening", function () {
                console.log("TikTok Signature server started on PORT " + PORT);
            });

        await tiktokSign.init()
        server.on("request", (request, response) => {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Headers", "*");

            if (request.method === "OPTIONS") {
                response.writeHead(200);
                response.end();
                return;
            }

            if (request.method === "POST" && request.url === "/signature") {
                var url = "";
                request.on("data", function (chunk) {
                    url += chunk;
                });

                request.on("end", async function () {
                    console.log("Received url: " + url);

                    try {
                        const sign = await tiktokSign.sign(url);
                        const navigator = await tiktokSign.navigator();

                        let output = JSON.stringify({
                            status: "ok",
                            data: {
                                signature: sign.signature,
                                verify_fp: sign.verify_fp,
                                signed_url: sign.signed_url,
                                navigator: navigator,
                            },
                        });
                        response.writeHead(200, { "Content-Type": "application/json" });
                        response.end(output);
                        console.log(output);
                    } catch (err) {
                        console.log(err);
                    }
                });
            } else {
                response.statusCode = 404;
                response.end();
            }
        });


        // await tiktokSign.close();
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = {
    generateSignature
}

generateSignature("5fe552f440e4c72ba5166261", "https://www.tiktok.com/@k.t16061999/video/6955377819274792194?lang=en&is_copy_url=1&is_from_webapp=v1")
