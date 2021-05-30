const {devices, chromium} = require("playwright-chromium")
const Utils = require("./common/utils")

class TiktokSign {
    profileId = null
    viewPort = null
    windowSize = "1920,1080"
    browser = null

    userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (Windows NT 10.0; Win64; x64) Chrome/90.0.4430.85 Safari/537.36";

    args = [
        // "--headless",
        `--no-sandbox`,
        '--disable-setuid-sandbox',
        "--disable-blink-features",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--start-maximized",
    ];
    // Default TikTok loading page
    default_url = "https://www.tiktok.com/@rihanna?lang=en";

    constructor(profile, url) {
        if (url)
            this.default_url = url

        if (profile.user_agent)
            this.args.push(`--user-agent="${profile.user_agent.name}"`)

        this.profileId = profile._id
        let viewPort = profile.resolution
        this.windowSize = `"${viewPort.width},${viewPort.height}"`
        this.args.push(`--window-size=${this.windowSize}`)

        this.options = {
            args: this.args,
            ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
            ignoreHTTPSErrors: true,
        }
        this.browser = null
    }

    async init() {
        this.browser = await chromium.launch(this.options)
        this.context = await this.browser.newContext()

        let LOAD_SCRIPTS = ["signer.js"];
        LOAD_SCRIPTS.forEach(async (script) => {
            await this.context.addInitScript({
                path: `${__dirname}/javascript/${script}`,
            });
        });

        this.page = await this.context.newPage();
        await this.page.goto(this.default_url, {
            waitUntil: "load",
        });

        await this.page.evaluate(() => {
            if (typeof window.byted_acrawler.sign !== "function") {
                throw "No signature function found";
            }

            window.generateSignature = function generateSignature(url) {
                return window.byted_acrawler.sign({url: url});
            };
        });
        return this;
    }

    async navigator() {
        // Get the "viewport" of the page, as reported by the page.
        const info = await this.page.evaluate(() => {
            return {
                // width: document.documentElement.clientWidth,
                // height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio,
                user_agent: window.navigator.userAgent,
                browser_language: window.navigator.language,
                browser_platform: window.navigator.platform,
                browser_name: window.navigator.appCodeName,
                browser_version: window.navigator.appVersion,
            };
        });
        return info;
    }

    async sign(url) {
        // generate valid verifyFp
        let verify_fp = Utils.generateVerifyFp();
        let newUrl = url + "&verifyFp=" + verify_fp;
        let token = await this.page.evaluate(`generateSignature("${newUrl}")`);
        let signed_url = newUrl + "&_signature=" + token;
        return {
            signature: token,
            verify_fp: verify_fp,
            signed_url: signed_url,
        };
    }

    async close() {
        await this.browser.close()
        if (this.browser) {
            this.browser = null
            this.page = null
        }
    }
}

module.exports = TiktokSign
