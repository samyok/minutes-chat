import * as playwright from 'playwright-aws-lambda';
import cacheData from 'memory-cache';

module.exports = async (req, res) => {
    let browser = null;
    let waitTime = req.query.wait ?? 0;
    let url = getAbsoluteURL(req.query.url);

    if (cacheData.get(url)) {
        res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('X-Memcache-Status', 'HIT');
        return res.status(200).send(cacheData.get(url));
    }

    const { query } = req;
    try {
        if (query.url && isValidUrl(url)) {
            browser = await playwright.launchChromium({ headless: true });
            const context = await browser.newContext({
                viewport: {
                    width: 1200,
                    height: 630,
                },
            });
            const page = await context.newPage();
            await page.goto(url);
            await sleep(waitTime);
            const screenshot = await page.screenshot({ type: 'png' });
            res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('X-Memcache-Status', 'MISS');
            res.status(200).send(screenshot);
            cacheData.put(url, screenshot, 7 * 24 * 1000 * 60 * 60); // cache for a week
        } else throw 'Please provide a valid url';
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'Failed',
            error,
        });
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};

const sleep = n => new Promise(r => setTimeout(r, n));

function isValidUrl(string) {
    try {
        new URL(string);
    } catch (_) {
        return false;
    }
    return true;
}

const getAbsoluteURL = (path) => {
    const baseURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    return baseURL + path;
};
